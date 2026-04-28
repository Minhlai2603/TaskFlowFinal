import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="mb-6 rounded-full bg-indigo-100 p-4 text-indigo-600">
        <FileQuestion size={48} />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">404 - Không tìm thấy trang</h1>
      <p className="mb-8 max-w-md text-slate-600">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link href="/app/my-tasks" passHref>
        <Button variant="default">Quay lại trang chính</Button>
      </Link>
    </div>
  );
}
