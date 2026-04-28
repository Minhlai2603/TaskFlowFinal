import { z } from 'zod';

export const TaskStatusSchema = z.enum(['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Tiêu đề phải có ít nhất 2 ký tự').max(200),
  description: z.string().optional(),
  status: TaskStatusSchema.default('TO_DO'),
  priority: TaskPrioritySchema.default('MEDIUM'),
  due_date: z.string().datetime().optional().nullable(),
  project_id: z.string().uuid(),
  assignee_id: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
