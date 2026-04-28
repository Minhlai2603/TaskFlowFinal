'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-600 text-white py-1 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 z-[9999] sticky top-0 animate-in slide-in-from-top duration-300">
      <WifiOff className="w-3 h-3" />
      <span>Mất kết nối internet. Một số tính năng có thể không hoạt động ổn định.</span>
    </div>
  );
}
