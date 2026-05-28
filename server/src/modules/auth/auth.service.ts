import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';
import { env } from '../../config/env';
import { z } from 'zod';
import { registerSchema, loginSchema } from './auth.schema';

type RegisterInput = z.infer<typeof registerSchema>;

function signAccess(userId: string, role: string, email: string) {
  return jwt.sign({ userId, role, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

function signRefresh(userId: string) {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('EMAIL_IN_USE');

  const hashed = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      ...(data.role === 'patient' && {
        patient: {
          create: {
            dob: data.dob!,
            gender: data.gender!,
            condition: data.condition!,
            weight: data.weight,
            height: data.height,
          },
        },
      }),
      ...(data.role === 'doctor' && {
        doctor: {
          create: {
            specialty: data.specialty!,
            license: data.license!,
            hospital: data.hospital!,
            city: data.city,
          },
        },
      }),
    },
    include: { patient: true, doctor: true },
  });

  const accessToken = signAccess(user.id, user.role, user.email);
  const refreshToken = signRefresh(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function loginUser(data: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { patient: true, doctor: true },
  });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const accessToken = signAccess(user.id, user.role, user.email);
  const refreshToken = signRefresh(user.id);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  if (!stored || stored.expiresAt < new Date()) throw new Error('INVALID_REFRESH_TOKEN');

  const accessToken = signAccess(stored.user.id, stored.user.role, stored.user.email);
  return { accessToken };
}

export async function logoutUser(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}
