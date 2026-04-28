import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  static async createNotification(data: {
    workspaceId: string;
    userId: string;
    type: NotificationType;
    taskId?: string;
    commentId?: string;
    message: string;
  }) {
    return prisma.notification.create({
      data: {
        workspace_id: data.workspaceId,
        user_id: data.userId,
        type: data.type,
        task_id: data.taskId,
        comment_id: data.commentId,
        message: data.message,
      },
    });
  }

  static async getUnreadNotifications(workspaceId: string, userId: string) {
    return prisma.notification.findMany({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
        read_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          }
        },
        comment: {
          select: {
            id: true,
            content: true,
          }
        }
      }
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        user_id: userId,
      },
      data: {
        read_at: new Date(),
      },
    });
  }

  static async markAllAsRead(workspaceId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
        read_at: null,
      },
      data: {
        read_at: new Date(),
      },
    });
  }
}
