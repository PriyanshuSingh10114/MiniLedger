import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err?.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: (err.errors || []).map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
        });
        return;
      }
      next(err);
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || err?.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: (err.errors || []).map((e: any) => ({
              field: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
        });
        return;
      }
      next(err);
    }
  };
}
