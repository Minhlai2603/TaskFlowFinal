import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedPage = pathname.startsWith('/app');
  const isInvitePage = pathname.startsWith('/invite');

  // Invite page không cần auth — cho qua
  if (isInvitePage) {
    return NextResponse.next();
  }

  // Protected route mà không có cookie → redirect login
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages (login/register) mà đã có cookie → redirect dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/app/my-tasks', request.url));
  }

  // Redirect root đến dashboard hoặc login
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/app/my-tasks', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
