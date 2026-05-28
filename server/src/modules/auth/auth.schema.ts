import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  role: z.enum(['patient', 'doctor']),

  dob: z.string().optional(),
  gender: z.string().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  condition: z.string().optional(),

  specialty: z.string().optional(),
  license: z.string().optional(),
  hospital: z.string().optional(),
  city: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'patient') {
    if (!data.dob) ctx.addIssue({ path: ['dob'], code: 'custom', message: 'Required for patient' });
    if (!data.gender) ctx.addIssue({ path: ['gender'], code: 'custom', message: 'Required for patient' });
    if (!data.condition) ctx.addIssue({ path: ['condition'], code: 'custom', message: 'Required for patient' });
  }
  if (data.role === 'doctor') {
    if (!data.specialty) ctx.addIssue({ path: ['specialty'], code: 'custom', message: 'Required for doctor' });
    if (!data.license) ctx.addIssue({ path: ['license'], code: 'custom', message: 'Required for doctor' });
    if (!data.hospital) ctx.addIssue({ path: ['hospital'], code: 'custom', message: 'Required for doctor' });
  }
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
