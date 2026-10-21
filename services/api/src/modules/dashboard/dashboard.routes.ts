import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', requireAuth, (req, res, next) =>
  dashboardController.getSummary(req, res, next),
);
