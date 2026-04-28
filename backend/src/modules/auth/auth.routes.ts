import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '@/middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.patch('/profile', authMiddleware, AuthController.updateProfile);

export default router;
