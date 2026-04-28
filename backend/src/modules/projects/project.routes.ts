import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { workspaceMiddleware } from '@/middleware/workspace.middleware';

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProject);
router.patch('/:id', ProjectController.updateProject);
router.patch('/:id/archive', ProjectController.archiveProject);
router.delete('/:id', ProjectController.deleteProject);

export default router;
