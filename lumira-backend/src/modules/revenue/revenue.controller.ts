import { Request, Response, NextFunction } from 'express';
import { getRevenue, getRevenueBreakdown } from './revenue.service';
import { sendSuccess } from '../../utils/response.utils';
import { z } from 'zod';

const revenueQuerySchema = z.object({
  group: z.enum(['day', 'month', 'year']).default('month'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const listRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = revenueQuerySchema.parse(req.query);
    const data = await getRevenue(query);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const getBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getRevenueBreakdown();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
