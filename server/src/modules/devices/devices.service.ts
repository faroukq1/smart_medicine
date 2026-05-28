import { prisma } from '../../prisma/client';

export async function registerDevice(patientId: string, patchId: string, macAddress?: string) {
  return prisma.device.upsert({
    where: { patientId },
    create: { patientId, patchId, macAddress, connected: false },
    update: { patchId, macAddress },
  });
}

export async function getPatientDevice(patientId: string) {
  return prisma.device.findUnique({ where: { patientId } });
}

export async function markConnected(deviceId: string) {
  return prisma.device.update({
    where: { id: deviceId },
    data: { connected: true, lastSeen: new Date() },
  });
}

export async function markDisconnected(deviceId: string) {
  return prisma.device.update({
    where: { id: deviceId },
    data: { connected: false },
  });
}

export async function deleteDevice(deviceId: string) {
  return prisma.device.delete({ where: { id: deviceId } });
}
