import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from './notification.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { workspaceMiddleware } from '../../middleware/workspace.middleware';

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get('/', getNotifications);
router.patch('/mark-read-all', markAllRead);
router.patch('/:id/mark-read', markRead);

export default router;
