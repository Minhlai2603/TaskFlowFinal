'use client';

import { WeeklyBarChart } from '@/features/reports/components/WeeklyBarChart';
import { MemberStatsTable } from '@/features/reports/components/MemberStatsTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, TrendingUp, Users } from 'lucide-react';
import { authStore } from '@/features/auth/stores/authStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ReportsPage() {
  const { workspaceRole } = authStore();
  const canViewReports = workspaceRole === 'ADMIN' || workspaceRole === 'MANAGER';

  if (!canViewReports) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Truy cập bị từ chối</AlertTitle>
          <AlertDescription>
            Bạn không có quyền xem báo cáo của workspace này. Chỉ Admin và Manager mới có quyền truy cập.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Báo cáo & Thống kê</h1>
        <p className="text-slate-500">Theo dõi hiệu suất làm việc của cả team trong 7 ngày qua.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for Quick Stats if needed later */}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-lg font-bold">Tiến độ tuần</CardTitle>
            </div>
            <CardDescription className="text-xs">So sánh lượng task tạo mới và hoàn thành.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <WeeklyBarChart />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-lg font-bold">Hiệu suất thành viên</CardTitle>
            </div>
            <CardDescription className="text-xs">Xếp hạng thành viên theo số lượng task hoàn thành.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <MemberStatsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
