import prisma from '@/lib/prisma';
import { UpdateWorkspaceInput, InviteMemberInput } from './workspace.types';
import { AppError } from '@/middleware/errorHandler';
import { EmailFactory } from '@/lib/email/EmailFactory';
import { v4 as uuidv4 } from 'uuid';

export class WorkspaceService {
  static async getWorkspace(id: string, userId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        members: { some: { user_id: userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!workspace) {
      throw new AppError('Không tìm thấy workspace', 404);
    }

    return workspace;
  }

  static async updateWorkspace(id: string, userId: string, data: UpdateWorkspaceInput) {
    // Chỉ ADMIN mới được sửa workspace name
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: id, user_id: userId } },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new AppError('Bạn không có quyền thực hiện hành động này', 403);
    }

    return await prisma.workspace.update({
      where: { id },
      data: { name: data.name },
    });
  }

  static async inviteMember(workspaceId: string, inviterId: string, data: InviteMemberInput) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) throw new AppError('Workspace không tồn tại', 404);

    // Kiểm tra quyền (ADMIN hoặc MANAGER)
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: inviterId } },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'MANAGER')) {
      throw new AppError('Bạn không có quyền mời thành viên', 403);
    }

    // Tạo token invite (MVP: lưu vào DB InviteToken)
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    await prisma.inviteToken.create({
      data: {
        token,
        email: data.email,
        role: data.role,
        workspace_id: workspaceId,
        invited_by: inviterId,
        expires_at: expiresAt,
      },
    });

    // Gửi email
    const emailProvider = EmailFactory.getProvider();
    const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}`;

    await emailProvider.sendEmail({
      to: data.email,
      subject: `Bạn được mời tham gia workspace ${workspace.name} trên TaskFlow`,
      html: `
        <h1>Chào mừng đến với TaskFlow!</h1>
        <p>Bạn đã được mời tham gia workspace <strong>${workspace.name}</strong>.</p>
        <p>Vui lòng click vào link bên dưới để tham gia:</p>
        <a href="${inviteLink}">${inviteLink}</a>
        <p>Link này sẽ hết hạn sau 7 ngày.</p>
      `,
    });

    return { success: true };
  }

  static async verifyInvite(token: string) {
    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invite || invite.expires_at < new Date() || invite.accepted_at) {
      throw new AppError('Lời mời không hợp lệ hoặc đã hết hạn', 400);
    }

    // Kiểm tra user đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    return {
      invite,
      userExists: !!existingUser,
    };
  }

  static async acceptInvite(token: string, userData?: any) {
    const { invite, userExists } = await this.verifyInvite(token);

    return await prisma.$transaction(async (tx) => {
      let userId: string;
      let personalWorkspaceId: string | null = null;

      if (!userExists) {
        if (!userData || !userData.password || !userData.name) {
          throw new AppError('Thiếu thông tin người dùng', 400);
        }
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.default.hash(userData.password, 12);
        const user = await tx.user.create({
          data: {
            email: invite.email,
            name: userData.name,
            password_hash: passwordHash,
          },
        });
        userId = user.id;

        // TẠO PERSONAL WORKSPACE cho user mới — đây là workspace riêng của họ với role ADMIN
        const personalWorkspace = await tx.workspace.create({
          data: {
            name: `${userData.name}'s Workspace`,
            created_by: userId,
            members: {
              create: {
                user_id: userId,
                role: 'ADMIN',
              },
            },
          },
        });
        personalWorkspaceId = personalWorkspace.id;
      } else {
        const user = await tx.user.findUnique({ where: { email: invite.email } });
        userId = user!.id;
      }

      // Thêm vào workspace được mời
      await tx.workspaceMember.upsert({
        where: { workspace_id_user_id: { workspace_id: invite.workspace_id, user_id: userId } },
        create: {
          workspace_id: invite.workspace_id,
          user_id: userId,
          role: invite.role,
        },
        update: { role: invite.role },
      });

      // Đánh dấu token đã dùng
      await tx.inviteToken.update({
        where: { id: invite.id },
        data: { accepted_at: new Date() },
      });

      // Lấy toàn bộ workspaces của user sau khi accept
      const allMemberships = await tx.workspaceMember.findMany({
        where: { user_id: userId },
        include: { workspace: { select: { id: true, name: true } } },
        orderBy: { workspace: { created_at: 'asc' } },
      });

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      const { signToken } = await import('@/utils/jwt');
      const jwtToken = signToken({ userId, email: invite.email });

      // Ưu tiên personal workspace (nơi user là ADMIN) làm active workspace
      const defaultMembership =
        allMemberships.find((m) => m.role === 'ADMIN') || allMemberships[0];

      return {
        user,
        token: jwtToken,
        workspaceId: defaultMembership?.workspace_id || invite.workspace_id,
        workspaceRole: defaultMembership?.role || invite.role,
        workspaces: allMemberships.map((m) => ({
          id: m.workspace.id,
          name: m.workspace.name,
          role: m.role,
        })),
      };
    });
  }

  static async getMembers(workspaceId: string) {
    return await prisma.workspaceMember.findMany({
      where: { workspace_id: workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async removeMember(workspaceId: string, adminId: string, memberUserId: string) {
    if (adminId === memberUserId) {
      throw new AppError('Bạn không thể tự xóa chính mình khỏi workspace', 400);
    }

    const adminMembership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: adminId } },
    });

    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      throw new AppError('Chỉ Admin mới có quyền xóa thành viên', 403);
    }

    // Edge Case Admin cuối: Nếu target là Admin duy nhất
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: memberUserId } },
    });

    if (targetMember?.role === 'ADMIN') {
      const adminCount = await prisma.workspaceMember.count({
        where: { workspace_id: workspaceId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new AppError('Không thể xóa Admin cuối cùng. Hãy chỉ định Admin khác trước.', 400);
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Xóa member
      const deleted = await tx.workspaceMember.delete({
        where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: memberUserId } },
        include: { user: { select: { name: true } } },
      });

      // 2. Set assignee_id = null cho tất cả tasks trong workspace
      await tx.task.updateMany({
        where: { workspace_id: workspaceId, assignee_id: memberUserId },
        data: { assignee_id: null },
      });

      // 3. Tạo thông báo REASSIGN_NEEDED cho các ADMIN/MANAGER
      const managers = await tx.workspaceMember.findMany({
        where: {
          workspace_id: workspaceId,
          role: { in: ['ADMIN', 'MANAGER'] },
          user_id: { not: memberUserId },
        },
      });

      if (managers.length > 0) {
        await tx.notification.createMany({
          data: managers.map((m) => ({
            workspace_id: workspaceId,
            user_id: m.user_id,
            type: 'REASSIGN_NEEDED',
            message: `Thành viên ${deleted.user.name} đã bị xóa. Vui lòng phân bổ lại các công việc đang trống.`,
          })),
        });
      }

      return deleted;
    });
  }

  /**
   * Cho phép user chuyển đổi active workspace.
   * Xác nhận user có membership trong workspace target trước khi trả về thông tin.
   */
  static async switchWorkspace(workspaceId: string, userId: string) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: userId } },
      include: { workspace: { select: { id: true, name: true } } },
    });

    if (!membership) {
      throw new AppError('Bạn không có quyền truy cập workspace này', 403);
    }

    return {
      workspaceId: membership.workspace_id,
      workspaceRole: membership.role,
      workspace: membership.workspace,
    };
  }

  /**
   * Tạo personal workspace cho user hiện có mà chưa có workspace nào là ADMIN.
   * Dùng cho migration script.
   */
  static async ensurePersonalWorkspace(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspace_members: { where: { role: 'ADMIN' } },
      },
    });

    if (!user) throw new AppError('Không tìm thấy user', 404);

    // Đã có workspace ADMIN → không cần tạo thêm
    if (user.workspace_members.length > 0) {
      return { created: false, message: 'User đã có personal workspace' };
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        created_by: userId,
        members: {
          create: { user_id: userId, role: 'ADMIN' },
        },
      },
    });

    return { created: true, workspace };
  }
}
