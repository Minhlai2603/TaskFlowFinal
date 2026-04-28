'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { uiStore } from '@/features/ui/stores/uiStore';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { authStore } from '@/features/auth/stores/authStore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, Loader2, Sparkles, FolderKanban, 
  UserCircle2, CircleDashed, Clock, CheckCircle2, 
  Flag, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { vi } from 'date-fns/locale';

const taskSchema = z.object({
  title: z.string().min(2, 'Tiêu đề ít nhất 2 ký tự'),
  project_id: z.string().uuid('Vui lòng chọn dự án'),
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assignee_id: z.string().uuid().optional().nullable(),
  due_date: z.date().optional().nullable(),
  description: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function CreateTaskModal() {
  const { createTaskModalOpen, closeCreateTask } = uiStore();
  const { workspaceId } = authStore();
  const { createTask } = useTasks();
  const { projects } = useProjects();
  const { members } = useWorkspace(workspaceId || undefined);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'TO_DO',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    createTask.mutate({
      ...data,
      due_date: data.due_date?.toISOString(),
    }, {
      onSuccess: () => {
        form.reset();
        closeCreateTask();
      },
    });
  };

  return (
    <Dialog open={createTaskModalOpen} onOpenChange={closeCreateTask}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-2xl bg-white animate-in zoom-in-95 duration-200">
        <DialogHeader className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Tạo công việc mới</DialogTitle>
            <p className="text-sm text-slate-500 mt-0.5">Thêm task mới và phân công cho thành viên trong dự án.</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề</Label>
            <Input 
              id="title" 
              placeholder="VD: Thiết kế giao diện Dashboard..." 
              {...form.register('title')}
              className={cn(
                "h-12 px-4 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl shadow-sm", 
                form.formState.errors.title && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
              )}
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dự án</Label>
              <Select value={form.watch('project_id') || ''} onValueChange={(val) => form.setValue('project_id', val as string)}>
                <SelectTrigger className={cn(
                  "h-11 px-4 bg-slate-50 border-slate-200 hover:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl shadow-sm",
                  form.formState.errors.project_id && "border-red-500 bg-red-50"
                )}>
                  <div className="flex items-center gap-2.5 truncate">
                    <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Chọn dự án">
                      {form.watch('project_id') 
                        ? projects.find((p) => p.id === form.watch('project_id'))?.name 
                        : 'Chọn dự án'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="rounded-lg py-2.5 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                        <span className="font-medium text-slate-700">{p.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Người thực hiện</Label>
              <Select value={form.watch('assignee_id') || 'unassigned'} onValueChange={(val) => form.setValue('assignee_id', val === 'unassigned' ? null : val as any)}>
                <SelectTrigger className="h-11 px-4 bg-slate-50 border-slate-200 hover:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl shadow-sm">
                  <div className="flex items-center gap-2.5 truncate">
                    <UserCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Chọn người dùng">
                      {form.watch('assignee_id') && form.watch('assignee_id') !== 'unassigned'
                        ? members?.find((m) => m.user.id === form.watch('assignee_id'))?.user.name 
                        : 'Không có (Để trống)'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                  <SelectItem value="unassigned" className="rounded-lg py-2 text-slate-500 italic">Không có (Để trống)</SelectItem>
                  {members?.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id} className="rounded-lg py-2.5 cursor-pointer">
                      <span className="font-medium text-slate-700">{m.user.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</Label>
              <Select value={form.watch('status')} onValueChange={(val) => form.setValue('status', val as any)}>
                <SelectTrigger className="h-11 px-4 bg-slate-50 border-slate-200 hover:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl shadow-sm">
                  <div className="flex items-center gap-2.5 truncate">
                    {form.watch('status') === 'TO_DO' && <CircleDashed className="w-4 h-4 text-slate-400" />}
                    {form.watch('status') === 'IN_PROGRESS' && <Clock className="w-4 h-4 text-blue-500" />}
                    {form.watch('status') === 'IN_REVIEW' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    {form.watch('status') === 'DONE' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    <SelectValue placeholder="Trạng thái">
                      {form.watch('status') === 'TO_DO' && 'Cần làm'}
                      {form.watch('status') === 'IN_PROGRESS' && 'Đang làm'}
                      {form.watch('status') === 'IN_REVIEW' && 'Đang xem xét'}
                      {form.watch('status') === 'DONE' && 'Đã xong'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                  <SelectItem value="TO_DO" className="rounded-lg py-2 cursor-pointer font-medium text-slate-700">
                    <div className="flex items-center gap-2"><CircleDashed className="w-4 h-4 text-slate-400" />Cần làm</div>
                  </SelectItem>
                  <SelectItem value="IN_PROGRESS" className="rounded-lg py-2 cursor-pointer font-medium text-slate-700">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" />Đang làm</div>
                  </SelectItem>
                  <SelectItem value="IN_REVIEW" className="rounded-lg py-2 cursor-pointer font-medium text-slate-700">
                    <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" />Đang xem xét</div>
                  </SelectItem>
                  <SelectItem value="DONE" className="rounded-lg py-2 cursor-pointer font-medium text-slate-700">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Đã xong</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ưu tiên</Label>
              <Select value={form.watch('priority')} onValueChange={(val) => form.setValue('priority', val as any)}>
                <SelectTrigger className="h-11 px-4 bg-slate-50 border-slate-200 hover:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl shadow-sm">
                  <div className="flex items-center gap-2.5 truncate">
                    {form.watch('priority') === 'LOW' && <Flag className="w-4 h-4 text-slate-400" />}
                    {form.watch('priority') === 'MEDIUM' && <Flag className="w-4 h-4 text-blue-500" />}
                    {form.watch('priority') === 'HIGH' && <Flag className="w-4 h-4 text-orange-500 fill-orange-500/20" />}
                    {form.watch('priority') === 'URGENT' && <Flag className="w-4 h-4 text-red-600 fill-red-600/20" />}
                    <SelectValue placeholder="Ưu tiên">
                      {form.watch('priority') === 'LOW' && 'Thấp'}
                      {form.watch('priority') === 'MEDIUM' && 'Trung bình'}
                      {form.watch('priority') === 'HIGH' && 'Cao'}
                      {form.watch('priority') === 'URGENT' && 'Khẩn cấp'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1">
                  <SelectItem value="LOW" className="rounded-lg py-2 cursor-pointer font-medium text-slate-600">
                    <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-slate-400" />Thấp</div>
                  </SelectItem>
                  <SelectItem value="MEDIUM" className="rounded-lg py-2 cursor-pointer font-medium text-slate-700">
                    <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-blue-500" />Trung bình</div>
                  </SelectItem>
                  <SelectItem value="HIGH" className="rounded-lg py-2 cursor-pointer font-medium text-orange-700">
                    <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-orange-500 fill-orange-500/20" />Cao</div>
                  </SelectItem>
                  <SelectItem value="URGENT" className="rounded-lg py-2 cursor-pointer font-medium text-red-700 bg-red-50 focus:bg-red-100">
                    <div className="flex items-center gap-2"><Flag className="w-4 h-4 text-red-600 fill-red-600/20" />Khẩn cấp</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn chót</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex items-center justify-start rounded-xl text-sm font-medium transition-all border border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white px-4 h-11 w-full outline-none shadow-sm",
                    !form.watch('due_date') ? "text-slate-500" : "text-slate-900"
                  )}
                >
                  <CalendarIcon className="mr-2.5 h-4 w-4 shrink-0 text-slate-400" />
                  {form.watch('due_date') ? format(form.watch('due_date')!, 'dd/MM/yyyy') : <span>Chọn ngày...</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="end">
                  <Calendar
                    mode="single"
                    selected={form.watch('due_date') || undefined}
                    onSelect={(date) => form.setValue('due_date', date)}
                    initialFocus
                    locale={vi}
                    className="bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả chi tiết</Label>
            <Textarea 
              id="description" 
              placeholder="Bạn có thể sử dụng Markdown để định dạng văn bản (VD: **in đậm**, *in nghiêng*, list...)" 
              {...form.register('description')}
              className="min-h-[120px] resize-none px-4 py-3 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl shadow-sm"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 mt-6">
            <div className="flex items-center justify-end w-full gap-3 mt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={closeCreateTask}
                className="h-11 px-6 rounded-xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </Button>
              <Button 
                type="submit" 
                className="h-11 px-8 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                disabled={createTask.isPending}
              >
                {createTask.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Tạo Task'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
