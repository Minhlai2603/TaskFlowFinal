import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { createTaskSchema, updateTaskSchema } from './task.types';

export class TaskController {
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId;
      const { projectId, status, assigneeId, priority, q, due_date_start, due_date_end, page, limit } = req.query;
      const result = await TaskService.getTasks(workspaceId, projectId as string, { 
        status, 
        assigneeId,
        priority,
        q,
        due_date_start,
        due_date_end,
        page,
        limit
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      const task = await TaskService.getTaskById(id, workspaceId);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId;
      const userId = (req as any).user.userId;
      const validatedData = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(workspaceId, userId, validatedData);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      const userId = (req as any).user.userId;
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(id, workspaceId, userId, validatedData);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      await TaskService.softDeleteTask(id, workspaceId);
      res.json({ success: true, message: 'Đã xóa task thành công' });
    } catch (error) {
      next(error);
    }
  }

  static async searchTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId;
      const { q, limit } = req.query;
      const tasks = await TaskService.searchTasks(
        workspaceId, 
        q as string || '', 
        limit ? parseInt(limit as string) : 10
      );
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }
}
