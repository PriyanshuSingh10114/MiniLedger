import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, (req, res, next) => usersController.getMe(req, res, next));
