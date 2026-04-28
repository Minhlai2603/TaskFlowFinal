'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { uiStore } from '@/features/ui/stores/uiStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { openTaskSlideOver } = uiStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await api.get(`/tasks/search?q=${encodeURIComponent(debouncedQuery)}`);
      return res.data.data;
    },
    enabled: debouncedQuery.length > 0,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (taskId: string) => {
    openTaskSlideOver(taskId);
    setIsOpen(false);
    setQuery('');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TO_DO': return 'Việc cần làm';
      case 'IN_PROGRESS': return 'Đang làm';
      case 'IN_REVIEW': return 'Đang xem xét';
      case 'DONE': return 'Đã xong';
      default: return status;
    }
  };

  return (
    <div className="relative w-96 hidden sm:block" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Tìm kiếm task, dự án..."
        className="pl-9 h-9 bg-slate-100 border-none focus-visible:ring-1 focus-visible:ring-indigo-500/20 text-sm w-full transition-all"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
        </div>
      )}

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kết quả tìm kiếm</p>
                {results.map((task: any) => (
                  <button
                    key={task.id}
                    onClick={() => handleResultClick(task.id)}
                    className="w-full flex flex-col gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {task.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-200 text-slate-500 shrink-0">
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: task.project.color }} 
                      />
                      <span className="truncate">{task.project.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : !isLoading ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 italic">Không tìm thấy kết quả phù hợp</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
