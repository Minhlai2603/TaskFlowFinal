import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-6 rounded-full bg-amber-100 p-4 text-amber-600">
        <ShieldAlert size={48} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Truy cập bị từ chối</h1>
      <p className="mb-8 max-w-sm text-slate-600">
        Bạn không có quyền truy cập vào khu vực này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là một lỗi.
      </p>
      <Link href="/app/my-tasks" passHref>
        <Button variant="default">Quay lại công việc của tôi</Button>
      </Link>
    </div>
  );
}
