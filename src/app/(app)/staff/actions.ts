'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'doctor', 'receptionist', 'laboratory']), // Using 'admin' in UI mapped to 'org_owner' in DB
  branch_id: z.string().min(1, 'Branch selection is required'),
});

export async function inviteStaff(data: z.infer<typeof inviteSchema>) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication & Organization
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id, full_name')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };

    // Fetch clinic organization name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.default_organization_id)
      .single();

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
        branch_ids: [validatedData.branch_id],
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

    // 6. Send Invitation Email using Resend
    const inviterName = profile?.full_name || 'A clinic administrator';
    const clinicName = org?.name || 'their clinic';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteUrl = `${siteUrl}/invite?token=${token}`;

    const { error: emailError } = await resend.emails.send({
      from: 'Clerixs <noreply@clerixs.com>',
      to: [validatedData.email.toLowerCase()],
      subject: `Invitation to join ${clinicName} on Clerixs`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <div style="margin-bottom: 32px; text-align: center;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">CLERIXS</h1>
            </div>
            
            <h2 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 20px; font-weight: 700; text-align: center;">Join the Clinic Workspace</h2>
            <p style="margin-bottom: 24px; line-height: 1.6; color: #475569; text-align: center;">
              <strong>${inviterName}</strong> has invited you to join the clinic <strong>${clinicName}</strong> on Clerixs as a <strong>${validatedData.role}</strong>.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                Accept Invitation
              </a>
            </div>
            
            <p style="margin-bottom: 24px; line-height: 1.6; color: #475569; font-size: 13px; text-align: center;">
              If the button above does not work, copy and paste this URL into your browser:<br />
              <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="margin-bottom: 0; font-size: 13px; color: #94a3b8; text-align: center;">
              This invitation was sent by Clerixs on behalf of ${clinicName}. If you were not expecting this invite, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Clerixs — The Smart Clinic Management Platform.</p>
          </div>
        </div>
      `
    });

    if (emailError) {
      console.error('[Invite Staff] Resend email delivery failed:', emailError);
      revalidatePath('/staff');
      // Return success with emailError indicator so UI can adapt
      return { success: true, token, emailError: emailError.message };
    }

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
