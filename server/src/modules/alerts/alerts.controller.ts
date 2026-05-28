import { Request, Response, NextFunction } from 'express';
import * as alertsService from './alerts.service';

export async function getPatientAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;
    const metricParam = req.query.metric as string | undefined;
    const metrics = metricParam ? metricParam.split(',').filter(Boolean) : undefined;
    const alerts = await alertsService.getPatientAlerts(String(req.params.patientId), false, cursor, limit, metrics);
    res.json(alerts);
  } catch (e) {
    next(e);
  }
}

export async function resolveAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const alert = await alertsService.resolveAlert(String(req.params.alertId));
    res.json(alert);
  } catch (e) {
    next(e);
  }
}

export async function clearResolved(req: Request, res: Response, next: NextFunction) {
  try {
    await alertsService.clearResolved(String(req.params.patientId));
    res.json({ message: 'Resolved alerts cleared' });
  } catch (e) {
    next(e);
  }
}
