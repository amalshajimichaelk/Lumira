import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { verifyAccessToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'No token provided', 401, 'NO_TOKEN');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      sendError(res, 'User not found', 401, 'USER_NOT_FOUND');
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
      return;
    }
    next(err);
  }
};
