'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
        <AlertCircle size={48} />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Đã xảy ra lỗi!</h1>
      <p className="mb-8 max-w-md text-slate-600">
        Chúng tôi rất tiếc vì sự bất tiện này. Một lỗi hệ thống đã xảy ra.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Thử lại
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline">
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
