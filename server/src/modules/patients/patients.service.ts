import { prisma } from '../../prisma/client';

export async function getPatientById(patientId: string) {
  return prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: true, device: true },
  });
}

export async function getAllPatients(cursor?: string, limit = 30) {
  const take = Math.min(limit, 50);

  const patients = await prisma.patient.findMany({
    include: { user: true, device: true },
    orderBy: { id: 'asc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = patients.length > take;
  if (hasMore) patients.pop();

  return {
    data: patients,
    nextCursor: hasMore ? patients[patients.length - 1]?.id : null,
    hasMore,
  };
}
