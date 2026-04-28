'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { authStore } from '@/features/auth/stores/authStore';

export function WeeklyBarChart() {
  const { workspaceId } = authStore();

  const { data = [], isLoading } = useQuery({
    queryKey: ['reports', 'weekly-stats', workspaceId],
    queryFn: async () => {
      const res = await api.get('/reports/weekly-stats', {
        headers: { 'x-workspace-id': workspaceId }
      });
      return res.data.data;
    },
    enabled: !!workspaceId,
  });

  if (isLoading) return <div className="h-80 w-full animate-pulse bg-slate-50 rounded-xl" />;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" />
          <Bar 
            name="Hoàn thành" 
            dataKey="completed" 
            fill="#4f46e5" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
          <Bar 
            name="Tạo mới" 
            dataKey="created" 
            fill="#94a3b8" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
            opacity={0.3}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
