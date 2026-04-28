import prisma from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export class ReportService {
  static async getWeeklyStats(workspaceId: string) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        start: startOfDay(date),
        end: endOfDay(date),
        label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      };
    }).reverse();

    const stats = await Promise.all(
      last7Days.map(async (day) => {
        const completedCount = await prisma.task.count({
          where: {
            workspace_id: workspaceId,
            status: 'DONE',
            updated_at: {
              gte: day.start,
              lte: day.end,
            },
            deleted_at: null,
          },
        });

        const createdCount = await prisma.task.count({
          where: {
            workspace_id: workspaceId,
            created_at: {
              gte: day.start,
              lte: day.end,
            },
            deleted_at: null,
          },
        });

        return {
          name: day.label,
          completed: completedCount,
          created: createdCount,
        };
      })
    );

    return stats;
  }

  static async getMemberStats(workspaceId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspace_id: workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    const stats = await Promise.all(
      members.map(async (m) => {
        const totalTasks = await prisma.task.count({
          where: { workspace_id: workspaceId, assignee_id: m.user_id, deleted_at: null }
        });

        const completedTasks = await prisma.task.count({
          where: { workspace_id: workspaceId, assignee_id: m.user_id, status: 'DONE', deleted_at: null }
        });

        return {
          userId: m.user_id,
          name: m.user.name,
          email: m.user.email,
          total: totalTasks,
          completed: completedTasks,
          efficiency: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      })
    );

    return stats.sort((a, b) => b.completed - a.completed);
  }
}
