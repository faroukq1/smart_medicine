import { prisma } from '../../prisma/client';

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { patient: { include: { device: true } }, doctor: true },
  });
  if (!user) throw new Error('USER_NOT_FOUND');
  const { password: _, ...safeUser } = user;
  return safeUser;
}
