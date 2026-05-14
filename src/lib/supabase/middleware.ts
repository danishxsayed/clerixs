import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = [
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
];

const SUBSCRIPTION_EXEMPT_PATHS = [
  '/',
  '/settings',
  '/pricing',
  '/about',
  '/blog',
  '/careers',
  '/contact',
  '/api',
  '/auth',
  '/login',
  '/signup',
  '/onboarding',
  '/forgot-password',
  '/reset-password',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function isExemptPath(pathname: string): boolean {
  return SUBSCRIPTION_EXEMPT_PATHS.some((p) => {
    if (p === '/') return pathname === '/';
    return pathname.startsWith(p);
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase URL or Anon Key is missing. Continuing without session refresh.');
      return supabaseResponse;
    }
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from app routes
  if (!user && !isExemptPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (
    user &&
    (pathname.startsWith('/login') || pathname.startsWith('/signup'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Subscription guard — only for protected routes
  if (user && isProtectedPath(pathname) && !isExemptPath(pathname)) {
    // Read cached subscription status from user metadata (set by actions/verify-payment)
    // This avoids a DB query on every request
    const userMeta = user.user_metadata || {};
    const subStatus: string | undefined = userMeta.sub_status;
    const subExpires: string | undefined = userMeta.sub_expires;

    const now = new Date();
    let hasValidSubscription = false;

    if (subStatus === 'active') {
      hasValidSubscription = true;
    } else if (subStatus === 'trialing' && subExpires) {
      hasValidSubscription = new Date(subExpires) > now;
    }

    if (!hasValidSubscription) {
      // Check account age — only redirect if account is older than 7 days
      const createdAt = user.created_at ? new Date(user.created_at) : null;
      const accountAgeDays = createdAt
        ? Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24))
        : 0;

      if (accountAgeDays >= 7) {
        const url = request.nextUrl.clone();
        url.pathname = '/settings/subscription';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
