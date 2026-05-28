import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const deviceApiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['x-api-key'];
  if (!key || key !== env.DEVICE_API_KEY) {
    res.status(401).json({ error: 'Invalid device API key' });
    return;
  }
  next();
};
