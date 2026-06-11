import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as departmentsController from './departments.controller';

const router = Router();

router.use(authenticate);

router.get('/performance', departmentsController.getPerformance);

export default router;
