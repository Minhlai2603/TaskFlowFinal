'use client';

import { useEffect, useState } from 'react';
import { uiStore } from '@/features/ui/stores/uiStore';
import { authStore } from '@/features/auth/stores/authStore';
import { getTask } from '../api';
import { useTasks } from '../hooks/useTasks';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CommentSection } from './CommentSection';
import { ActivityLogList } from './ActivityLogList';
import { 
  CalendarIcon, 
  User, 
  Clock, 
  MoreVertical,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function TaskSlideOver() {
  const { taskSlideOverId, closeTaskSlideOver } = uiStore();
  const { workspaceId } = authStore();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const { updateTask } = useTasks();
  const { members } = useWorkspace(workspaceId || undefined);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  useEffect(() => {
    if (taskSlideOverId && workspaceId) {
      setLoading(true);
      getTask(workspaceId, taskSlideOverId)
        .then((res) => setTask(res.data))
        .finally(() => setLoading(false));
    } else {
      setTask(null);
    }
  }, [taskSlideOverId, workspaceId]);

  useEffect(() => {
    if (task) {
      setTitleValue(task.title || '');
      setDescValue(task.description || '');
    }
  }, [task]);

  const handleUpdateField = (field: string, value: any) => {
    if (!task) return;
    updateTask.mutate({ id: task.id, data: { [field]: value } });
    // Optimistic local state update
    setTask({ ...task, [field]: value });
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== task.title) {
      handleUpdateField('title', titleValue.trim());
    } else {
      setTitleValue(task.title); // reset
    }
  };

  const handleDescSubmit = () => {
    setIsEditingDesc(false);
    if (descValue !== task.description) {
      handleUpdateField('description', descValue);
    }
  };

  return (
    <Sheet open={!!taskSlideOverId} onOpenChange={closeTaskSlideOver}>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col border-l border-slate-200 shadow-2xl">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : task ? (
          <>
            <SheetHeader className="p-6 border-b border-slate-100 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2 flex-1 mr-4">
                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
                {isEditingTitle ? (
                  <Input 
                    value={titleValue}
                    onChange={e => setTitleValue(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                    autoFocus
                    className="h-8 font-bold text-lg"
                  />
                ) : (
                  <SheetTitle 
                    className="text-lg font-bold text-slate-900 truncate cursor-text hover:bg-slate-50 px-1 rounded transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {task.title}
                  </SheetTitle>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8 pb-0">
                {/* Status & Priority Row */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</p>
                    <Select value={task.status} onValueChange={(val) => handleUpdateField('status', val)}>
                      <SelectTrigger className="h-7 px-2.5 text-xs font-semibold border-none bg-indigo-50 text-indigo-700 w-auto inline-flex shadow-none hover:bg-indigo-100 transition-colors focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TO_DO">Cần làm</SelectItem>
                        <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                        <SelectItem value="IN_REVIEW">Đang xem xét</SelectItem>
                        <SelectItem value="DONE">Đã xong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ ưu tiên</p>
                    <Select value={task.priority} onValueChange={(val) => handleUpdateField('priority', val)}>
                      <SelectTrigger className="h-7 px-2.5 text-xs font-semibold border-none bg-orange-50 text-orange-700 w-auto inline-flex shadow-none hover:bg-orange-100 transition-colors focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-24 text-slate-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Người nhận
                    </div>
                    <Select value={task.assignee_id || 'unassigned'} onValueChange={(val) => handleUpdateField('assignee_id', val === 'unassigned' ? null : val)}>
                      <SelectTrigger className="h-8 border-none bg-transparent hover:bg-slate-50 px-2 shadow-none gap-2 justify-start min-w-[140px] focus:ring-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                            {task.assignee?.name.charAt(0) || '?'}
                          </div>
                          <span className="text-slate-700 font-medium">{task.assignee?.name || 'Chưa gán'}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Chưa gán</SelectItem>
                        {members?.map((m: any) => (
                          <SelectItem key={m.user.id} value={m.user.id}>{m.user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-24 text-slate-400 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Hạn chót
                    </div>
                    <Popover>
                      <PopoverTrigger className="h-8 px-2 text-slate-700 font-medium border-none bg-transparent hover:bg-slate-50 shadow-none text-left rounded-md transition-colors">
                        {task.due_date ? format(new Date(task.due_date), 'PPP', { locale: vi }) : 'Không có'}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={task.due_date ? new Date(task.due_date) : undefined}
                          onSelect={(date) => handleUpdateField('due_date', date ? date.toISOString() : null)}
                          initialFocus
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="w-24 text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ngày tạo
                    </div>
                    <div className="text-slate-500 px-2">
                      {format(new Date(task.created_at), 'PPP', { locale: vi })}
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Description */}
                <div className="space-y-3 group">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mô tả chi tiết</p>
                    {!isEditingDesc && (
                      <button 
                        onClick={() => setIsEditingDesc(true)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-3 h-3" />
                        Sửa
                      </button>
                    )}
                  </div>
                  
                  {isEditingDesc ? (
                    <div className="space-y-3">
                      <Textarea 
                        value={descValue}
                        onChange={(e) => setDescValue(e.target.value)}
                        className="min-h-[150px] font-mono text-sm resize-none focus-visible:ring-indigo-500"
                        placeholder="Hỗ trợ Markdown..."
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setIsEditingDesc(false);
                          setDescValue(task.description || '');
                        }}>Hủy</Button>
                        <Button size="sm" onClick={handleDescSubmit} className="bg-indigo-600 hover:bg-indigo-700">Lưu</Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl min-h-[100px] cursor-text transition-all",
                        task.description ? "" : "italic text-slate-400 flex items-center justify-center"
                      )}
                      onClick={() => setIsEditingDesc(true)}
                    >
                      {task.description ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4 text-slate-900" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3 text-slate-900" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-slate-900" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            a: ({node, ...props}) => <a className="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-200 pl-4 italic text-slate-600 bg-indigo-50/50 py-1 pr-4 mb-2 rounded-r" {...props} />,
                            code: ({node, inline, ...props}: any) => inline 
                              ? <code className="bg-slate-200/60 text-indigo-700 px-1.5 py-0.5 rounded text-[13px] font-mono border border-slate-200/50" {...props} /> 
                              : <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-[13px] font-mono mb-2 shadow-sm"><code {...props} /></pre>
                          }}
                        >
                          {task.description}
                        </ReactMarkdown>
                      ) : (
                        "Không có mô tả. Nhấn vào đây để thêm mô tả..."
                      )}
                    </div>
                  )}
                </div>

                {/* Tabs: Comments vs Activity */}
                <Tabs defaultValue="comments" className="w-full mt-6">
                  <TabsList className="w-full grid grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="comments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Bình luận
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      Hoạt động
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="comments" className="mt-0 focus-visible:outline-none">
                    <CommentSection taskId={task.id} />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
                    <ActivityLogList logs={task.activity_logs || []} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p>Không tìm thấy dữ liệu task</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
