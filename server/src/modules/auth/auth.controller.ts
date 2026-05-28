import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (e: any) {
    if (e.message === 'EMAIL_IN_USE') return res.status(409).json({ error: 'Email already in use' });
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (e: any) {
    if (e.message === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid email or password' });
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.json(result);
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logoutUser(req.body.refreshToken);
    res.json({ message: 'Logged out' });
  } catch (e) {
    next(e);
  }
}
