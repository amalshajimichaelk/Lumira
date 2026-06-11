import { Request, Response, NextFunction } from 'express';
import { getDashboardSummary } from './dashboard.service';
import { sendSuccess } from '../../utils/response.utils';

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getDashboardSummary();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
