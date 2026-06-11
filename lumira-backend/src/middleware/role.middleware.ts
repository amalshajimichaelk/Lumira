import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/response.utils';

/**
 * Role-based access control middleware factory.
 * Usage: requireRole('ADMIN') or requireRole('ADMIN', 'DOCTOR')
 */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        `Insufficient permissions. Required: ${roles.join(' or ')}`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
