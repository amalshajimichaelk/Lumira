import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import {
  loginService,
  refreshService,
  logoutService,
  changePasswordService,
  updateProfileService,
} from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.utils';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginService(req.body);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    sendSuccess(res, { accessToken: result.accessToken, user: result.user }, 'Login successful');
  } catch (err) {
    const error = err as Error;
    if (error.message === 'INVALID_CREDENTIALS') {
      sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      return;
    }
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (!rawToken) {
      sendError(res, 'No refresh token provided', 401, 'NO_REFRESH_TOKEN');
      return;
    }

    const result = await refreshService(rawToken);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed');
  } catch (err) {
    const error = err as Error;
    if (error.message === 'INVALID_REFRESH_TOKEN') {
      res.clearCookie(REFRESH_COOKIE);
      sendError(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      return;
    }
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];
    if (rawToken) {
      await logoutService(rawToken);
    }
    res.clearCookie(REFRESH_COOKIE);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const getMe = (req: Request, res: Response): void => {
  sendSuccess(res, req.user);
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updated = await updateProfileService(req.user!.id, req.body);
    sendSuccess(res, updated, 'Profile updated');
  } catch (err) {
    const error = err as Error;
    if (error.message === 'EMAIL_TAKEN') {
      sendError(res, 'Email is already in use', 409, 'EMAIL_TAKEN');
      return;
    }
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await changePasswordService(req.user!.id, req.body);
    // Clear refresh token cookie — user must log in again
    res.clearCookie(REFRESH_COOKIE);
    sendSuccess(res, null, 'Password changed successfully. Please log in again.');
  } catch (err) {
    const error = err as Error;
    if (error.message === 'WRONG_CURRENT_PASSWORD') {
      sendError(res, 'Current password is incorrect', 400, 'WRONG_PASSWORD');
      return;
    }
    next(err);
  }
};
