'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateClinicStatusAction(formData: FormData) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const orgId = formData.get('orgId') as string;
  const planCode = formData.get('planCode') as string;
  const subscriptionStatus = formData.get('subscriptionStatus') as string;

  if (!orgId || !planCode || !subscriptionStatus) return;

  try {
    // 1. Update the organizations table
    await supabaseAdmin.from('organizations').update({
      plan_code: planCode,
      subscription_status: subscriptionStatus,
    }).eq('id', orgId);

    // 2. Fetch the actual plan_id to update the subscription table
    const { data: planData } = await supabaseAdmin.from('subscription_plans').select('id').eq('plan_code', planCode).single();
    
    if (planData) {
      await supabaseAdmin.from('organization_subscriptions').update({
        status: subscriptionStatus,
        plan_id: planData.id
      }).eq('organization_id', orgId);
    }

    // Refresh the page data
    revalidatePath(`/admin/clinics/${orgId}`);
    revalidatePath(`/admin/clinics`);
    revalidatePath(`/admin/dashboard`);
  } catch (err) {
    console.error('Failed to update clinic override', err);
  }
}
