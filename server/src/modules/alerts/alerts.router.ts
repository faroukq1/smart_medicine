import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as alertsController from './alerts.controller';

export const alertsRouter = Router();

alertsRouter.use(authenticate);

alertsRouter.get('/patient/:patientId',        alertsController.getPatientAlerts);
alertsRouter.patch('/:alertId/resolve',        alertsController.resolveAlert);
alertsRouter.delete('/patient/:patientId/clear', alertsController.clearResolved);
