import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as patientsController from './patients.controller';

export const patientsRouter = Router();

patientsRouter.use(authenticate);

patientsRouter.get('/',         requireRole('doctor'), patientsController.getAllPatients);
patientsRouter.get('/:id',     patientsController.getPatientById);
