import { Request, Response, NextFunction } from 'express';
import { getAllDoctors, getDoctorWorkload } from './doctors.service';
import { sendSuccess } from '../../utils/response.utils';

export const listDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAllDoctors();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const getWorkload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const date = req.query.date as string | undefined;
    const data = await getDoctorWorkload(date);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};
