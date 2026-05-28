import { Request, Response, NextFunction } from 'express';
import * as patientsService from './patients.service';

export async function getAllPatients(req: Request, res: Response, next: NextFunction) {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 30;
    const result = await patientsService.getAllPatients(cursor, limit);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getPatientById(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await patientsService.getPatientById(String(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (e) {
    next(e);
  }
}
