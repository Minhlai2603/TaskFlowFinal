import { z } from 'zod';

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Tên workspace phải có ít nhất 2 ký tự').max(100),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).default('MEMBER'),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
