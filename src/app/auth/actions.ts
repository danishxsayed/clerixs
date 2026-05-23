'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return redirect('/auth/login?message=Email and password are required')
  }

  let authError;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })
    authError = error;
  } catch (err) {
    console.error('Login error:', err);
    authError = { message: 'Network timeout or server error. Please try again.' };
  }

  if (authError) {
    return redirect(`/auth/login?message=${authError.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    return redirect('/auth/signup?message=All fields are required')
  }

  let authError;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
          data: {
              full_name: fullName
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') 
            ? 'http://localhost:3000' 
            : 'https://clerixs.vercel.app'
      }
    })
    authError = error;
  } catch (err) {
    console.error('Signup error:', err);
    authError = { message: 'Network timeout or server error. Please try again.' };
  }

  if (authError) {
    return redirect(`/auth/signup?message=${authError.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function acceptInvite(formData: FormData) {
  const supabase = await createClient()

  const token = formData.get('token') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!token || !email || !password || !fullName) {
    return redirect(`/auth/invite?token=${token}&message=All fields are required`)
  }

  // 1. Hash securely to find invite
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  let inviteData, inviteErrorObj;
  try {
    const { data: invite, error: inviteError } = await supabase
      .from('staff_invites')
      .select('*')
      .eq('invite_token_hash', tokenHash)
      .is('accepted_at', null)
      .maybeSingle()
    inviteData = invite;
    inviteErrorObj = inviteError;
  } catch (err) {
    console.error('Invite fetch error:', err);
    inviteErrorObj = { message: 'Network timeout.' };
  }

  if (inviteErrorObj || !inviteData) {
    return redirect('/auth/login?message=Invalid or expired invite link. Please ask your admin to re-send it.')
  }

  const invite = inviteData;

  // Check Expiry
  if (new Date(invite.expires_at) < new Date()) {
    return redirect('/auth/login?message=This invite link has expired.')
  }

  // Double check emails match
  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    return redirect(`/auth/invite?token=${token}&message=This invite is strictly for ${invite.email}`)
  }

  // 2. Try signing in first (for existing or zombie users)
  let userId: string | null = null;
  let isNewUser = false;
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (signInData?.user) {
    userId = signInData.user.id;
  } else {
    isNewUser = true;
    // 3. Fallback to Sign Up if they truly don't exist
    let signUpDataResult, signUpErrorObj;
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
            data: {
                full_name: fullName,
                is_staff_invite: 'true'
            },
            emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') 
              ? 'http://localhost:3000' 
              : 'https://clerixs.vercel.app'
        }
      })
      signUpDataResult = signUpData;
      signUpErrorObj = signUpError;
    } catch (err) {
      console.error('Invite signup error:', err);
      signUpErrorObj = { message: 'Network timeout or server error. Please try again.' };
    }

    if (signUpErrorObj) {
      if (signUpErrorObj.message.includes('already registered')) {
        return redirect(`/auth/invite?token=${token}&message=Account exists. Please use your exact existing password to accept the invite.`)
      }
      return redirect(`/auth/invite?token=${token}&message=${signUpErrorObj.message}`)
    }

    if (!signUpDataResult?.user) {
      return redirect(`/auth/invite?token=${token}&message=Failed to create account.`)
    }
    userId = signUpDataResult.user.id;
  }

  if (!isNewUser) {
    // Check if they already have a membership from the backend trigger!
    const { data: existingMembership } = await supabase
      .from('organization_memberships')
      .select('id, role')
      .eq('organization_id', invite.organization_id)
      .eq('profile_id', userId)
      .maybeSingle();

    if (!existingMembership) {
      // 4. Guarantee the membership creation for true zombies
      const { error: processError } = await supabase.rpc('process_existing_user_invite', {
        p_invite_id: invite.id,
        p_user_id: userId
      });

      if (processError) {
        console.error('Invite processing error:', processError);
        return redirect(`/auth/invite?token=${token}&message=Failed to attach you to the clinic.`)
      }
    } else {
      // If they already have a membership, just neutralize the invite record without modifying their role!
      const { error: updateError } = await supabase
        .from('staff_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Failed to mark existing membership invite as accepted:', updateError);
        return redirect(`/auth/invite?token=${token}&message=Failed to complete invitation processing.`);
      }
    }
  }

  if (isNewUser) {
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth/login?message=To join the clinic please check your inbox and verify your email, then try to login.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) {
    return redirect('/auth/forgot-password?message=Email is required');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') ? 'http://localhost:3000' : 'https://clerixs.vercel.app'}/auth/reset-password`,
  });

  if (error) {
    return redirect(`/auth/forgot-password?message=${error.message}`);
  }

  return redirect(`/auth/forgot-password?success=${encodeURIComponent('Check your email for the password reset link.')}`);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  if (!password || password.length < 6) {
    return redirect('/auth/reset-password?message=Password must be at least 6 characters');
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(`/auth/reset-password?message=${error.message}`);
  }

  return redirect(`/auth/reset-password?success=${encodeURIComponent('Password has been successfully updated.')}`);
}
