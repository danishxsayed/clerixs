'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type BranchFormValues = z.infer<typeof branchSchema>;

export async function createBranch(data: BranchFormValues) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication & Organization
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };

    // 2. Validate form payload
    const validatedData = branchSchema.parse(data);

    // 3. Check for org_owner membership (Required by RLS)
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', profile.default_organization_id)
      .eq('profile_id', userData.user.id)
      .single();

    if (membership?.role !== 'org_owner') {
      return { error: 'You must be an organization owner to create branches.' };
    }

    // 4. Insert Branch
    const { error: insertError } = await supabase
      .from('branches')
      .insert({
        organization_id: profile.default_organization_id,
        name: validatedData.name,
        code: validatedData.code || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address_line1: validatedData.address_line1 || null,
        address_line2: validatedData.address_line2 || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        pincode: validatedData.pincode || null,
        gstin: validatedData.gstin || null,
        is_active: validatedData.is_active,
      });

    if (insertError) {
      console.error('Add branch error:', insertError);
      return { error: insertError.message };
    }

    revalidatePath('/branches');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateBranch(id: string, data: BranchFormValues) {
  try {
    const supabase = await createClient();

    // 1. Verify Auth & Validations
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };

    const validatedData = branchSchema.parse(data);

    // 2. Organization check
    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'Organization not found' };

    // 3. Update Branch (RLS will automatically block this if role != org_owner)
    const { error: updateError } = await supabase
      .from('branches')
      .update({
        name: validatedData.name,
        code: validatedData.code || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address_line1: validatedData.address_line1 || null,
        address_line2: validatedData.address_line2 || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        pincode: validatedData.pincode || null,
        gstin: validatedData.gstin || null,
        is_active: validatedData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', profile.default_organization_id);

    if (updateError) {
      console.error('Update branch error:', updateError);
      return { error: updateError.message };
    }

    revalidatePath('/branches');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteBranch(id: string) {
    try {
      const supabase = await createClient();
  
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { error: 'Not authenticated' };
  
      const { data: profile } = await supabase
        .from('profiles')
        .select('default_organization_id')
        .eq('id', userData.user.id)
        .single();
  
      if (!profile?.default_organization_id) return { error: 'Organization not found' };
  
      // RLS will ensure only owners can delete
      const { error: deleteError } = await supabase
        .from('branches')
        .delete()
        .eq('id', id)
        .eq('organization_id', profile.default_organization_id);
  
      if (deleteError) {
        console.error('Delete branch error:', deleteError);
        return { error: deleteError.message };
      }
  
      revalidatePath('/branches');
      return { success: true };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
}
