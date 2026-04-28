import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { RegisterInput, LoginInput } from './auth.types';
import { AppError } from '@/middleware/errorHandler';
import { signToken } from '@/utils/jwt';

const BCRYPT_COST = parseInt(process.env.BCRYPT_COST || '12');

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email đã tồn tại', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

    // Sử dụng transaction để tạo User và Workspace mặc định
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password_hash: passwordHash,
        },
        select: { id: true, name: true, email: true },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          created_by: user.id,
          members: {
            create: {
              user_id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user,
        workspaceId: workspace.id,
        workspaceRole: 'ADMIN' as const,
        workspaces: [{ id: workspace.id, name: workspace.name, role: 'ADMIN' as const }],
        token,
      };
    });
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        workspace_members: {
          include: { workspace: { select: { id: true, name: true } } },
          orderBy: { workspace: { created_at: 'asc' } },
        },
      },
    });

    if (!user) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    // Kiểm tra khóa tài khoản
    if (user.locked_until && user.locked_until > new Date()) {
      throw new AppError(`Tài khoản bị khóa tạm thời. Vui lòng thử lại sau.`, 403);
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);

    if (!isMatch) {
      const failedAttempts = user.failed_attempts + 1;
      let lockedUntil = null;

      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Khóa 15 phút
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failed_attempts: failedAttempts,
          locked_until: lockedUntil,
        },
      });

      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    // Reset failed attempts khi login thành công
    await prisma.user.update({
      where: { id: user.id },
      data: { failed_attempts: 0, locked_until: null },
    });

    const memberships = user.workspace_members;
    // Ưu tiên workspace mà user là ADMIN (personal workspace của mình)
    const defaultMembership =
      memberships.find((m) => m.role === 'ADMIN') || memberships[0];

    const token = signToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspaceId: defaultMembership?.workspace_id || null,
      workspaceRole: defaultMembership?.role || null,
      workspaces: memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        role: m.role,
      })),
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspace_members: {
          include: { workspace: { select: { id: true, name: true } } },
          orderBy: { workspace: { created_at: 'asc' } },
        },
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    const memberships = user.workspace_members;
    // Ưu tiên workspace mà user là ADMIN (personal workspace)
    const defaultMembership =
      memberships.find((m) => m.role === 'ADMIN') || memberships[0];

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspaceId: defaultMembership?.workspace_id || null,
      workspaceRole: defaultMembership?.role || null,
      workspaces: memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        role: m.role,
      })),
    };
  }

  static async updateProfile(userId: string, data: { name: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
      select: { id: true, name: true, email: true },
    });
  }
}
