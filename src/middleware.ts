import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Detect environment & subdomain
  const isDev = hostname.includes('localhost') || hostname.includes('127.0.0.1') || process.env.NODE_ENV === 'development'
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isAppSubdomain = hostname.startsWith('app.')

  // Roster of paths belonging exclusively to the app workspace domain
  const APP_PATHS = [
    '/dashboard',
    '/patients',
    '/appointments',
    '/treatments',
    '/lab',
    '/billing',
    '/reports',
    '/staff',
    '/branches',
    '/files',
    '/whatsapp',
    '/auth',
    '/onboarding',
    '/verify',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  const isAppPath = APP_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Force app subdomain redirect in production if app routes are accessed on main domain
  if (!isDev && !isAppSubdomain && !isAdminSubdomain && isAppPath) {
    const appUrl = new URL(request.url)
    appUrl.hostname = 'app.clerixs.com'
    return NextResponse.redirect(appUrl)
  }

  // Admin subdomain handling
  if (isAdminSubdomain) {
    // If trying to access root, redirect to admin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    // Block standard auth routes on admin domain
    if (pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // If not accessing admin routes, rewrite to admin
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
    }
  }

  // App subdomain handling
  if (isAppSubdomain) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Main domain — serve marketing pages
  // Continue with existing session update
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
