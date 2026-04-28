'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { authStore } from '@/features/auth/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function WorkspaceSettings() {
  const { workspaceId, workspaceRole } = authStore();
  const { workspace, updateWorkspace, isLoading } = useWorkspace(workspaceId || undefined);
  const [name, setName] = useState('');

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
    }
  }, [workspace]);

  const isAdmin = workspaceRole === 'ADMIN';

  const handleUpdate = () => {
    if (name.length < 2) return;
    updateWorkspace.mutate(name);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Cài đặt Workspace</CardTitle>
        <CardDescription>Quản lý thông tin chung của không gian làm việc</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ws-name">Tên Workspace</Label>
          <Input 
            id="ws-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            className="max-w-md"
          />
          {!isAdmin && <p className="text-xs text-amber-600 font-medium">Chỉ Admin mới có quyền đổi tên Workspace.</p>}
        </div>
      </CardContent>
      {isAdmin && (
        <CardFooter>
          <Button 
            onClick={handleUpdate} 
            disabled={updateWorkspace.isPending || name === workspace?.name}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {updateWorkspace.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
