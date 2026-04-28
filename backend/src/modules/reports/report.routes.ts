import { Router } from 'express';
import { getWeeklyStats, getMemberStats } from './report.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { workspaceMiddleware } from '../../middleware/workspace.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

// Only ADMIN and MANAGER can view reports
router.get('/weekly-stats', roleMiddleware([Role.ADMIN, Role.MANAGER]), getWeeklyStats);
router.get('/member-stats', roleMiddleware([Role.ADMIN, Role.MANAGER]), getMemberStats);

export default router;
