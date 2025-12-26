import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './lib/auth-edge';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Explicitly skip all API routes
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  console.log('Middleware - Path:', path);

  // Create response
  let response = NextResponse.next();

  // Add pathname to headers for layout
  response.headers.set('x-pathname', path);

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Check if path starts with /admin
  const isAdminRoute = path.startsWith('/admin') && 
                       !path.startsWith('/admin/login') && 
                       !path.startsWith('/admin/setup') &&
                       !path.startsWith('/admin/reset-password');

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - Is admin route:', isAdminRoute);

  // If admin route and no token, redirect to login
  if (isAdminRoute && !token) {
    console.log('Middleware - Redirecting to login (no token)');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If admin route with token, verify it
  if (isAdminRoute && token) {
    const verified = await verifyTokenEdge(token);
    console.log('Middleware - Token verified:', !!verified);

    if (!verified) {
      console.log('Middleware - Redirecting to login (invalid token)');
      const loginResponse = NextResponse.redirect(new URL('/admin/login', request.url));
      loginResponse.cookies.delete('auth-token');
      return loginResponse;
    }

    console.log('Middleware - Token payload:', verified);
  }

  // If on login page with valid token, redirect to dashboard
  if (path === '/admin/login' && token) {
    const verified = await verifyTokenEdge(token);
    console.log('Middleware - On login page with token, payload:', verified);
    
    if (verified) {
      console.log('Middleware - Redirecting to dashboard (already logged in)');
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  console.log('Middleware - Allowing request');
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
