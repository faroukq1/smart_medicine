import { prisma } from "../prisma/client";
import { sseManager } from "../sse/sse.manager";

const TIMEOUT_MS = 2000;

export function startPatchWatchdog(): void {
  setInterval(async () => {
    const threshold = new Date(Date.now() - TIMEOUT_MS);

    const staleDevices = await prisma.device.findMany({
      where: {
        connected: true,
        lastSeen: { lt: threshold },
      },
    });

    for (const device of staleDevices) {
      const updated = await prisma.device.update({
        where: { id: device.id },
        data: { connected: false },
      });
      sseManager.broadcast(device.patientId, {
        type: "device",
        device: updated,
      });
      console.log(
        `⚠️  Patch ${device.patchId} timed out — marked disconnected`,
      );
    }
  }, TIMEOUT_MS);
}
