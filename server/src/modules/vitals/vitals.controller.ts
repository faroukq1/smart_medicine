import { Request, Response, NextFunction } from 'express';
import * as vitalsService from './vitals.service';
import { sseManager } from '../../sse/sse.manager';

export async function ingest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vitalsService.ingestVital(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    if (e.message === 'PATIENT_NOT_FOUND') return res.status(404).json({ error: 'Patient not found' });
    next(e);
  }
}

export async function getVitals(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = String(req.params.patientId);
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await vitalsService.getPatientVitals(patientId, cursor, limit);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getLatest(req: Request, res: Response, next: NextFunction) {
  try {
    const vital = await vitalsService.getLatestVital(String(req.params.patientId));
    res.json(vital);
  } catch (e) {
    next(e);
  }
}

export function streamVitals(req: Request, res: Response) {
  const patientId = String(req.params.patientId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = sseManager.addClient(patientId, res);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseManager.removeClient(patientId, clientId);
  });
}
