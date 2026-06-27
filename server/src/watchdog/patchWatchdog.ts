import { prisma } from "../prisma/client";
import { sseManager } from "../sse/sse.manager";

const TIMEOUT_MS = 3000;

export function startPatchWatchdog(): void {
  setInterval(async () => {
    const threshold = new Date(Date.now() - TIMEOUT_MS);

    const stalePatients = await prisma.patient.findMany({
      where: {
        patchConnected: true,
        lastVitalAt: { lt: threshold },
      },
    });

    for (const patient of stalePatients) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { patchConnected: false },
      });
      sseManager.broadcast(patient.id, {
        type: "patch",
        connected: false,
      });
      console.log(
        `⚠️  Patient ${patient.id} patch timed out — marked disconnected`,
      );
    }
  }, TIMEOUT_MS);
}
