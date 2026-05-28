import { Response } from 'express';
import { randomUUID } from 'crypto';

type SseClient = { id: string; res: Response };

class SseManager {
  private clients: Map<string, SseClient[]> = new Map();

  addClient(patientId: string, res: Response): string {
    const id = randomUUID();
    const existing = this.clients.get(patientId) ?? [];
    this.clients.set(patientId, [...existing, { id, res }]);
    console.log(`SSE client ${id} subscribed to patient ${patientId}`);
    return id;
  }

  removeClient(patientId: string, clientId: string): void {
    const existing = this.clients.get(patientId) ?? [];
    this.clients.set(patientId, existing.filter((c) => c.id !== clientId));
  }

  broadcast(patientId: string, data: object): void {
    const clients = this.clients.get(patientId) ?? [];
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      client.res.write(payload);
    }
  }
}

export const sseManager = new SseManager();
