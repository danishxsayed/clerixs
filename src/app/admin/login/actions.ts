'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function adminLogin(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/admin/login?message=Email and password are required')
  }

  let authError;
  let user;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })
    authError = error;
    user = data.user;
  } catch (err) {
    console.error('Admin login error:', err);
    authError = { message: 'Network timeout or server error. Please try again.' };
  }

  if (authError || !user) {
    return redirect(`/admin/login?message=${authError?.message || 'Invalid credentials'}`)
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'clerixsofficial@gmail.com'

  if (user.email !== adminEmail) {
    // If authenticated but email does not match administrative threshold, sign out immediately and deny access
    await supabase.auth.signOut()
    return redirect('/admin/login?message=Access denied. Administrators only.')
  }

  redirect('/admin/dashboard')
}
