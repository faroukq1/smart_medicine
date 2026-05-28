import { z } from 'zod';

export const ingestVitalSchema = z.object({
  patientId:   z.string().min(1),
  glucose:     z.number().optional(),
  heartRate:   z.number().optional(),
  temperature: z.number().optional(),
  oxygen:      z.number().optional(),
  systolic:    z.number().int().optional(),
  diastolic:   z.number().int().optional(),
  batteryPct:  z.number().int().min(0).max(100).optional(),
  firmwareVer: z.string().optional(),
  recordedAt:  z.string().datetime().optional(),
  fallDetected: z.boolean().optional(),
});

export const queryVitalsSchema = z.object({
  from:  z.string().datetime().optional(),
  to:    z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});
