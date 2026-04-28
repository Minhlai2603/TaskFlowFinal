'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { updateProfile } from '@/features/auth/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export function ProfileSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (name.length < 2) {
      toast.error('Tên phải có ít nhất 2 ký tự');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ name });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error('Cập nhật thất bại');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Hồ sơ cá nhân</CardTitle>
        <CardDescription>Cập nhật thông tin hiển thị của bạn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (Không thể thay đổi)</Label>
          <Input 
            id="email" 
            value={user?.email || ''} 
            disabled 
            className="max-w-md bg-slate-50 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 italic">Liên hệ Admin nếu bạn cần đổi Email.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating || name === user?.name}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
        </Button>
      </CardFooter>
    </Card>
  );
}
