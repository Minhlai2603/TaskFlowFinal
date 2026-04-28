import { Request, Response } from 'express';
import { CommentService } from './comment.service';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.userId;
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Nội dung bình luận không được để trống' });
    }

    const comment = await CommentService.createComment({
      taskId,
      userId,
      workspaceId,
      content,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const comments = await CommentService.getComments(taskId);
    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
