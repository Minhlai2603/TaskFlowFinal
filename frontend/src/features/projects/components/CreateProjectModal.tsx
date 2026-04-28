'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { uiStore } from '@/features/ui/stores/uiStore';
import { useProjects } from '../hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  name: z.string().min(2, 'Tên dự án ít nhất 2 ký tự'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Màu không hợp lệ'),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const PRESET_COLORS = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', 
  '#EC4899', '#8B5CF6', '#64748B', '#000000', '#78350F'
];

export function CreateProjectModal() {
  const { createProjectModalOpen, closeCreateProject } = uiStore();
  const { createProject } = useProjects();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      color: '#4F46E5',
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    createProject.mutate(data, {
      onSuccess: () => {
        form.reset();
        closeCreateProject();
      },
    });
  };

  return (
    <Dialog open={createProjectModalOpen} onOpenChange={closeCreateProject}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên dự án</Label>
            <Input 
              id="name" 
              placeholder="VD: Website Rebrand" 
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Màu sắc nhận diện</Label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => form.setValue('color', color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    form.watch('color') === color ? "border-slate-900 scale-110 shadow-sm" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Input 
              {...form.register('color')}
              className="mt-2 h-8 text-xs font-mono w-24"
              placeholder="#HEX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Mô tả (Tùy chọn)</Label>
            <Textarea 
              id="desc" 
              placeholder="Mục tiêu của dự án này là..." 
              {...form.register('description')}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeCreateProject}>Hủy</Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={createProject.isPending}
            >
              {createProject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Tạo Dự án'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
