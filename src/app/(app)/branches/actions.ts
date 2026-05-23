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

export async function createBranchLoginAction(branchId: string, email: string, password: string) {
  try {
    const supabase = await createClient();

    // 1. Verify User Authentication & active organization
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };

    // Check if the organization is Enterprise
    const { data: org } = await supabase
      .from('organizations')
      .select('is_enterprise')
      .eq('id', profile.default_organization_id)
      .single();

    if (!org?.is_enterprise) {
      return { error: 'Enterprise Branch Access requires an Enterprise subscription.' };
    }

    // 2. Check for org_owner membership
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', profile.default_organization_id)
      .eq('profile_id', userData.user.id)
      .single();

    if (membership?.role !== 'org_owner') {
      return { error: 'Only clinic owners can manage branch logins.' };
    }

    // 3. Verify Branch details
    const { data: branch } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .eq('organization_id', profile.default_organization_id)
      .single();

    if (!branch) return { error: 'Branch not found or unauthorized' };
    if (branch.has_login) return { error: 'Branch login already exists for this branch' };

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    // 4. Create client with Admin Key to provision credentials bypassing email confirm
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseServiceKey) {
      return { error: 'Supabase admin credentials are not configured.' };
    }
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create the user in Auth
    // is_staff_invite: 'true' is required to prevent the postgres trigger handle_new_user_provisioning from auto-creating a separate organization!
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'branch_manager',
        branch_id: branchId,
        is_staff_invite: 'true',
        full_name: `${branch.name} Manager`
      }
    });

    if (createError || !authUser.user) {
      console.error('Admin createUser error:', createError);
      return { error: createError?.message || 'Failed to create branch login.' };
    }

    const userId = authUser.user.id;

    try {
      // 5. Update Profile default org & full name (the profile is automatically inserted by the Postgres trigger handle_new_user_provisioning)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          default_organization_id: profile.default_organization_id,
          full_name: `${branch.name} Manager`
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 6. Create organization membership with role 'branch_manager'
      const { data: orgMem, error: orgMemError } = await supabaseAdmin
        .from('organization_memberships')
        .insert({
          organization_id: profile.default_organization_id,
          profile_id: userId,
          role: 'branch_manager',
          status: 'active'
        })
        .select('id')
        .single();

      if (orgMemError || !orgMem) throw orgMemError || new Error('Failed to create organization membership');

      // 7. Create branch membership
      const { error: branchMemError } = await supabaseAdmin
        .from('branch_memberships')
        .insert({
          organization_membership_id: orgMem.id,
          branch_id: branchId,
          is_primary: true
        });

      if (branchMemError) throw branchMemError;

      // 8. Update branch fields
      const { error: branchUpdateError } = await supabaseAdmin
        .from('branches')
        .update({
          has_login: true,
          login_email: email,
          login_status: 'active'
        })
        .eq('id', branchId);

      if (branchUpdateError) throw branchUpdateError;

      revalidatePath('/branches');
      return { success: true };
    } catch (dbError: any) {
      console.error('Database setup failed after auth user creation, rolling back user:', dbError);
      // Rollback Auth User
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: dbError?.message || 'Failed to complete branch login database records.' };
    }
  } catch (error) {
    console.error('Create branch login error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function resetBranchPasswordAction(branchId: string, newPassword: string) {
  try {
    const supabase = await createClient();

    // 1. Verify User Authentication & active organization
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };

    // Check for org_owner membership
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', profile.default_organization_id)
      .eq('profile_id', userData.user.id)
      .single();

    if (membership?.role !== 'org_owner') {
      return { error: 'Only clinic owners can reset branch passwords.' };
    }

    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long.' };
    }

    // 2. Get the branch manager profile_id (the auth user id)
    const { data: branchMem } = await supabase
      .from('branch_memberships')
      .select(`
        organization_membership: organization_memberships (
          profile_id,
          role,
          organization_id
        )
      `)
      .eq('branch_id', branchId)
      .single();

    const branchManagerUserId = (branchMem?.organization_membership as any)?.profile_id;
    const branchManagerRole = (branchMem?.organization_membership as any)?.role;
    const branchManagerOrgId = (branchMem?.organization_membership as any)?.organization_id;

    if (branchManagerOrgId !== profile.default_organization_id) {
      return { error: 'Unauthorized clinic access' };
    }

    if (!branchManagerUserId || branchManagerRole !== 'branch_manager') {
      return { error: 'No branch manager login found for this branch.' };
    }

    // 3. Update password using Admin Client
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseServiceKey) {
      return { error: 'Supabase admin credentials are not configured.' };
    }
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      branchManagerUserId,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Admin password reset error:', updateError);
      return { error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Reset branch password error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function toggleBranchLoginStatusAction(branchId: string, action: 'disable' | 'enable') {
  try {
    const supabase = await createClient();

    // 1. Verify User Authentication & active organization
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };

    // Check for org_owner membership
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', profile.default_organization_id)
      .eq('profile_id', userData.user.id)
      .single();

    if (membership?.role !== 'org_owner') {
      return { error: 'Only clinic owners can toggle login status.' };
    }

    // 2. Get the branch manager profile_id
    const { data: branchMem } = await supabase
      .from('branch_memberships')
      .select(`
        organization_membership: organization_memberships (
          id,
          profile_id,
          role,
          organization_id
        )
      `)
      .eq('branch_id', branchId)
      .single();

    const orgMemId = (branchMem?.organization_membership as any)?.id;
    const branchManagerUserId = (branchMem?.organization_membership as any)?.profile_id;
    const branchManagerRole = (branchMem?.organization_membership as any)?.role;
    const branchManagerOrgId = (branchMem?.organization_membership as any)?.organization_id;

    if (branchManagerOrgId !== profile.default_organization_id) {
      return { error: 'Unauthorized clinic access' };
    }

    if (!branchManagerUserId || branchManagerRole !== 'branch_manager' || !orgMemId) {
      return { error: 'No branch manager login found for this branch.' };
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseServiceKey) {
      return { error: 'Supabase admin credentials are not configured.' };
    }
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const statusValue = action === 'enable' ? 'active' : 'disabled';
    const banDuration = action === 'disable' ? '87600h' : 'none'; // ban for 10 years or unban

    // Update in Database (organization_memberships)
    const { error: dbMemError } = await supabaseAdmin
      .from('organization_memberships')
      .update({ status: statusValue })
      .eq('id', orgMemId);

    if (dbMemError) {
      console.error('Failed to update membership status:', dbMemError);
      return { error: dbMemError.message };
    }

    // Update in Auth
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      branchManagerUserId,
      { ban_duration: banDuration }
    );

    if (authUpdateError) {
      console.error('Admin status update error:', authUpdateError);
      // Rollback DB update just in case
      await supabaseAdmin
        .from('organization_memberships')
        .update({ status: action === 'disable' ? 'active' : 'disabled' })
        .eq('id', orgMemId);
      return { error: authUpdateError.message };
    }

    // Update Branch Record
    const { error: branchUpdateError } = await supabaseAdmin
      .from('branches')
      .update({ login_status: statusValue })
      .eq('id', branchId);

    if (branchUpdateError) {
      console.error('Failed to update branch login status field:', branchUpdateError);
    }

    revalidatePath('/branches');
    return { success: true };
  } catch (error) {
    console.error('Toggle branch login status error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
