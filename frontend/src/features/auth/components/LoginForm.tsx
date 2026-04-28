'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { LoginInput } from '../api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Re-defining schema locally to avoid cross-workspace issues in build
import { z } from 'zod';
const localLoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export function LoginForm() {
  const { login } = useAuth();
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(localLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginInput) => {
    login.mutate(data);
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Chào mừng trở lại</CardTitle>
        <CardDescription className="text-slate-500">
          Nhập email của bạn để đăng nhập vào TaskFlow
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all outline-none"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-xs font-medium text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700">Mật khẩu</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all outline-none"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-xs font-medium text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 transition-all shadow-md active:scale-[0.98]"
            disabled={login.isPending}
          >
            {login.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Đăng nhập'}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
