import { prisma } from '../../prisma/client';
import { sseManager } from '../../sse/sse.manager';
import { z } from 'zod';
import { ingestVitalSchema } from './vitals.schema';

type IngestInput = z.infer<typeof ingestVitalSchema>;

const THRESHOLDS: Record<string, { low: number | null; high: number | null }> = {
  glucose:     { low: 80,  high: 130 },
  heartRate:   { low: 55,  high: 100 },
  temperature: { low: 36.0, high: 37.5 },
  oxygen:      { low: 95,  high: null },
  systolic:    { low: 100, high: 135 },
  diastolic:   { low: 65,  high: 85 },
};

function metricLabel(metric: string): string {
  const labels: Record<string, string> = {
    glucose: 'Glycémie',
    heartRate: 'Fréquence cardiaque',
    temperature: 'Température',
    oxygen: 'Saturation O₂',
    systolic: 'Pression systolique',
    diastolic: 'Pression diastolique',
  };
  return labels[metric] ?? metric;
}

export async function ingestVital(data: IngestInput) {
  const patientId = data.patientId;

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('PATIENT_NOT_FOUND');

  const vital = await prisma.vital.create({
    data: {
      patientId,
      glucose:     data.glucose,
      heartRate:   data.heartRate,
      temperature: data.temperature,
      oxygen:      data.oxygen,
      systolic:    data.systolic,
      diastolic:   data.diastolic,
      fallDetected: data.fallDetected ?? false,
      recordedAt:  data.recordedAt ? new Date(data.recordedAt) : new Date(),
    },
  });

  // Mark patch as connected — each incoming vital resets the watchdog timer
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      patchConnected: true,
      lastVitalAt: new Date(),
    },
  });

  const alerts = await checkThresholds(patientId, vital);

  if (data.fallDetected) {
    const fallAlert = await prisma.alert.create({
      data: {
        patientId,
        type: 'critical',
        message: 'Chute détectée !',
        metric: 'fall',
        value: 1,
      },
    });
    alerts.push(fallAlert);
  }

  sseManager.broadcast(patientId, {
    type: 'vital',
    vital,
    alerts,
  });

  // Real-time patch status update to client
  sseManager.broadcast(patientId, {
    type: 'patch',
    connected: true,
  });

  return { vital, alerts };
}

async function checkThresholds(patientId: string, vital: any) {
  const created: any[] = [];

  for (const [metric, bounds] of Object.entries(THRESHOLDS)) {
    const value = vital[metric];
    if (value == null) continue;

    let triggered = false;
    let type = 'warning';
    let message = '';

    if (bounds.low != null && value < bounds.low) {
      triggered = true;
      type = metric === 'oxygen' ? 'critical' : 'warning';
      message = `${metricLabel(metric)} bas : ${value}`;
    } else if (bounds.high != null && value > bounds.high) {
      triggered = true;
      type = value > bounds.high * 1.2 ? 'critical' : 'warning';
      message = `${metricLabel(metric)} élevé : ${value}`;
    }

    if (triggered) {
      const alert = await prisma.alert.create({
        data: { patientId, type, message, metric, value },
      });
      created.push(alert);
    }
  }

  return created;
}

export async function getPatientVitals(patientId: string, cursor?: string, limit = 20) {
  const take = Math.min(limit, 50);

  const vitals = await prisma.vital.findMany({
    where: { patientId },
    orderBy: { recordedAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = vitals.length > take;
  if (hasMore) vitals.pop();

  return {
    data: vitals,
    nextCursor: hasMore ? vitals[vitals.length - 1]?.id : null,
    hasMore,
  };
}

export async function getLatestVital(patientId: string) {
  return prisma.vital.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}
