import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // CRITICAL: Protect this route from unauthorized access if not running in a trusted environment
  // You might want to check for a CRON_SECRET header here.
  
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    
    // Target: 3 days from now
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 3);
    
    // Create a window (e.g., the entire day 3 days from now)
    const startOfTarget = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfTarget = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString();

    console.log(`Checking for expirations between ${startOfTarget} and ${endOfTarget}`);

    // Query both trials and active subs ending in the 3-day window
    const { data: expiringSubs, error: fetchError } = await supabase
      .from('organization_subscriptions')
      .select('*, organization_id, subscription_plans!organization_subscriptions_plan_id_fkey(name)')
      .or(`current_period_end.gte.${startOfTarget},trial_ends_at.gte.${startOfTarget}`)
      .or(`current_period_end.lte.${endOfTarget},trial_ends_at.lte.${endOfTarget}`)
      .eq('status', 'active'); // Or trialing
      
    // Refined query if the .or syntax above is tricky in some supabase versions:
    // Actually, simple way: fetch all active/trialing and filter in JS if the count is small
    const { data: allActiveSubs } = await supabase
      .from('organization_subscriptions')
      .select('*, organization_id, subscription_plans!organization_subscriptions_plan_id_fkey(name)')
      .in('status', ['active', 'trialing']);

    const targetExpiring = allActiveSubs?.filter(sub => {
      const expiry = sub.status === 'trialing' ? sub.trial_ends_at : sub.current_period_end;
      if (!expiry) return false;
      const date = new Date(expiry);
      return date >= new Date(startOfTarget) && date <= new Date(endOfTarget);
    }) || [];

    const results = [];

    for (const sub of targetExpiring) {
      try {
        // 1. Find the owner
        const { data: owner } = await supabase
          .from('organization_memberships')
          .select('profile_id, profiles(full_name)')
          .eq('organization_id', sub.organization_id)
          .eq('role', 'org_owner')
          .maybeSingle();

        if (!owner) continue;

        // 2. Get the owner's email via Auth Admin
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(owner.profile_id);
        if (authError || !authUser.user?.email) continue;

        const ownerEmail = authUser.user.email;
        const ownerName = (owner.profiles as any)?.full_name || 'Clinic Owner';
        // 3. Send Email via Resend
        const isTrial = sub.status === 'trialing';
        const renewalDate = new Date(isTrial ? sub.trial_ends_at : sub.current_period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const autoRenew = sub.auto_renewal_enabled !== false;
        
        let subject, content;
        if (isTrial) {
          subject = 'Trial Reminder: 3 Days Left';
          content = `<p>Your <strong>free trial</strong> will expire in <strong>3 days</strong>. Upgrade now to keep access to your clinic tools.</p>
                     <div style="margin: 30px 0;">
                       <a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings/subscription" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Upgrade Now</a>
                     </div>`;
        } else if (autoRenew) {
          subject = `Your Clerixs subscription will automatically renew on ${renewalDate}`;
          content = `<p>Your Clerixs subscription will automatically renew on <strong>${renewalDate}</strong> for <strong>₹${sub.price_paid || '999'}</strong>. No action needed.</p>`;
        } else {
          subject = `Your subscription expires in 3 days — Action Required`;
          content = `<p>Your subscription expires in 3 days and <strong>auto-renewal is off</strong>. Renew here to avoid losing access on ${renewalDate}.</p>
                     <div style="margin: 30px 0;">
                       <a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings/subscription" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
                     </div>`;
        }

        await resend.emails.send({
          from: 'Clerixs <billing@clerixs.com>',
          to: ownerEmail,
          subject: subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">Subscription Update</h2>
              <p>Hello ${ownerName},</p>
              ${content}
              <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
              <p style="font-size: 10px; color: #999;">Clerixs Healthcare Platform &copy; 2026</p>
            </div>
          `
        });

        results.push({ orgId: sub.organization_id, email: ownerEmail, status: 'sent' });
      } catch (err) {
        console.error(`Failed to send reminder for org ${sub.organization_id}:`, err);
        results.push({ orgId: sub.organization_id, status: 'failed', error: String(err) });
      }
    }

    return NextResponse.json({ processed: results.length, details: results });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
