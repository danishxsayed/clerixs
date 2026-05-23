import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Detect subdomain
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isAppSubdomain = hostname.startsWith('app.')

  // Admin subdomain handling
  if (isAdminSubdomain) {
    // If trying to access root, redirect to admin dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
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
