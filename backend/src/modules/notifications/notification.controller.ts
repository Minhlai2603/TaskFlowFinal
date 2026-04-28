import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string;
    const userId = (req as any).user.userId;
    const notifications = await NotificationService.getUnreadNotifications(workspaceId, userId);
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    await NotificationService.markAsRead(id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string;
    const userId = (req as any).user.userId;
    await NotificationService.markAllAsRead(workspaceId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
