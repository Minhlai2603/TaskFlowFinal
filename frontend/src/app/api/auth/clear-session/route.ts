import { NextResponse } from 'next/server';

/**
 * API route để clear auth cookie từ server side.
 * Được gọi khi axios interceptor nhận 401 (token expired).
 * Cookie httpOnly không xóa được bằng JS, cần server để xóa.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('token');
  return response;
}
