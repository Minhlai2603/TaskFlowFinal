import cron from 'node-cron';
import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { NotificationService } from './notification.service';

export function setupCron() {
  // Chạy đầu mỗi giờ
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Checking for tasks due soon...');
    
    try {
      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Tìm tasks sắp hạn (trong 24h tới) chưa xong
      const tasks = await prisma.task.findMany({
        where: {
          due_date: {
            gt: now,
            lte: next24h,
          },
          status: { not: 'DONE' },
          deleted_at: null,
          assignee_id: { not: null },
        },
        include: {
          workspace: true,
        },
      });

      for (const task of tasks) {
        // Dedup: Đảm bảo mỗi task chỉ nhận tối đa 1 notification DUE_SOON mỗi ngày
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const existingNotification = await prisma.notification.findFirst({
          where: {
            task_id: task.id,
            type: NotificationType.TASK_DUE_SOON,
            created_at: {
              gte: todayStart,
            },
          },
        });

        if (!existingNotification && task.assignee_id) {
          await NotificationService.createNotification({
            workspaceId: task.workspace_id,
            userId: task.assignee_id,
            type: NotificationType.TASK_DUE_SOON,
            taskId: task.id,
            message: `Công việc "${task.title}" sắp đến hạn (trong vòng 24h tới). Vui lòng kiểm tra lại.`,
          });
        }
      }
    } catch (error) {
      console.error('[Cron Error]', error);
    }
  });
}
