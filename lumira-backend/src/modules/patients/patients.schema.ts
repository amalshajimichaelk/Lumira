import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';

export const visitQuerySchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  department: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type VisitQuery = z.infer<typeof visitQuerySchema>;
