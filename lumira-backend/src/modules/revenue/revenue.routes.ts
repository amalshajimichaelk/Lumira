import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as revenueController from './revenue.controller';

const router = Router();

router.use(authenticate);

router.get('/', revenueController.listRevenue);
router.get('/breakdown', revenueController.getBreakdown);

export default router;
