'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().refine((val) => val.trim().length > 0, {
    message: 'Name cannot be empty',
  }),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
});

const organizationSchema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string(),
  currency: z.string(),
  signature_url: z.string().optional(),
  letterhead_url: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type OrganizationFormValues = z.infer<typeof organizationSchema>;

export async function updateProfile(data: ProfileFormValues) {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) return { error: 'Not authenticated' };

    const validatedData = profileSchema.parse(data);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: validatedData.full_name,
        phone: validatedData.phone || null,
        avatar_url: validatedData.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.user.id);

    if (updateError) {
      console.error('Update profile error:', updateError);
      return { error: updateError.message };
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateOrganization(data: OrganizationFormValues) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };

    const validatedData = organizationSchema.parse(data);

    // 1. Get user's org
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'Organization not found' };

    // 2. RLS `update` policy ensures they are the `org_owner`.
    // We execute the update directly.
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        name: validatedData.name,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        timezone: validatedData.timezone,
        currency: validatedData.currency,
        signature_url: validatedData.signature_url || null,
        letterhead_url: validatedData.letterhead_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.default_organization_id);

    if (updateError) {
      console.error('Update org error:', updateError);
      // Fallback friendly message if RLS blocked it instead of raw Postgres error
      if (updateError.code === '42501') { 
        return { error: 'You must be an Organization Owner to update these settings.' };
      }
      return { error: updateError.message };
    }

    revalidatePath('/settings');
    // Revalidate Root layout essentially to refresh the sidebar Clinic Name if it changed.
    revalidatePath('/', 'layout'); 
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateUserPassword({ password }: { password: string }) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) return { error: 'Not authenticated' };

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Password update error:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating the password' };
  }
}
