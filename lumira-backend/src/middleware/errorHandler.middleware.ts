import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import logger from '../utils/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Zod validation errors → 400
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

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation → 409 Conflict
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists`,
        code: 'CONFLICT',
      });
      return;
    }
    if (err.code === 'P2025') {
      // Record not found → 404
      res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      });
      return;
    }
    // Other Prisma errors → 500
    logger.error('Prisma error', { code: err.code, meta: err.meta, message: err.message });
    res.status(500).json({
      success: false,
      message: 'Database error',
      code: 'DB_ERROR',
    });
    return;
  }

  // JWT errors → 401
  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return;
  }
  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // All other errors → 500
  const error = err as Error;
  logger.error('Unhandled error', {
    message: error.message,
    stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    code: 'INTERNAL_ERROR',
    ...(env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};
