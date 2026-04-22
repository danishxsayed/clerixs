'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function cancelSubscription() {
  try {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };
    const orgId = profile.default_organization_id;

    // Verify user is an owner
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('profile_id', userData.user.id)
      .single();

    if (membership?.role !== 'org_owner') {
      return { error: 'You do not have permission to cancel the subscription. Only Organization Owners can perform this action.' };
    }

    // Attempt to cancel
    const { error: cancelError } = await supabase
      .from('organization_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_at_period_end: true,
      })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    if (cancelError) {
      console.error('Cancel subscription error:', cancelError);
      return { error: 'Failed to cancel subscription' };
    }

    // Update session metadata to reflect new status
    await supabase.auth.updateUser({
      data: { sub_status: 'cancelled' },
    });

    revalidatePath('/settings/subscription');
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

export async function startFreeTrial() {
  try {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };
    const orgId = profile.default_organization_id;

    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from('organization_subscriptions')
      .select('id, status')
      .eq('organization_id', orgId)
      .maybeSingle();

    // If already trialing → return friendly message
    if (existingSub?.status === 'trialing') {
      revalidatePath('/settings/subscription');
      return { success: true, message: 'Your 7-day trial is already active.' };
    }

    // Get Basic Plan
    const { data: basicPlan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_code', 'basic')
      .single();

    if (!basicPlan) return { error: 'Default plan not found. Please contact support.' };

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    const now = new Date().toISOString();

    if (existingSub && (existingSub.status === 'expired' || existingSub.status === 'cancelled')) {
      // Update the existing record to start a new trial
      const { error: updateError } = await supabase
        .from('organization_subscriptions')
        .update({
          plan_id: basicPlan.id,
          status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          current_period_start: now,
          current_period_end: trialEndsAt.toISOString(),
          cancelled_at: null,
          cancel_at_period_end: false,
          updated_at: now,
        })
        .eq('id', existingSub.id);

      if (updateError) {
        console.error('Restart trial error:', updateError);
        return { error: 'Failed to start free trial. Please try again.' };
      }
    } else if (!existingSub) {
      // No existing record → insert fresh
      const { error: insertError } = await supabase
        .from('organization_subscriptions')
        .insert({
          organization_id: orgId,
          plan_id: basicPlan.id,
          status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
          current_period_start: now,
          current_period_end: trialEndsAt.toISOString(),
        });

      if (insertError) {
        console.error('Start trial error:', insertError);
        return { error: 'Failed to start free trial. Please try again.' };
      }
    }

    // Cache subscription status in session metadata to avoid DB hit in middleware
    await supabase.auth.updateUser({
      data: {
        sub_status: 'trialing',
        sub_expires: trialEndsAt.toISOString(),
      },
    });

    revalidatePath('/settings/subscription');
    revalidatePath('/', 'layout'); // Refresh global layout (Sidebar, LockScreen)
    return { success: true };
  } catch (error) {
    console.error('Start trial fatal error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
