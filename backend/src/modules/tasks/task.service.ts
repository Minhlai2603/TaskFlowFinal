import prisma from '@/lib/prisma';
import { CreateTaskInput, UpdateTaskInput } from './task.types';
import { AppError } from '@/middleware/errorHandler';
import { ActionType, NotificationType } from '@prisma/client';
import { sanitize, sanitizePlain } from '@/utils/sanitize';
import { NotificationService } from '../notifications/notification.service';

export class TaskService {
  static async getTasks(workspaceId: string, projectId?: string, filters?: any) {
    const where: any = {
      workspace_id: workspaceId,
      deleted_at: null,
    };

    if (projectId) {
      where.project_id = projectId;
    }

    if (filters?.status) {
      // Support array of statuses or single status
      where.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }

    if (filters?.assigneeId) {
      where.assignee_id = filters.assigneeId;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.q) {
      where.title = {
        contains: filters.q,
        mode: 'insensitive',
      };
    }

    if (filters?.due_date_start || filters?.due_date_end) {
      where.due_date = {};
      if (filters?.due_date_start) where.due_date.gte = new Date(filters.due_date_start);
      if (filters?.due_date_end) where.due_date.lte = new Date(filters.due_date_end);
    }

    const page = filters?.page ? parseInt(filters.page) : 0;
    const limit = filters?.limit ? parseInt(filters.limit) : 50;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: page * limit,
        take: limit,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true, color: true } },
        },
      }),
      prisma.task.count({ where })
    ]);

    return { tasks, total, page, limit };
  }

  static async getTaskById(id: string, workspaceId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, color: true } },
        activity_logs: {
          orderBy: { created_at: 'desc' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!task) throw new AppError('Không tìm thấy task', 404);
    return task;
  }

  static async createTask(workspaceId: string, userId: string, data: CreateTaskInput) {
    // Kiểm tra project thuộc workspace
    const project = await prisma.project.findFirst({
      where: { id: data.project_id, workspace_id: workspaceId },
    });

    if (!project) throw new AppError('Dự án không hợp lệ', 400);
    if (project.archived_at) throw new AppError('Không thể tạo task trong dự án đã lưu trữ', 422);

    const sanitizedData = {
      ...data,
      title: sanitizePlain(data.title),
      description: data.description ? sanitize(data.description) : data.description,
    };

    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          ...sanitizedData,
          workspace_id: workspaceId,
          created_by: userId,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          task_id: task.id,
          user_id: userId,
          action_type: ActionType.CREATED,
          new_value: task.title,
        },
      });

      if (sanitizedData.assignee_id && sanitizedData.assignee_id !== userId) {
        await NotificationService.createNotification({
          workspaceId,
          userId: sanitizedData.assignee_id,
          type: NotificationType.TASK_ASSIGNED,
          taskId: task.id,
          message: `Bạn được phân công một công việc mới: "${task.title}"`,
        });
      }

      return task;
    });
  }

  static async updateTask(id: string, workspaceId: string, userId: string, data: UpdateTaskInput) {
    const task = await this.getTaskById(id, workspaceId);

    const sanitizedData = { ...data };
    if (data.title) sanitizedData.title = sanitizePlain(data.title);
    if (data.description) sanitizedData.description = sanitize(data.description);

    return await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id },
        data: sanitizedData,
      });

      // Log activity for changed fields
      const logChanges = async (field: string, oldValue: any, newValue: any, actionType: ActionType = ActionType.UPDATED) => {
        if (newValue !== undefined && newValue !== oldValue) {
          await tx.activityLog.create({
            data: {
              task_id: id,
              user_id: userId,
              action_type: actionType,
              field_changed: field,
              old_value: oldValue ? String(oldValue) : null,
              new_value: newValue ? String(newValue) : null,
            },
          });
        }
      };

      await logChanges('status', task.status, data.status, ActionType.STATUS_CHANGED);
      await logChanges('title', task.title, data.title);
      await logChanges('description', task.description, data.description);
      await logChanges('assignee_id', task.assignee_id, data.assignee_id);
      await logChanges('priority', task.priority, data.priority);
      
      const oldDate = task.due_date ? task.due_date.toISOString() : null;
      const newDate = data.due_date ? new Date(data.due_date).toISOString() : null;
      await logChanges('due_date', oldDate, newDate);

      // Notify if assignee changed
      if (data.assignee_id !== undefined && data.assignee_id !== task.assignee_id && data.assignee_id !== null && data.assignee_id !== userId) {
        await NotificationService.createNotification({
          workspaceId,
          userId: data.assignee_id,
          type: NotificationType.TASK_ASSIGNED,
          taskId: id,
          message: `Bạn được phân công một công việc: "${updatedTask.title}"`,
        });
      }

      return updatedTask;
    });
  }

  static async softDeleteTask(id: string, workspaceId: string) {
    await this.getTaskById(id, workspaceId);

    return await prisma.task.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  static async searchTasks(workspaceId: string, query: string, limit: number = 10) {
    return await prisma.task.findMany({
      where: {
        workspace_id: workspaceId,
        deleted_at: null,
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        }
      }
    });
  }
}
