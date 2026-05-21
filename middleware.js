import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'eb_auth';

function parseAuthCookie(value) {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}

function redirectTo(request, pathname) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const auth = parseAuthCookie(request.cookies.get(AUTH_COOKIE)?.value);

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/client') ||
    pathname.startsWith('/provider');

  const isAuthPage =
    pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (isProtected) {
    if (!auth?.token) {
      return redirectTo(request, '/login');
    }

    if (pathname.startsWith('/dashboard') && auth.role !== 'admin') {
      return redirectTo(request, '/forbidden');
    }

    if (pathname.startsWith('/client') && auth.role !== 'client') {
      return redirectTo(request, '/forbidden');
    }

    if (pathname.startsWith('/provider') && auth.role !== 'provider') {
      return redirectTo(request, '/forbidden');
    }
  }

  if (isAuthPage && auth?.token) {
    if (auth.role === 'client') return redirectTo(request, '/client/properties');
    if (auth.role === 'provider') return redirectTo(request, '/provider/schedule');
    return redirectTo(request, '/dashboard');
  }

  if (pathname === '/') {
    if (auth?.token) {
      if (auth.role === 'client') return redirectTo(request, '/client/properties');
      if (auth.role === 'provider') return redirectTo(request, '/provider/schedule');
      return redirectTo(request, '/dashboard');
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/register', '/forgot-password', '/dashboard/:path*', '/client/:path*', '/provider/:path*'],
};
