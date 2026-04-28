'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/features/settings/components/ProfileSettings';
import { WorkspaceSettings } from '@/features/settings/components/WorkspaceSettings';
import { MemberSettings } from '@/features/settings/components/MemberSettings';
import { User, Settings, Users } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cài đặt</h1>
        <p className="text-slate-500 text-sm">Quản lý tài khoản và không gian làm việc của bạn.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Cá nhân
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="members" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Thành viên
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="focus-visible:outline-none">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="workspace" className="focus-visible:outline-none">
          <WorkspaceSettings />
        </TabsContent>
        
        <TabsContent value="members" className="focus-visible:outline-none">
          <MemberSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
