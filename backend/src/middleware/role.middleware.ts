import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole as Role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
    }

    next();
  };
};
