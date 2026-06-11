import { Request, Response, NextFunction } from 'express';
import { getDepartmentPerformance } from './departments.service';
import { sendSuccess } from '../../utils/response.utils';

export const getPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string };
    const data = await getDepartmentPerformance(dateFrom, dateTo);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
