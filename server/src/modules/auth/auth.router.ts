import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login',    validate(loginSchema),    authController.login);
authRouter.post('/refresh',  validate(refreshSchema),  authController.refresh);
authRouter.post('/logout',   validate(refreshSchema),  authController.logout);
