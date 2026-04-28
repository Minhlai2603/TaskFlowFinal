import prisma from '@/lib/prisma';
import { CreateProjectInput, UpdateProjectInput } from './project.types';
import { AppError } from '@/middleware/errorHandler';

export class ProjectService {
  static async getProjects(workspaceId: string) {
    return await prisma.project.findMany({
      where: {
        workspace_id: workspaceId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { tasks: { where: { deleted_at: null } } }
        }
      }
    });
  }

  static async getProjectById(id: string, workspaceId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        workspace_id: workspaceId,
        deleted_at: null,
      },
      include: {
        tasks: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!project) {
      throw new AppError('Không tìm thấy dự án', 404);
    }

    return project;
  }

  static async createProject(workspaceId: string, userId: string, data: CreateProjectInput) {
    return await prisma.project.create({
      data: {
        ...data,
        workspace_id: workspaceId,
      },
    });
  }

  static async updateProject(id: string, workspaceId: string, data: UpdateProjectInput) {
    await this.getProjectById(id, workspaceId);

    return await prisma.project.update({
      where: { id },
      data,
    });
  }

  static async archiveProject(id: string, workspaceId: string) {
    await this.getProjectById(id, workspaceId);

    return await prisma.project.update({
      where: { id },
      data: { archived_at: new Date() },
    });
  }

  static async unarchiveProject(id: string, workspaceId: string) {
    await this.getProjectById(id, workspaceId);

    return await prisma.project.update({
      where: { id },
      data: { archived_at: null },
    });
  }

  static async softDeleteProject(id: string, workspaceId: string) {
    await this.getProjectById(id, workspaceId);

    // Soft delete Project and all its Tasks in a transaction
    return await prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.task.updateMany({
        where: { project_id: id, deleted_at: null },
        data: { deleted_at: now },
      });

      return await tx.project.update({
        where: { id },
        data: { deleted_at: now },
      });
    });
  }

  static async restoreProject(id: string, workspaceId: string) {
    // Restore logic: only for recently deleted (e.g., within 30 days - simple for now)
    const project = await prisma.project.findFirst({
      where: { id, workspace_id: workspaceId },
    });

    if (!project) throw new AppError('Dự án không tồn tại', 404);

    return await prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { project_id: id, deleted_at: project.deleted_at },
        data: { deleted_at: null },
      });

      return await tx.project.update({
        where: { id },
        data: { deleted_at: null },
      });
    });
  }
}
