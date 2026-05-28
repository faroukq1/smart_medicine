import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerStep1Schema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
  phone: z.string().min(1, 'Téléphone requis'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const registerStep2PatientSchema = z.object({
  dob: z.string().min(1, 'Date de naissance requise'),
  gender: z.enum(['Homme', 'Femme', 'Autre'], {
    message: 'Genre requis',
  }),
  weight: z.string().optional(),
  height: z.string().optional(),
  condition: z.enum([
    'Diabète Type 1', 'Diabète Type 2', 'Hypertension',
    'Insuffisance cardiaque', 'Asthme', 'Autre',
  ], { message: 'Condition requise' }),
});

export const registerStep2DoctorSchema = z.object({
  specialty: z.enum([
    'Cardiologie', 'Diabétologie', 'Médecine générale',
    'Neurologie', 'Pneumologie', 'Autre',
  ], { message: 'Spécialité requise' }),
  license: z.string().min(1, 'Numéro de licence requis'),
  hospital: z.string().min(1, 'Hôpital requis'),
  city: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1FormData = z.infer<typeof registerStep1Schema>;
export type RegisterStep2PatientFormData = z.infer<typeof registerStep2PatientSchema>;
export type RegisterStep2DoctorFormData = z.infer<typeof registerStep2DoctorSchema>;
