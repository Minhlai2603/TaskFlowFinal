import { Request, Response, NextFunction } from 'express';
import prisma from '@/lib/prisma';
import { AppError } from './errorHandler';

export const workspaceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.headers['x-workspace-id'] as string;
  const userId = (req as any).user?.userId;

  if (!workspaceId) {
    return next(new AppError('Thiếu x-workspace-id header', 400));
  }

  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
  });

  if (!membership) {
    return next(new AppError('Bạn không có quyền truy cập workspace này', 403));
  }

  // Attach to request
  (req as any).workspaceId = workspaceId;
  (req as any).userRole = membership.role;

  next();
};
