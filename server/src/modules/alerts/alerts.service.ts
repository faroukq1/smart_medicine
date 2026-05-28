import { prisma } from '../../prisma/client';

export async function getPatientAlerts(patientId: string, resolved = false, cursor?: string, limit = 20, metrics?: string[]) {
  const take = Math.min(limit, 50);

  const alerts = await prisma.alert.findMany({
    where: {
      patientId,
      resolved,
      ...(metrics && metrics.length > 0 ? { metric: { in: metrics } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = alerts.length > take;
  if (hasMore) alerts.pop();

  return {
    data: alerts,
    nextCursor: hasMore ? alerts[alerts.length - 1]?.id : null,
    hasMore,
  };
}

export async function resolveAlert(alertId: string) {
  return prisma.alert.update({ where: { id: alertId }, data: { resolved: true } });
}

export async function clearResolved(patientId: string) {
  return prisma.alert.deleteMany({ where: { patientId, resolved: true } });
}
