import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

// Public routes (không cần auth)
router.get('/invites/:token', WorkspaceController.verifyInvite);
router.post('/invites/:token/accept', WorkspaceController.acceptInvite);

// Protected routes
router.use(authMiddleware);

// Migration endpoint: tạo personal workspace cho user hiện có
router.post('/ensure-personal', WorkspaceController.ensurePersonalWorkspace);

router.get('/:id', WorkspaceController.getWorkspace);
router.patch('/:id', WorkspaceController.updateWorkspace);
router.get('/:id/members', WorkspaceController.getMembers);
router.post('/:id/invites', WorkspaceController.inviteMember);
router.delete('/:id/members/:userId', WorkspaceController.removeMember);

// Switch active workspace
router.post('/:id/switch', WorkspaceController.switchWorkspace);

export default router;
