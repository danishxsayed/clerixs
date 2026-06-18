import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Cached helpers — React cache() deduplicates these within a single render pass.
 * Calling getSessionUser() 10 times in the same request only hits Supabase ONCE.
 */

/** Returns the authenticated Supabase user, or null. Deduplicated per request. */
export const getSessionUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
})

/** Returns the user's profile row. Deduplicated per request. */
export const getSessionProfile = cache(async () => {
  const user = await getSessionUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('full_name, default_organization_id, specialty, avatar_url')
    .eq('id', user.id)
    .single()
  return data ?? null
})

/** Returns the user's org membership for the given org. Deduplicated per (orgId) per request. */
export const getSessionMembership = cache(async (orgId: string) => {
  const user = await getSessionUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('organization_memberships')
    .select('id, role, status')
    .eq('organization_id', orgId)
    .eq('profile_id', user.id)
    .single()
  return data ?? null
})

export async function requireAuthAndRole(allowedRoles: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!membership || !allowedRoles.includes(membership.role)) {
    // If not authorized, return false. Consumers should decide to redirect.
    return { authorized: false, user, role: membership?.role };
  }

  return { authorized: true, user, role: membership.role };
}

