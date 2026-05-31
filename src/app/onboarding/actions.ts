'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const step1Schema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  avatar_url: z.string().optional(),
  currency: z.string().min(1, 'Currency is required.'),
  timezone: z.string().min(1, 'Timezone is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
  fullName: z.string().min(2, "Doctor's full name is required."),
  specialty: z.string().min(1, 'Specialty is required.'),
  otherSpecialty: z.string().optional(),
});

const priceCatalogItemSchema = z.object({
  name: z.string().min(1, 'Service name is required.'),
  category: z.string().min(1, 'Category is required.'),
  price: z.number().min(0, 'Price must be greater than or equal to 0.'),
});

const step2Schema = z.object({
  items: z.array(priceCatalogItemSchema),
});

const labTestItemSchema = z.object({
  name: z.string().min(1, 'Test name is required.'),
  category: z.string().min(1, 'Category is required.'),
  sample_type: z.string().min(1, 'Sample type is required.'),
  price: z.number().optional().default(0),
});

const step3Schema = z.object({
  items: z.array(labTestItemSchema),
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

    const primarySpecialty = validatedData.specialty === 'Other' 
      ? validatedData.otherSpecialty 
      : validatedData.specialty;

    if (validatedData.specialty === 'Other' && !validatedData.otherSpecialty) {
      return { error: 'Please specify your other specialty.' };
    }

    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        name: validatedData.name,
        currency: validatedData.currency,
        timezone: validatedData.timezone,
        phone: validatedData.phone,
        address: validatedData.address,
        primary_specialty: primarySpecialty,
        onboarding_step: 2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (orgError) return { error: orgError.message };

    const profileUpdate: any = {
      full_name: validatedData.fullName,
      specialty: primarySpecialty,
      updated_at: new Date().toISOString(),
    };

    if (validatedData.avatar_url !== undefined) {
      profileUpdate.avatar_url = validatedData.avatar_url || null;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);
    
    if (profileError) return { error: profileError.message };

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message };
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}

export async function saveOnboardingStep2(data: { items: any[] }) {
  try {
    const validatedData = step2Schema.parse(data);
    const { supabase, orgId } = await getOrganizationId();

    // 1. Delete existing price catalog items for this organization
    await supabase
      .from('price_catalog')
      .delete()
      .eq('organization_id', orgId);

    // 2. Insert new items if any
    if (validatedData.items.length > 0) {
      const insertRows = validatedData.items.map(item => ({
        organization_id: orgId,
        name: item.name,
        category: item.category,
        price: item.price,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('price_catalog')
        .insert(insertRows);

      if (insertError) return { error: insertError.message };
    }

    // 3. Update onboarding step
    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (orgError) return { error: orgError.message };

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message };
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}

export async function skipOnboardingStep2() {
  try {
    const { supabase, orgId } = await getOrganizationId();

    const { error } = await supabase
      .from('organizations')
      .update({
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}

export async function saveOnboardingStep3(data: { items: any[] }) {
  try {
    const validatedData = step3Schema.parse(data);
    const { supabase, orgId } = await getOrganizationId();

    if (validatedData.items.length > 0) {
      // 1. Fetch unique categories from items
      const uniqueCategoryNames = Array.from(new Set(validatedData.items.map(item => item.category.trim())));

      // 2. Fetch existing categories for this organization
      const { data: existingCategories } = await supabase
        .from('lab_test_categories')
        .select('id, name')
        .eq('organization_id', orgId);

      const categoryMap: Record<string, string> = {};
      if (existingCategories) {
        existingCategories.forEach(cat => {
          categoryMap[cat.name.toLowerCase()] = cat.id;
        });
      }

      // 3. Create missing categories
      for (const catName of uniqueCategoryNames) {
        const key = catName.toLowerCase();
        if (!categoryMap[key]) {
          const { data: newCat, error: catError } = await supabase
            .from('lab_test_categories')
            .insert({
              organization_id: orgId,
              name: catName,
            })
            .select('id')
            .single();

          if (catError) return { error: catError.message };
          categoryMap[key] = newCat.id;
        }
      }

      // 4. Delete existing lab tests for this organization
      await supabase
        .from('lab_tests')
        .delete()
        .eq('organization_id', orgId);

      // 5. Insert lab tests
      const insertRows = validatedData.items.map(item => ({
        organization_id: orgId,
        category_id: categoryMap[item.category.trim().toLowerCase()],
        name: item.name,
        price: item.price || 0,
        description: `Sample Type: ${item.sample_type}`,
        is_active: true,
      }));

      const { error: insertError } = await supabase
        .from('lab_tests')
        .insert(insertRows);

      if (insertError) return { error: insertError.message };
    }

    // 6. Update onboarding step to 4 (Celebration page)
    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        onboarding_step: 4,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (orgError) return { error: orgError.message };

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message };
    return { error: (error as Error).message || 'An unexpected error occurred' };
  }
}

export async function skipOnboardingStep3() {
  try {
    const { supabase, orgId } = await getOrganizationId();

    const { error } = await supabase
      .from('organizations')
      .update({
        onboarding_step: 4,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
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
