'use client';

import { useState } from 'react';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { authStore } from '@/features/auth/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function MemberSettings() {
  const { workspaceId, workspaceRole, user: currentUser } = authStore();
  const { members, inviteMember, removeMember, isLoading } = useWorkspace(workspaceId || undefined);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const canInvite = workspaceRole === 'ADMIN' || workspaceRole === 'MANAGER';
  const isAdmin = workspaceRole === 'ADMIN';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMember.mutate({ email: inviteEmail, role: inviteRole }, {
      onSuccess: () => setInviteEmail(''),
    });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      {canInvite && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Mời thành viên
            </CardTitle>
            <CardDescription>Gửi email mời thành viên mới tham gia không gian làm việc của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="dong-nghiep@cong-ty.com" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select value={inviteRole} onValueChange={(val) => val && setInviteRole(val)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    {isAdmin && <SelectItem value="ADMIN">Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6"
                disabled={inviteMember.isPending || !inviteEmail}
              >
                {inviteMember.isPending ? <Loader2 className="animate-spin" /> : 'Gửi lời mời'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Danh sách thành viên</CardTitle>
          <CardDescription>Tổng số {members?.length || 0} thành viên trong workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Thành viên</TableHead>
                <TableHead>Vai trò</TableHead>
                {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{member.user.name} {member.user_id === currentUser?.id && '(Bạn)'}</span>
                      <span className="text-xs text-slate-500">{member.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className={
                      member.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' : 
                      member.role === 'MANAGER' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 
                      'bg-slate-100 text-slate-600 hover:bg-slate-100'
                    }>
                      {member.role}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {member.user_id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            } 
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa thành viên?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này sẽ xóa <strong>{member.user.name}</strong> khỏi workspace. Họ sẽ không còn quyền truy cập vào các dự án và task.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removeMember.mutate(member.user_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa ngay
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
