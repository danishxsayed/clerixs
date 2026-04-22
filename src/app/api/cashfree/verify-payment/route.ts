import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'Missing order_id' }, { status: 400 });
  }

  // Determine Cashfree base URL from env
  const cashfreeEnv = process.env.CASHFREE_ENV || 'sandbox';
  const cashfreeBase =
    cashfreeEnv === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
  }

  try {
    // Fetch order from Cashfree
    const cashfreeRes = await fetch(`${cashfreeBase}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
    });

    if (!cashfreeRes.ok) {
      const errText = await cashfreeRes.text();
      console.error('Cashfree API error:', errText);
      return NextResponse.json({ success: false, error: 'Failed to fetch order from Cashfree' }, { status: 502 });
    }

    const order = await cashfreeRes.json();

    if (order.order_status !== 'PAID') {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        status: order.order_status,
      }, { status: 402 });
    }

    // Extract info from order_tags
    const tags = order.order_tags || {};
    const planId = tags.plan_id;
    const whatsappPackId = tags.whatsapp_credit_pack_id;
    const organizationId = tags.organization_id;

    if (!organizationId) {
      return NextResponse.json({ success: false, error: 'Missing organization_id in order tags' }, { status: 400 });
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // ── CASE 1: SUBSCRIPTION PLAN ───────────────────────────────────────────
    if (planId) {
      const interval = tags.interval || 'monthly';
      
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id, name, plan_code, monthly_price, yearly_price')
        .eq('id', planId)
        .single();

      if (!plan) return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });

      const now = new Date();
      const periodEnd = new Date(now);
      if (interval === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setDate(periodEnd.getDate() + 30);
      }

      const amountPaid = order.order_amount;

      // Upsert subscription
      const { error: upsertError } = await adminSupabase
        .from('organization_subscriptions')
        .upsert({
            organization_id: organizationId,
            plan_id: planId,
            status: 'active',
            billing_cycle: interval,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            cancelled_at: null,
            trial_ends_at: null,
            price_paid: amountPaid,
            updated_at: now.toISOString(),
        }, { onConflict: 'organization_id' });

      if (upsertError) throw upsertError;

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { sub_status: 'active', sub_expires: periodEnd.toISOString() },
      });

      revalidatePath('/', 'layout');
      revalidatePath('/settings/subscription');

      // Send email logic...
      await sendSubscriptionEmail(adminSupabase, organizationId, plan, amountPaid, interval, periodEnd);

      return NextResponse.json({
        success: true,
        type: 'subscription',
        plan: {
          name: plan.name,
          current_period_end: periodEnd.toISOString(),
        },
      });
    } 
    
    // ── CASE 2: WHATSAPP CREDIT PACK ────────────────────────────────────────
    else if (whatsappPackId) {
      const credits = Number(tags.credits);
      const amountPaid = order.order_amount;

      // 1. Provision credits atomically
      const { error: rpcError } = await adminSupabase.rpc('provision_whatsapp_credits', {
        target_org_id: organizationId,
        credits_to_add: credits
      });

      if (rpcError) throw rpcError;

      // 2. Record purchase history
      await adminSupabase.from('whatsapp_credit_purchases').insert({
        organization_id: organizationId,
        pack_id: whatsappPackId,
        amount_paid: amountPaid,
        credits_added: credits,
        payment_status: 'paid',
        cashfree_order_id: orderId
      });

      revalidatePath('/whatsapp');

      // 3. Send WhatsApp pack confirmation email
      await sendWhatsAppPackEmail(adminSupabase, organizationId, credits, amountPaid);

      return NextResponse.json({
        success: true,
        type: 'whatsapp_pack',
        credits_added: credits,
        total_paid: amountPaid
      });
    }

    return NextResponse.json({ success: false, error: 'No valid purchase type found in tags' }, { status: 400 });

  } catch (error) {
    console.error('verify-payment fatal error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ── Helper Functions ────────────────────────────────────────────────────────

async function sendSubscriptionEmail(adminSupabase: any, organizationId: string, plan: any, amountPaid: number, interval: string, periodEnd: Date) {
    const { data: orgMember } = await adminSupabase
      .from('organization_memberships')
      .select('profile_id, profiles(full_name)')
      .eq('organization_id', organizationId)
      .eq('role', 'org_owner')
      .maybeSingle();

    if (orgMember) {
      const { data: userRecord } = await adminSupabase.auth.admin.getUserById(orgMember.profile_id);
      const ownerEmail = userRecord?.user?.email;
      if (!ownerEmail) return;

      const ownerName = (orgMember.profiles as any)?.full_name || 'Clinic Owner';
      const renewalDateStr = periodEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

      await resend.emails.send({
        from: 'Clerixs <noreply@clerixs.com>',
        to: [ownerEmail],
        subject: 'Payment Confirmed — Your Clerixs Subscription is Active',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">CLERIXS</h1>
              </div>
              
              <h2 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 20px; font-weight: 700;">Subscription Active ✓</h2>
              <p style="margin-bottom: 24px; line-height: 1.6; color: #475569;">Hi ${ownerName}, your payment was successful and your <strong>${plan.name}</strong> plan is now active. You have full access to all features in your clinic.</p>
              
              <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 8px; color: #64748b; font-size: 14px; font-weight: 600;">PLAN</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #0f172a; font-weight: 700;">${plan.name}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; color: #64748b; font-size: 14px; font-weight: 600;">AMOUNT PAID</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #0f172a; font-weight: 700;">₹${amountPaid}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; color: #64748b; font-size: 14px; font-weight: 600;">BILLING CYCLE</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #0f172a; font-weight: 700; text-transform: capitalize;">${interval}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-size: 14px; font-weight: 600;">NEXT RENEWAL</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700;">${renewalDateStr}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">Thank you for choosing Clerixs. If you have any questions, simply reply to this email.</p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Clerixs — The Smart Clinic Management Platform.</p>
            </div>
          </div>
        `
      });
    }
}

