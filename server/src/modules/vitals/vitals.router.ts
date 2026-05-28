import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { ingestVitalSchema } from './vitals.schema';
import { authenticate } from '../../middleware/auth.middleware';
import { deviceApiKeyAuth } from '../../middleware/deviceApiKey.middleware';
import * as vitalsController from './vitals.controller';

export const vitalsRouter = Router();

vitalsRouter.post('/ingest', deviceApiKeyAuth, validate(ingestVitalSchema), vitalsController.ingest);

vitalsRouter.get('/:patientId',        authenticate, vitalsController.getVitals);
vitalsRouter.get('/:patientId/latest', authenticate, vitalsController.getLatest);
vitalsRouter.get('/:patientId/stream', authenticate, vitalsController.streamVitals);
