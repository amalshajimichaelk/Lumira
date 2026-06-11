import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';

export const appointmentQuerySchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  doctorId: z.string().optional(),
  departmentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const calendarQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
});

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  scheduledAt: z.string().datetime({ offset: true }),
  durationMins: z.number().int().min(5).max(480).default(30),
  notes: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});

export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;
export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
