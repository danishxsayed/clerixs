'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import crypto from 'crypto';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'doctor', 'receptionist', 'laboratory']), // Using 'admin' in UI mapped to 'org_owner' in DB
});

export async function inviteStaff(data: z.infer<typeof inviteSchema>) {
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

    // 2. Validate payload
    const validatedData = inviteSchema.parse(data);
    
    // Map UI role to DB role type
    const dbRole = validatedData.role === 'admin' ? 'org_owner' : validatedData.role;

    // 3. Enforce Staff Limits
    const orgId = profile.default_organization_id;
    const [subRes, membersRes, invitesRes] = await Promise.all([
      supabase
        .from('organization_subscriptions')
        .select('status, subscription_plans!organization_subscriptions_plan_id_fkey(max_staff)')
        .eq('organization_id', orgId)
        .in('status', ['active', 'trialing'])
        .single(),
      supabase
        .from('organization_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('staff_invites')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .is('accepted_at', null)
        .gte('expires_at', new Date().toISOString())
    ]);

    // Calculate max staff allowed (default 2 for basic if fail to fetch)
    const subStatus = subRes.data?.status;
    let maxStaff = (subRes.data?.subscription_plans as any)?.max_staff || 2;
    
    if (subStatus === 'trialing') {
      maxStaff = 1; // Strict 1 staff member limit during free trial phase
    }
    
    const currentStaffCount = (membersRes.count || 0) + (invitesRes.count || 0);

    if (currentStaffCount >= maxStaff) {
      if (subStatus === 'trialing') {
         return { error: 'Staff limit reached. The free trial only allows 1 staff member. Please upgrade your plan to add more staff.' };
      }
      return { error: `Staff limit reached. Your plan allows up to ${maxStaff} staff members (including pending invites). Upgrade to Pro for more.` };
    }

    // 3. Optional: check if they are already in the organization
    // ...

    // 4. Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 5. Insert Invite
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { error: insertError } = await supabase
      .from('staff_invites')
      .upsert({
        organization_id: profile.default_organization_id,
        email: validatedData.email.toLowerCase(),
        role: dbRole,
        invite_token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        created_by: userData.user.id,
        accepted_at: null
      }, { onConflict: 'organization_id,email' });

    if (insertError) {
      // Check for unique constraint violation (should be bypassed by upsert, but kept for safety)
      if (insertError.code === '23505') {
         return { error: 'An invite for this email already exists.' };
      }
      console.error('Invite staff error:', insertError);
      return { error: insertError.message };
    }

    // TODO: In a real app, you would dispatch an email here containing the cleartext `token` link.
    // e.g. sendEmail(email, `https://clerixs.com/invite?token=${token}`)

    revalidatePath('/staff');
    return { success: true, token };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || 'Validation error' };
    }
    return { error: 'An unexpected error occurred' };
  }
}


export async function updateStaffStatus(membershipId: string, newStatus: 'active' | 'disabled') {
  try {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };

    // Update status (RLS will automatically block this if role != org_owner)
    const { error: updateError } = await supabase
      .from('organization_memberships')
      .update({
        status: newStatus,
      })
      .eq('id', membershipId);

    if (updateError) {
      console.error('Update status error:', updateError);
      return { error: updateError.message };
    }

    revalidatePath('/staff');
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

export async function removeStaff(membershipId: string) {
    try {
      const supabase = await createClient();
  
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { error: 'Not authenticated' };
  
      // Delete membership and user using our secure RPC
      const { error: deleteError } = await supabase.rpc('hard_remove_staff', {
        p_membership_id: membershipId
      });
  
      if (deleteError) {
        console.error('Remove staff error:', deleteError);
        return { error: 'Failed to fully remove staff: ' + deleteError.message };
      }
  
      revalidatePath('/staff');
      return { success: true };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
}

export async function deleteInvite(inviteId: string) {
    try {
      const supabase = await createClient();
  
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { error: 'Not authenticated' };
  
      // Delete invite
      const { error: deleteError } = await supabase
        .from('staff_invites')
        .delete()
        .eq('id', inviteId);
  
      if (deleteError) {
        console.error('Delete invite error:', deleteError);
        return { error: deleteError.message };
      }
  
      revalidatePath('/staff');
      return { success: true };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
}
