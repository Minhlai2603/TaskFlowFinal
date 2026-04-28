import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 phút — data fresh
      gcTime: 5 * 60 * 1000,      // 5 phút — giữ cache sau khi unmount
      retry: 1,                   // 1 lần retry tự động
      refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    },
  },
});
