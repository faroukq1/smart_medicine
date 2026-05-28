import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as devicesController from './devices.controller';

export const devicesRouter = Router();

devicesRouter.use(authenticate);

devicesRouter.post('/',                    devicesController.registerDevice);
devicesRouter.get('/patient/:patientId',   devicesController.getPatientDevice);
devicesRouter.patch('/:deviceId/connect',  devicesController.markConnected);
devicesRouter.patch('/:deviceId/disconnect', devicesController.markDisconnected);
devicesRouter.delete('/:deviceId',         devicesController.deleteDevice);
