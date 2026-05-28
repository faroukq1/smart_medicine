import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as usersController from './users.controller';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.getMe);
