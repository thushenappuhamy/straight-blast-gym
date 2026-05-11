import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the request is for admin routes
  if (pathname.startsWith('/admin')) {
    // Skip middleware for /admin/setup and /admin/login
    if (pathname === '/admin/setup' || pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  // Check if user is trying to access protected member routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};