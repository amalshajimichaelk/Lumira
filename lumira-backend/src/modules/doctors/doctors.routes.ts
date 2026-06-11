import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as doctorsController from './doctors.controller';

const router = Router();

router.use(authenticate);

router.get('/', doctorsController.listDoctors);
router.get('/workload', doctorsController.getWorkload);

export default router;
