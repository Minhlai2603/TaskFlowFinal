'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { authStore } from '@/features/auth/stores/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export function MemberStatsTable() {
  const { workspaceId } = authStore();

  const { data = [], isLoading } = useQuery({
    queryKey: ['reports', 'member-stats', workspaceId],
    queryFn: async () => {
      const res = await api.get('/reports/member-stats', {
        headers: { 'x-workspace-id': workspaceId }
      });
      return res.data.data;
    },
    enabled: !!workspaceId,
  });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 w-full animate-pulse bg-slate-50 rounded-lg" />)}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-slate-100">
          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thành viên</TableHead>
          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Tổng Task</TableHead>
          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hoàn thành</TableHead>
          <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Hiệu suất</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((member: any) => (
          <TableRow key={member.userId} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.name}</p>
                  <p className="text-[10px] text-slate-400">{member.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-center text-sm font-medium text-slate-600">{member.total}</TableCell>
            <TableCell className="text-center text-sm font-medium text-emerald-600">{member.completed}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-xs font-bold text-slate-700 w-8">{member.efficiency}%</span>
                <div className="w-24">
                  <Progress value={member.efficiency} className="h-1.5" />
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
