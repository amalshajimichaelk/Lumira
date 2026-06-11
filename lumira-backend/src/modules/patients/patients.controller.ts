import { Request, Response, NextFunction } from 'express';
import { Parser } from '@json2csv/plainjs';
import { getVisits, getVisitsForExport, getPatientById } from './patients.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import type { VisitQuery } from './patients.schema';

export const listVisits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as unknown as VisitQuery;
    const result = await getVisits(query);
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

export const exportVisits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as unknown as Omit<VisitQuery, 'page' | 'limit'>;
    const data = await getVisitsForExport(query);

    if (data.length === 0) {
      res.status(200).json({ success: true, message: 'No data to export', data: [] });
      return;
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    const filename = `visits-export-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

export const getPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await getPatientById(req.params.id);
    sendSuccess(res, patient);
  } catch (err) {
    next(err);
  }
};
