'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { RegisterInput } from '../api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const localRegisterSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export function RegisterForm() {
  const { register: registerAction } = useAuth();
  
  const form = useForm<RegisterInput>({
    resolver: zodResolver(localRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerAction.mutate(data);
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Bắt đầu miễn phí</CardTitle>
        <CardDescription className="text-slate-500">
          Tạo tài khoản TaskFlow để quản lý công việc hiệu quả hơn
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-700">Họ và tên</Label>
            <Input
              id="name"
              placeholder="Nguyễn Văn A"
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all outline-none"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs font-medium text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
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
            <Label htmlFor="password" className="text-slate-700">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
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
            disabled={registerAction.isPending}
          >
            {registerAction.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Tạo tài khoản'}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
