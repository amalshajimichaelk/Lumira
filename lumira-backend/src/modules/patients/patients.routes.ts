import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { visitQuerySchema } from './patients.schema';
import * as patientsController from './patients.controller';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

router.get('/visits', validate(visitQuerySchema, 'query'), patientsController.listVisits);

// CSV export — ADMIN only
router.get(
  '/visits/export',
  requireRole('ADMIN'),
  validate(visitQuerySchema.omit({ page: true, limit: true }), 'query'),
  patientsController.exportVisits
);

router.get('/:id', patientsController.getPatient);

export default router;