async function sendWhatsAppPackEmail(adminSupabase: any, organizationId: string, credits: number, amountPaid: number) {
    const { data: orgMember } = await adminSupabase
      .from('organization_memberships')
      .select('profile_id, profiles(full_name)')
      .eq('organization_id', organizationId)
      .eq('role', 'org_owner')
      .maybeSingle();

    if (orgMember) {
      const { data: userRecord } = await adminSupabase.auth.admin.getUserById(orgMember.profile_id);
      const ownerEmail = userRecord?.user?.email;
      if (!ownerEmail) return;

      const ownerName = (orgMember.profiles as any)?.full_name || 'Clinic Owner';

      await resend.emails.send({
        from: 'Clerixs <noreply@clerixs.com>',
        to: [ownerEmail],
        subject: 'WhatsApp Credits Added ✓',
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">CLERIXS</h1>
              </div>
              
              <h2 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 20px; font-weight: 700;">Credits Added ✓</h2>
              <p style="margin-bottom: 24px; line-height: 1.6; color: #475569;">Hi ${ownerName}, your purchase was successful and <strong>${credits} credits</strong> have been added to your WhatsApp balance.</p>
              
              <div style="background-color: #f1f5f9; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding-bottom: 8px; color: #64748b; font-size: 14px; font-weight: 600;">CREDITS ADDED</td>
                    <td style="padding-bottom: 8px; text-align: right; color: #0f172a; font-weight: 700;">${credits}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-size: 14px; font-weight: 600;">AMOUNT PAID</td>
                    <td style="text-align: right; color: #0f172a; font-weight: 700;">₹${amountPaid}</td>
                  </tr>
                </table>
              </div>
              
              <div style="border-radius: 8px; border-left: 4px solid #2563eb; background-color: #eff6ff; padding: 16px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 13px; color: #1d4ed8; line-height: 1.5;"><strong>Pro Tip:</strong> You can now share prescriptions and appointments with your patients directly on WhatsApp from the dashboard.</p>
              </div>
              
              <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">Thank you for using Clerixs. If you have any questions, simply reply to this email.</p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Clerixs — The Smart Clinic Management Platform.</p>
            </div>
          </div>
        `
      });
    }
}
