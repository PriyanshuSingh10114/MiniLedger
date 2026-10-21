import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttpModule from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { errorHandler } from './middleware/error.js';
import { apiV1Router } from './routes/index.js';
import { swaggerSpec } from './docs/swagger.js';

export const app = express();

const pinoHttp =
  (pinoHttpModule as unknown as { default?: typeof pinoHttpModule }).default || pinoHttpModule;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  }),
);

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Correlation ID
app.use(requestIdMiddleware);

// Structured HTTP logging
app.use(
  (pinoHttp as any)({
    logger,
    customProps: (req: express.Request) => ({
      requestId: req.headers['x-request-id'],
    }),
    autoLogging: {
      ignore: (req: express.Request) =>
        req.url === '/api/v1/health' || req.url?.startsWith('/api-docs'),
    },
  }),
);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1', apiV1Router);

// Root endpoint info
app.get('/', (_req, res) => {
  res.json({
    name: 'MiniLedger API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/v1/health',
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested endpoint does not exist',
    },
  });
});

// Centralized error handler
app.use(errorHandler);
