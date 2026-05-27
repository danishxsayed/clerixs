import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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
  '/settings',
  '/onboarding',
  '/verify',
  '/auth',
  '/login',
  '/signup',
];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Detect subdomain
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isAppSubdomain = hostname.startsWith('app.')
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // Redirect dashboard/app routes on the main domain to the app subdomain in production
  if (!isLocalhost && !isAppSubdomain && !isAdminSubdomain) {
    const isAppPath = APP_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
    if (isAppPath) {
      return NextResponse.redirect(`https://app.clerixs.com${pathname}${request.nextUrl.search}`)
    }
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
