'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const step1Schema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  avatar_url: z.string().optional(),
  currency: z.string().min(1, 'Currency is required.'),
  timezone: z.string().min(1, 'Timezone is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
});

const step2Schema = z.object({
  letterhead_url: z.string().optional(),
  signature_url: z.string().optional(),
});

async function getOrganizationId() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) throw new Error('Organization not found');
  return { supabase, orgId: profile.default_organization_id, userId: userData.user.id };
}

export async function saveOnboardingStep1(data: z.infer<typeof step1Schema>) {
  try {
    const validatedData = step1Schema.parse(data);
    const { supabase, orgId, userId } = await getOrganizationId();

    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        name: validatedData.name,
        currency: validatedData.currency,
        timezone: validatedData.timezone,
        phone: validatedData.phone,
        address: validatedData.address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (orgError) return { error: orgError.message };

    if (validatedData.avatar_url !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: validatedData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (profileError) return { error: profileError.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message };
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}

export async function saveOnboardingStep2(data: z.infer<typeof step2Schema>) {
  try {
    const validatedData = step2Schema.parse(data);
    const { supabase, orgId } = await getOrganizationId();

    const { error } = await supabase
      .from('organizations')
      .update({
        letterhead_url: validatedData.letterhead_url || null,
        signature_url: validatedData.signature_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message };
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}

export async function completeOnboarding() {
  try {
    const { supabase, orgId } = await getOrganizationId();
    
    // Check for a selected plan from the landing page cookie
    const cookieStore = await cookies();
    const selectedPlanId = cookieStore.get('selected_plan_id')?.value;
    
    // Choose the plan (default to basic if not selected or found)
    const planCode = selectedPlanId === '93caba67-1f28-4abf-8032-f735941b467b' ? 'pro' : 'basic';

    // Auto-create a 7-day trial subscription for the chosen plan
    const { data: targetPlan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_code', planCode)
      .single();

    if (targetPlan) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      const trialEndsAtIso = trialEndsAt.toISOString();

      const { error: subError } = await supabase
        .from('organization_subscriptions')
        .insert({
          organization_id: orgId,
          plan_id: targetPlan.id,
          status: 'trialing',
          trial_ends_at: trialEndsAtIso,
          current_period_start: new Date().toISOString(),
          current_period_end: trialEndsAtIso,
        });
        
      if (subError) {
        console.error('Failed to create trial subscription:', subError);
      } else {
        // Sync metadata to avoid redirect loop in middleware
        await supabase.auth.updateUser({
          data: {
            sub_status: 'trialing',
            sub_expires: trialEndsAtIso
          }
        });
      }
    }


    const { error } = await supabase
      .from('organizations')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}
