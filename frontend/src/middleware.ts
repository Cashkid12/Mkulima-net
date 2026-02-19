import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /dashboard to /dashboard/dashboard-home
  if (request.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/dashboard-home', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};