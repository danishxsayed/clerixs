'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function activateSubscriptionAction(formData: FormData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const orgId = formData.get('orgId') as string;
  const ownerEmail = formData.get('ownerEmail') as string;
  const orgName = formData.get('orgName') as string;
  const planId = formData.get('planId') as string;
  const billingCycle = formData.get('billingCycle') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  if (!orgId || !planId || !startDate || !endDate) return;

  try {
    // 1. Update the organization subscription
    await supabaseAdmin.from('organization_subscriptions').update({
      status: 'active',
      plan_id: planId,
      provider: 'manual_admin',
      current_period_start: new Date(startDate).toISOString(),
      current_period_end: new Date(endDate).toISOString(),
      trial_ends_at: null,
    }).eq('organization_id', orgId);

    // 2. Fetch plan details for email
    const { data: planData } = await supabaseAdmin.from('subscription_plans').select('name, plan_code').eq('id', planId).single();
    
    // 3. Sync status back to organizations table
    if (planData) {
      await supabaseAdmin.from('organizations').update({
        subscription_status: 'active',
        plan_code: planData.plan_code
      }).eq('id', orgId);
    }

    // 4. Send Welcome Email via Resend
    if (ownerEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Clerixs <noreply@clerixs.com>',
        to: ownerEmail,
        subject: `Welcome to Clerixs ${planData?.name}!`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">Your Plan is Active!</h1>
            <p>Hello,</p>
            <p>Good news! Your Clerixs <strong>${planData?.name}</strong> plan has been manually activated for <strong>${orgName}</strong>.</p>
            <p>Your subscription is valid until <strong>${new Date(endDate).toLocaleDateString()}</strong>.</p>
            <p>Thank you for choosing Clerixs!</p>
          </div>
        `
      });
    }

    revalidatePath(`/admin/clinics/${orgId}`);
    revalidatePath(`/admin/subscriptions`);
  } catch (err) {
    console.error('Failed to manually activate subscription', err);
  }
}

export async function extendTrialAction(formData: FormData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const orgId = formData.get('orgId') as string;
  const days = parseInt(formData.get('days') as string, 10);

  if (!orgId || isNaN(days)) return;

  try {
    // Fetch current trial
    const { data: subData } = await supabaseAdmin.from('organization_subscriptions').select('trial_ends_at, current_period_end').eq('organization_id', orgId).single();
    
    if (subData) {
      const baseDate = subData.trial_ends_at ? new Date(subData.trial_ends_at) : (subData.current_period_end ? new Date(subData.current_period_end) : new Date());
      const newTrialEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

      await supabaseAdmin.from('organization_subscriptions').update({
        trial_ends_at: newTrialEnd.toISOString(),
        current_period_end: newTrialEnd.toISOString(), // Extending the current access period
        status: 'trialing'
      }).eq('organization_id', orgId);

      await supabaseAdmin.from('organizations').update({
        subscription_status: 'trialing'
      }).eq('id', orgId);
    }

    revalidatePath(`/admin/clinics/${orgId}`);
    revalidatePath(`/admin/clinics`);
  } catch (err) {
    console.error('Failed to extend trial', err);
  }
}

export async function suspendAccountAction(formData: FormData) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const orgId = formData.get('orgId') as string;
  if (!orgId) return;

  try {
    await supabaseAdmin.from('organization_subscriptions').update({ status: 'suspended' }).eq('organization_id', orgId);
    await supabaseAdmin.from('organizations').update({ subscription_status: 'suspended' }).eq('id', orgId);
    revalidatePath(`/admin/clinics/${orgId}`);
    revalidatePath(`/admin/clinics`);
  } catch (err) {}
}

export async function reactivateAccountAction(formData: FormData) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const orgId = formData.get('orgId') as string;
  if (!orgId) return;

  try {
    // We assume it returns to 'active' or 'trialing', we'll default to active for safety.
    // In a real app we'd check if current_period_end is in the future.
    await supabaseAdmin.from('organization_subscriptions').update({ status: 'active' }).eq('organization_id', orgId);
    await supabaseAdmin.from('organizations').update({ subscription_status: 'active' }).eq('id', orgId);
    revalidatePath(`/admin/clinics/${orgId}`);
    revalidatePath(`/admin/clinics`);
  } catch (err) {}
}

export async function saveEnterpriseSettingsAction(formData: FormData) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const orgId = formData.get('orgId') as string;
  const ownerEmail = formData.get('ownerEmail') as string;
  const isEnterprise = formData.get('isEnterprise') === 'true';
  const maxBranches = parseInt(formData.get('maxBranches') as string, 10);

  if (!orgId || isNaN(maxBranches)) return;

  try {
    await supabaseAdmin.from('organizations').update({
      is_enterprise: isEnterprise,
      max_branches: maxBranches
    }).eq('id', orgId);

    // If turned ON, send email
    if (isEnterprise && ownerEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Clerixs Enterprise <enterprise@clerixs.com>',
        to: ownerEmail,
        subject: `Your Account has been Upgraded to Enterprise!`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h1 style="color: #b45309;">Enterprise Unlocked</h1>
            <p>Hello,</p>
            <p>Your Clerixs account has been officially upgraded to the <strong>Enterprise Tier</strong>.</p>
            <p>You can now create up to <strong>${maxBranches}</strong> branches directly from your Branches settings.</p>
            <p>Welcome to the top tier!</p>
          </div>
        `
      });
    }

    revalidatePath(`/admin/clinics/${orgId}`);
    revalidatePath(`/admin/clinics`);
  } catch (err) {
    console.error('Failed to save enterprise settings', err);
  }
}
