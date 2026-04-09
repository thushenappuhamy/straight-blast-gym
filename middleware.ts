import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log(`🔐 [MIDDLEWARE] Path: ${pathname}`);

  // Check if the request is for admin routes
  if (pathname.startsWith('/admin')) {
    console.log(`🔐 [MIDDLEWARE] Admin route detected`);
    
    // Skip middleware for /admin/setup and /admin/login
    if (pathname === '/admin/setup' || pathname === '/admin/login') {
      console.log(`🔐 [MIDDLEWARE] Skipping auth for setup/login`);
      return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('authToken')?.value;
    console.log(`🔐 [MIDDLEWARE] Token exists: ${!!token}`);

    if (!token) {
      console.log(`🔐 [MIDDLEWARE] No token, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log(`🔐 [MIDDLEWARE] Token found, allowing access (verification done by API)`);
    return NextResponse.next();
  }

  // Check if user is trying to access protected member routes
  if (pathname.startsWith('/dashboard')) {
    console.log(`🔐 [MIDDLEWARE] Dashboard route detected`);
    
    const token = request.cookies.get('authToken')?.value;
    console.log(`🔐 [MIDDLEWARE] Token exists: ${!!token}`);

    if (!token) {
      console.log(`🔐 [MIDDLEWARE] No token, redirecting to login`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log(`🔐 [MIDDLEWARE] Token found, allowing access (verification done by API)`);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
