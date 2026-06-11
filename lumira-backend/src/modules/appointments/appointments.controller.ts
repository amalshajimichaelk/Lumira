import { Request, Response, NextFunction } from 'express';
import {
  getAppointments,
  getAppointmentCalendar,
  createAppointment,
  updateAppointmentStatus,
} from './appointments.service';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.utils';
import type { AppointmentQuery } from './appointments.schema';

export const listAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as unknown as AppointmentQuery;
    const result = await getAppointments(query);
    sendPaginated(res, result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const getCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { month } = req.query as { month: string };
    const data = await getAppointmentCalendar(month);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appointment = await createAppointment(req.body);
    sendSuccess(res, appointment, 'Appointment created', 201);
  } catch (err) {
    const error = err as Error;
    if (error.message === 'DOCTOR_SCHEDULE_CLASH') {
      sendError(
        res,
        'Doctor already has an appointment at this time',
        409,
        'SCHEDULE_CLASH'
      );
      return;
    }
    next(err);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await updateAppointmentStatus(id, req.body);
    sendSuccess(res, updated, 'Appointment status updated');
  } catch (err) {
    next(err);
  }
};
