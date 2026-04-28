import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.types';
import { sanitize } from '@/utils/sanitize';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Sanitize input
      const sanitizedData = {
        name: sanitize(req.body.name),
        email: req.body.email,
        password: req.body.password,
      };

      const validatedData = registerSchema.parse(sanitizedData);
      const result = await AuthService.register(validatedData);

      // Set httpOnly cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          workspaceId: result.workspaceId,
          workspaceRole: result.workspaceRole,
          workspaces: result.workspaces || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          workspaceId: result.workspaceId,
          workspaceRole: result.workspaceRole,
          workspaces: result.workspaces || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ success: true, message: 'Đăng xuất thành công' });
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getMe((req as any).user.userId);
      res.json({
        success: true,
        data: {
          user: result.user,
          workspaceId: result.workspaceId,
          workspaceRole: result.workspaceRole,
          workspaces: result.workspaces || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const name = sanitize(req.body.name);

      if (!name || name.length < 2) {
        throw new Error('Tên phải có ít nhất 2 ký tự');
      }

      const user = await AuthService.updateProfile(userId, { name });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
