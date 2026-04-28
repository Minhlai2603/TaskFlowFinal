import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { updateWorkspaceSchema, inviteMemberSchema } from './workspace.types';

export class WorkspaceController {
  static async getWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.id as string;
      const userId = (req as any).user.userId as string;
      const workspace = await WorkspaceService.getWorkspace(workspaceId, userId);
      res.json({ success: true, data: workspace });
    } catch (error) {
      next(error);
    }
  }

  static async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.id as string;
      const userId = (req as any).user.userId as string;
      const validatedData = updateWorkspaceSchema.parse(req.body);
      const workspace = await WorkspaceService.updateWorkspace(workspaceId, userId, validatedData);
      res.json({ success: true, data: workspace });
    } catch (error) {
      next(error);
    }
  }

  static async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.id as string;
      const userId = (req as any).user.userId as string;
      const validatedData = inviteMemberSchema.parse(req.body);
      const result = await WorkspaceService.inviteMember(workspaceId, userId, validatedData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.id as string;
      const members = await WorkspaceService.getMembers(workspaceId);
      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.id as string;
      const adminId = (req as any).user.userId as string;
      const memberUserId = req.params.userId as string;
      await WorkspaceService.removeMember(workspaceId, adminId, memberUserId);
      res.json({ success: true, message: 'Đã xóa thành viên khỏi workspace' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token as string;
      const result = await WorkspaceService.verifyInvite(token);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token as string;
      const result = await WorkspaceService.acceptInvite(token, req.body);

      // Set cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          workspaceId: result.workspaceId,
          workspaceRole: result.workspaceRole,
          workspaces: result.workspaces,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/workspaces/:id/switch
   * Cho phép user chuyển đổi active workspace trong session frontend.
   */
  static async switchWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.id as string;
      const userId = (req as any).user.userId as string;
      const result = await WorkspaceService.switchWorkspace(workspaceId, userId);
      res.json({
        success: true,
        data: {
          workspaceId: result.workspaceId,
          workspaceRole: result.workspaceRole,
          workspace: result.workspace,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/workspaces/ensure-personal
   * Tạo personal workspace cho user hiện có nếu chưa có. Dùng cho migration.
   */
  static async ensurePersonalWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId as string;
      const result = await WorkspaceService.ensurePersonalWorkspace(userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
