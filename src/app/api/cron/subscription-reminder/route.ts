import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  // Basic security: check for cron secret header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Step 1: Get all trialing subscriptions expiring within 3 days
    const { data: expiringSubs, error } = await supabase
      .from('organization_subscriptions')
      .select('id, organization_id, trial_ends_at')
      .eq('status', 'trialing')
      .gte('trial_ends_at', now.toISOString())
      .lte('trial_ends_at', threeDaysFromNow.toISOString());

    if (error) {
      console.error('Cron query error:', error);
      return NextResponse.json({ success: false, error: 'Failed to query subscriptions' }, { status: 500 });
    }

    if (!expiringSubs || expiringSubs.length === 0) {
      return NextResponse.json({ success: true, message: 'No trials expiring soon', count: 0 });
    }

    let emailsSent = 0;
    const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://clerixs.com';

    for (const sub of expiringSubs) {
      // Step 2: Find org owner membership
      const { data: ownerMembership } = await supabase
        .from('organization_memberships')
        .select('profile_id')
        .eq('organization_id', sub.organization_id)
        .eq('role', 'org_owner')
        .single();

      if (!ownerMembership) continue;

      // Step 3: Get org name
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', sub.organization_id)
        .single();

      // Step 4: Get owner email from auth
      const { data: userRecord } = await supabase.auth.admin.getUserById(ownerMembership.profile_id);
      const ownerEmail = userRecord?.user?.email;
      if (!ownerEmail) continue;

      const trialEnd = new Date(sub.trial_ends_at!);
      const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)));
      const orgName = org?.name || 'your clinic';

      const { error: emailError } = await resend.emails.send({
        from: 'Clerixs <noreply@clerixs.com>',
        to: [ownerEmail],
        subject: 'Your Clerixs trial ends in 3 days',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Your Trial is Ending Soon</h1>
            </div>
            <p>Hi there,</p>
            <p>Your 7-day free trial for <strong>${orgName}</strong> on Clerixs ends in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.</p>
            <p>Subscribe now to keep access to all your clinic data — patients, appointments, billing, and more. Don't let your records get locked.</p>
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; font-weight: 700; font-size: 16px; margin-bottom: 12px;">Choose a plan:</p>
              <p style="margin: 4px 0;">🏥 <strong>Basic Plan</strong> — ₹999/month</p>
              <p style="margin: 4px 0;">🚀 <strong>Pro Plan</strong> — ₹1,999/month</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${appDomain}/pricing" style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">Subscribe Now</a>
            </div>
            <p style="color: #64748b; font-size: 13px;">If you have any questions, reply to this email or visit our support page.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">Clerixs — Smart Clinic Management</p>
          </div>
        `,
      });

      if (!emailError) {
        emailsSent++;
      } else {
        console.error('Failed to send reminder to', ownerEmail, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent} reminder email(s)`,
      count: emailsSent,
    });
  } catch (error) {
    console.error('Cron subscription-reminder fatal error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
