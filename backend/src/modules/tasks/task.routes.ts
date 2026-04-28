import { Router } from 'express';
import { TaskController } from './task.controller';
import * as CommentController from './comment.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { workspaceMiddleware } from '@/middleware/workspace.middleware';

const router = Router();

router.use(authMiddleware);
router.use(workspaceMiddleware);

router.get('/', TaskController.getTasks);
router.post('/', TaskController.createTask);
router.get('/search', TaskController.searchTasks);
router.get('/:id', TaskController.getTask);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

// Comments
router.post('/:taskId/comments', CommentController.createComment);
router.get('/:taskId/comments', CommentController.getComments);

export default router;
