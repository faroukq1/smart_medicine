import { Request, Response, NextFunction } from 'express';
import * as devicesService from './devices.service';
import { sseManager } from '../../sse/sse.manager';

export async function registerDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const { patientId, patchId, macAddress } = req.body;
    const device = await devicesService.registerDevice(patientId, patchId, macAddress);
    res.status(201).json(device);
  } catch (e) {
    next(e);
  }
}

export async function getPatientDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const device = await devicesService.getPatientDevice(String(req.params.patientId));
    res.json(device);
  } catch (e) {
    next(e);
  }
}

export async function markConnected(req: Request, res: Response, next: NextFunction) {
  try {
    const device = await devicesService.markConnected(String(req.params.deviceId));
    sseManager.broadcast(device.patientId, { type: 'device', device });
    res.json(device);
  } catch (e) {
    next(e);
  }
}

export async function markDisconnected(req: Request, res: Response, next: NextFunction) {
  try {
    const device = await devicesService.markDisconnected(String(req.params.deviceId));
    sseManager.broadcast(device.patientId, { type: 'device', device });
    res.json(device);
  } catch (e) {
    next(e);
  }
}

export async function deleteDevice(req: Request, res: Response, next: NextFunction) {
  try {
    await devicesService.deleteDevice(String(req.params.deviceId));
    res.json({ message: 'Device deleted' });
  } catch (e) {
    next(e);
  }
}
