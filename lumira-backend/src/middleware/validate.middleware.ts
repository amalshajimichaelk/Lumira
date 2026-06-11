import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidateTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * Validates req[target] against the provided schema.
 * Replaces the original with the parsed (coerced) values.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), authController.login)
 *   router.get('/visits', validate(visitQuerySchema, 'query'), ...)
 */
export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace with parsed values (handles coercion, defaults)
      (req as unknown as Record<string, unknown>)[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
