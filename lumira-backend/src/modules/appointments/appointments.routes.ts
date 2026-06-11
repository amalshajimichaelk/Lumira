import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  appointmentQuerySchema,
  calendarQuerySchema,
  createAppointmentSchema,
  updateStatusSchema,
} from './appointments.schema';
import * as appointmentsController from './appointments.controller';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate(appointmentQuerySchema, 'query'),
  appointmentsController.listAppointments
);

router.get(
  '/calendar',
  validate(calendarQuerySchema, 'query'),
  appointmentsController.getCalendar
);

router.post(
  '/',
  requireRole('ADMIN', 'DOCTOR'),
  validate(createAppointmentSchema),
  appointmentsController.create
);

router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  appointmentsController.updateStatus
);

export default router;
