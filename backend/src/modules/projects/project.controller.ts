import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { createProjectSchema, updateProjectSchema } from './project.types';
import { AppError } from '@/middleware/errorHandler';

export class ProjectController {
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId;
      const projects = await ProjectService.getProjects(workspaceId);
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      const project = await ProjectService.getProjectById(id, workspaceId);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId;
      const userId = (req as any).user.userId;
      const role = (req as any).userRole;

      if (role === 'MEMBER') {
        throw new AppError('Bạn không có quyền tạo dự án', 403);
      }

      const validatedData = createProjectSchema.parse(req.body);
      const project = await ProjectService.createProject(workspaceId, userId, validatedData);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).userRole;

      if (role === 'MEMBER') {
        throw new AppError('Bạn không có quyền sửa dự án', 403);
      }

      const validatedData = updateProjectSchema.parse(req.body);
      const project = await ProjectService.updateProject(id, workspaceId, validatedData);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async archiveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      const project = await ProjectService.archiveProject(id, workspaceId);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workspaceId = (req as any).workspaceId;
      const role = (req as any).userRole;

      if (role === 'MEMBER') {
        throw new AppError('Bạn không có quyền xóa dự án', 403);
      }

      await ProjectService.softDeleteProject(id, workspaceId);
      res.json({ success: true, message: 'Đã xóa dự án thành công' });
    } catch (error) {
      next(error);
    }
  }
}
