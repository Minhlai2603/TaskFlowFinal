import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Tên dự án phải có ít nhất 2 ký tự').max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Màu sắc không hợp lệ (Hex)'),
  description: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
