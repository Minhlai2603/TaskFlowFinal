import prisma from '@/lib/prisma';
import { NotificationService } from '../notifications/notification.service';
import { NotificationType, ActionType } from '@prisma/client';
import { sanitize } from '@/utils/sanitize';

export class CommentService {
  static async createComment(data: {
    taskId: string;
    userId: string;
    workspaceId: string;
    content: string;
  }) {
    const sanitizedContent = sanitize(data.content);
    const comment = await prisma.comment.create({
      data: {
        task_id: data.taskId,
        user_id: data.userId,
        content: sanitizedContent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            assignee_id: true,
          }
        }
      }
    });

    // 1. Notify Assignee (if not the commenter)
    if (comment.task.assignee_id && comment.task.assignee_id !== data.userId) {
      await NotificationService.createNotification({
        workspaceId: data.workspaceId,
        userId: comment.task.assignee_id,
        type: NotificationType.TASK_COMMENTED,
        taskId: data.taskId,
        commentId: comment.id,
        message: `${comment.user.name} đã bình luận trong công việc "${comment.task.title}"`,
      });
    }

    // 2. Parse Mentions: @[Name](userId)
    const mentionRegex = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g;
    const mentions = [...sanitizedContent.matchAll(mentionRegex)];
    const uniqueMentionedUserIds = [...new Set(mentions.map(m => m[2]))];

    for (const mentionedUserId of uniqueMentionedUserIds) {
      // Don't notify the commenter or the assignee (already notified)
      if (mentionedUserId !== data.userId && mentionedUserId !== comment.task.assignee_id) {
        await NotificationService.createNotification({
          workspaceId: data.workspaceId,
          userId: mentionedUserId,
          type: NotificationType.TASK_MENTIONED,
          taskId: data.taskId,
          commentId: comment.id,
          message: `${comment.user.name} đã nhắc đến bạn trong công việc "${comment.task.title}"`,
        });
      }
    }

    // 3. Create Activity Log
    await prisma.activityLog.create({
      data: {
        task_id: data.taskId,
        user_id: data.userId,
        action_type: ActionType.COMMENTED,
        new_value: comment.content,
      }
    });

    return comment;
  }

  static async getComments(taskId: string) {
    return prisma.comment.findMany({
      where: {
        task_id: taskId,
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
  }
}
