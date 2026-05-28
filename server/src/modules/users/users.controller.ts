import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.user!.id);
    res.json(user);
  } catch (e) {
    next(e);
  }
}
