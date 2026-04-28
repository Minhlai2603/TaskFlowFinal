import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { AppError } from './errorHandler';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new AppError('Vui lòng đăng nhập để truy cập', 401));
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    next(new AppError('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.', 401));
  }
};
