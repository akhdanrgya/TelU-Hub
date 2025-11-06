import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/register']; 
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/(public)');

  const authRoutes = ['/(auth)'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicRoute && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};