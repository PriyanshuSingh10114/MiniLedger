import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { loansRouter } from '../modules/loans/loans.routes.js';
import { receiptsRouter } from '../modules/receipts/receipts.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { prisma } from '../lib/prisma.js';

export const apiV1Router = Router();

// Health check endpoint
apiV1Router.get('/health', async (_req, res) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    });
  } catch (err: unknown) {
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (err as Error)?.message,
    });
  }
});

// Module routers
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/users', usersRouter);
apiV1Router.use('/loans', loansRouter);
apiV1Router.use('/loans', receiptsRouter);
apiV1Router.use('/dashboard', dashboardRouter);
