import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // 로그아웃 요청이 들어오면 쿠키를 삭제하고 로그인 페이지로 리다이렉트
  if (request.nextUrl.pathname === '/auth/logout') {
    return NextResponse.redirect(new URL('/auth/login', request.url), {
      headers: {
        'Set-Cookie': 'auth.access_token=deleted; Path=/; Max-Age=-1',
      },
    });
  }
  // 로그인이 되어 있지 않은 경우 로그인 페이지로 리다이렉트
  if (
    !request.cookies.get('auth.access_token') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt).*)',
  ],
};
