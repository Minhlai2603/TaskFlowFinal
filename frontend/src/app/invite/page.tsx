'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyInvite, acceptInvite } from '@/features/workspaces/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authStore } from '@/features/auth/stores/authStore';

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { setAuth } = authStore();

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
  const [inviteData, setInviteData] = useState<any>(null);
  const [userExists, setUserExists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new user
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    verifyInvite(token)
      .then((res) => {
        setInviteData(res.data.invite);
        setUserExists(res.data.userExists);
        setStatus('valid');
      })
      .catch(() => {
        setStatus('invalid');
      });
  }, [token]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const userData = userExists ? undefined : { name, password };
      const res = await acceptInvite(token!, userData);
      
      const { user, workspaceId, workspaceRole, workspaces = [] } = res.data;
      setAuth(user, workspaceId, workspaceRole as any, workspaces as any);
      
      setStatus('success');
      toast.success('Đã tham gia workspace thành công!');
      
      setTimeout(() => {
        router.push('/app/my-tasks');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Tham gia thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (status === 'invalid') {
    return (
      <Card className="w-full max-w-md border-red-100 shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle>Lời mời không hợp lệ</CardTitle>
          <CardDescription>Link mời này đã hết hạn hoặc không tồn tại.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/login')} className="w-full">Quay lại Đăng nhập</Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md border-emerald-100 shadow-xl text-center animate-in zoom-in-95 duration-500">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <CardTitle>Thành công!</CardTitle>
          <CardDescription>Bạn đang được chuyển hướng đến workspace của mình...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Chào mừng!</CardTitle>
        <CardDescription>
          Bạn được mời tham gia workspace <span className="font-bold text-indigo-600">{inviteData?.workspace?.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userExists ? (
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 text-center">
            Tài khoản <strong className="text-slate-900">{inviteData?.email}</strong> đã tồn tại. 
            Nhấn nút bên dưới để tham gia ngay.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={inviteData?.email} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input 
                id="name" 
                placeholder="Nguyễn Văn A" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAccept} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
          disabled={isSubmitting || (!userExists && (!name || !password))}
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : (userExists ? 'Đồng ý tham gia' : 'Tạo tài khoản & Tham gia')}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <InviteContent />
      </Suspense>
    </div>
  );
}
