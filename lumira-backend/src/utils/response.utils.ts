import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Send a standardized success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

/**
 * Send a standardized paginated success response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}

/**
 * Send a standardized error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  details?: unknown
): Response {
  const body: Record<string, unknown> = { success: false, message };
  if (code) body.code = code;
  if (details) body.details = details;
  return res.status(statusCode).json(body);
}
