'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function createClinicAction(formData: FormData) {
  // Use the admin service role to bypass RLS and create users directly
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const clinicName = formData.get('clinicName') as string;
  const orgSlug = formData.get('orgSlug') as string;
  const ownerName = formData.get('ownerName') as string;
  const ownerEmail = formData.get('ownerEmail') as string;
  const ownerPhone = formData.get('ownerPhone') as string;
  const password = formData.get('password') as string;
  const planCode = formData.get('planCode') as string;
  const subscriptionStatus = formData.get('subscriptionStatus') as string;

  if (!clinicName || !orgSlug || !ownerName || !ownerEmail || !password) {
    return { error: 'Missing required fields.' };
  }

  try {
    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail.toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
    const userId = authData.user.id;

    // 2. Create the profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      full_name: ownerName,
      phone: ownerPhone || null,
    });
    if (profileError) throw new Error(`Profile Error: ${profileError.message}`);

    // 3. Create the organization
    const { data: orgData, error: orgError } = await supabaseAdmin.from('organizations').insert({
      name: clinicName,
      slug: orgSlug.toLowerCase(),
      owner_profile_id: userId,
      plan_code: planCode,
      subscription_status: subscriptionStatus,
    }).select('id').single();
    if (orgError) throw new Error(`Organization Error: ${orgError.message}`);
    const orgId = orgData.id;

    // 4. Update default_organization_id on profile
    await supabaseAdmin.from('profiles').update({ default_organization_id: orgId }).eq('id', userId);

    // 5. Create organization membership (org_owner)
    const { error: memberError } = await supabaseAdmin.from('organization_memberships').insert({
      organization_id: orgId,
      profile_id: userId,
      role: 'org_owner',
      status: 'active',
    });
    if (memberError) throw new Error(`Membership Error: ${memberError.message}`);

    // 6. Fetch plan details and setup subscription
    const { data: planData } = await supabaseAdmin.from('subscription_plans').select('id').eq('plan_code', planCode).single();
    if (planData) {
      // Calculate dates
      const now = new Date();
      let trialEnd = null;
      let currentEnd = null;

      if (subscriptionStatus === 'trialing') {
        trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
        currentEnd = trialEnd;
      } else {
        currentEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default active
      }

      const { error: subError } = await supabaseAdmin.from('organization_subscriptions').insert({
        organization_id: orgId,
        plan_id: planData.id,
        status: subscriptionStatus,
        provider: 'manual_admin',
        current_period_start: now.toISOString(),
        current_period_end: currentEnd.toISOString(),
        trial_ends_at: trialEnd ? trialEnd.toISOString() : null,
      });
      if (subError) console.error('Subscription setup failed (non-fatal):', subError);
    }

  } catch (err: any) {
    console.error('Manual Registration Error:', err);
    return { error: err.message || 'Failed to provision tenant.' };
  }

  redirect('/admin/clinics');
}
