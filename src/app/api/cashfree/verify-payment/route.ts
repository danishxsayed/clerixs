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
     console.log('[Verify Payment] Step 1: Received request for orderId:', orderId);
     
     // Determine Cashfree base URL from env
     const cashfreeEnv = process.env.CASHFREE_ENV || 'sandbox';
     const cashfreeBase =
       cashfreeEnv === 'production'
         ? 'https://api.cashfree.com/pg'
         : 'https://sandbox.cashfree.com/pg';
 
     const appId = process.env.CASHFREE_APP_ID;
     const secretKey = process.env.CASHFREE_SECRET_KEY;
 
     if (!appId || !secretKey) {
       console.error('[Verify Payment] ERROR: gateway credentials missing');
       return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
     }
 
     // Fetch order from Cashfree
     console.log('[Verify Payment] Step 2: Fetching order status from Cashfree API...');
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
       console.error('[Verify Payment] Cashfree API error:', errText);
       return NextResponse.json({ success: false, error: 'Failed to fetch order from Cashfree' }, { status: 502 });
     }
 
     const order = await cashfreeRes.json();
     console.log('[Verify Payment] Step 3: Raw order response:', JSON.stringify(order, null, 2));
 
     if (order.order_status !== 'PAID') {
       console.warn('[Verify Payment] Order status is not PAID:', order.order_status);
       return NextResponse.json({
         success: false,
         error: 'Payment not completed',
         status: order.order_status,
       }, { status: 402 });
     }
 
     // Step 3: Lookup metadata from pending_orders (Fallback for missing tags)
     const adminSupabase = createAdminClient();
     const supabase = await createClient();
 
     console.log('[Verify Payment] Step 4: Looking up pending_orders details...');
     const { data: pending, error: pendingError } = await adminSupabase
       .from('pending_orders')
       .select('*')
       .eq('order_id', orderId)
       .maybeSingle();
 
     if (pendingError) {
       console.error('[Verify Payment] Pending order lookup error:', pendingError);
     }
 
     // Extract info from order_tags (fallback) OR pending table
     const tags = order.order_tags || {};
     const planId = pending?.plan_id || tags.plan_id;
     const whatsappPackId = pending?.whatsapp_credit_pack_id || tags.whatsapp_credit_pack_id;
     const organizationId = pending?.organization_id || tags.organization_id;
     const interval = pending?.interval || tags.interval || 'monthly';
 
     console.log('[Verify Payment] Step 5: Resolved metadata:', { planId, organizationId, interval });
 
     if (!organizationId) {
       console.error('[Verify Payment] CRITICAL: Missing organization_id');
       return NextResponse.json({ success: false, error: 'Missing organization_id in session tracking' }, { status: 400 });
     }
 
     // ── CASE 1: SUBSCRIPTION PLAN ───────────────────────────────────────────
     if (planId) {
       console.log('[Verify Payment] Step 6: Processing Subscription Plan update...');
       const { data: plan } = await adminSupabase
         .from('subscription_plans')
         .select('id, name, plan_code, monthly_price, yearly_price')
         .eq('id', planId)
         .single();
 
       if (!plan) {
         console.error('[Verify Payment] Plan not found for ID:', planId);
         return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
       }
 
       const now = new Date();
       const periodEnd = new Date(now);
       if (interval === 'yearly') {
         periodEnd.setFullYear(periodEnd.getFullYear() + 1);
       } else {
         periodEnd.setDate(periodEnd.getDate() + 30);
       }
 
       const amountPaid = order.order_amount;
 
       // Check for resubscription status
       const { data: existingSub } = await adminSupabase
         .from('organization_subscriptions')
         .select('status')
         .eq('organization_id', organizationId)
         .maybeSingle();
       
       const isResubscription = existingSub?.status === 'cancelled';

       // Step 2: Exact upsert logic as requested
       console.log('[Verify Payment] Step 7: Performing organization_subscriptions upsert...');
       const { data: upsertData, error: upsertError } = await adminSupabase
         .from('organization_subscriptions')
         .upsert({
             organization_id: organizationId,
             plan_id: planId,
             status: 'active',
             billing_cycle: interval,
             current_period_start: now.toISOString(),
             current_period_end: periodEnd.toISOString(),
             trial_ends_at: null,
             cancelled_at: null,
             price_paid: amountPaid,
             updated_at: now.toISOString(),
         }, { onConflict: 'organization_id' });
 
       console.log('[Verify Payment] Upsert result:', upsertData, 'Upsert error:', upsertError);
       if (upsertError) throw upsertError;
 
       // Also update the main organizations table status
       await adminSupabase
         .from('organizations')
         .update({ 
           subscription_status: 'active',
           plan_code: plan.plan_code 
         })
         .eq('id', organizationId);
 
       // Step 4: Add Billing History Record
       console.log('[Verify Payment] Step 8: Adding Billing History record...');
       await adminSupabase.from('subscription_invoices').insert({
         organization_id: organizationId,
         plan_name: plan.name,
         amount_paid: amountPaid,
         billing_cycle: interval,
         payment_date: now.toISOString(),
         next_renewal_date: periodEnd.toISOString(),
         cashfree_order_id: orderId,
         status: 'paid'
       });
 
       // Update auth metadata
       try {
         await supabase.auth.updateUser({
           data: { sub_status: 'active', sub_expires: periodEnd.toISOString() },
         });
       } catch (e) {
         console.warn('[Verify Payment] Auth metadata sync failed (likely background job):', e);
       }
 
       // Revalidate caches
       revalidatePath('/', 'layout');
       revalidatePath('/settings/subscription', 'page');

       // Step 3 (Cleanup): Delete pending order record
       await adminSupabase.from('pending_orders').delete().eq('order_id', orderId);

       console.log('[Verify Payment] SUCCESS: Subscription fulfilled for org:', organizationId);
       
       try {
         await sendSubscriptionEmail(adminSupabase, organizationId, plan, amountPaid, interval, periodEnd, isResubscription);
       } catch (e) {
         console.error('[Verify Payment] Email job failed:', e);
       }

       return NextResponse.json({
         success: true,
         type: 'subscription',
         plan: { name: plan.name, current_period_end: periodEnd.toISOString() },
       });
     } 
     
     // ── CASE 2: WHATSAPP CREDIT PACK (Fallback to original logic) ───────────
     else if (whatsappPackId) {
       console.log('[Verify Payment] Step 6: Processing WhatsApp Pack purchase...');
       const credits = Number(tags.credits) || 0;
       const amountPaid = order.order_amount;
 
       const { error: rpcError } = await adminSupabase.rpc('provision_whatsapp_credits', {
         target_org_id: organizationId,
         credits_to_add: credits
       });
       if (rpcError) throw rpcError;
 
       await adminSupabase.from('whatsapp_credit_purchases').insert({
         organization_id: organizationId,
         pack_id: whatsappPackId,
         amount_paid: amountPaid,
         credits_added: credits,
         payment_status: 'paid',
         cashfree_order_id: orderId
       });
 
       revalidatePath('/whatsapp');
       await adminSupabase.from('pending_orders').delete().eq('order_id', orderId);
       
       try {
         await sendWhatsAppPackEmail(adminSupabase, organizationId, credits, amountPaid);
       } catch (e) {
         console.error('[Verify Payment] WhatsApp Email job failed:', e);
       }
       
       return NextResponse.json({ success: true, type: 'whatsapp_pack', credits_added: credits });
     }
 
     return NextResponse.json({ success: false, error: 'No valid purchase type detected' }, { status: 400 });
 
   } catch (error) {
     console.error('[Verify Payment] FATAL ERROR:', error);
     return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
   }
}

// ── Helper Functions ────────────────────────────────────────────────────────

async function sendSubscriptionEmail(
  adminSupabase: any, 
  organizationId: string, 
  plan: any, 
  amountPaid: number, 
  interval: string, 
  periodEnd: Date,
  isResubscription: boolean = false
) {
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

      const subject = isResubscription 
        ? 'Welcome Back to Clerixs! Your Subscription is Active.'
        : 'Payment Confirmed — Your Clerixs Subscription is Active';
      
      const welcomeLine = isResubscription
        ? "We're glad to have you back."
        : `your payment was successful and your <strong>${plan.name}</strong> plan is now active. You have full access to all features in your clinic.`;

      const { data, error: emailError } = await resend.emails.send({
        from: 'Clerixs <noreply@clerixs.com>',
        to: [ownerEmail],
        subject: subject,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">CLERIXS</h1>
              </div>
              
              <h2 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 20px; font-weight: 700;">${isResubscription ? 'Resubscription Active ✓' : 'Subscription Active ✓'}</h2>
              <p style="margin-bottom: 24px; line-height: 1.6; color: #475569;">Hi ${ownerName}, ${welcomeLine}</p>
              ${isResubscription ? `<p style="margin-bottom: 24px; line-height: 1.6; color: #475569;">Your <strong>${plan.name}</strong> plan has being reactivated. You have full access to all features in your clinic.</p>` : ''}
              
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

      if (emailError) {
        console.error('[Verify Payment] Resend failed to send subscription email:', emailError);
        throw new Error(emailError.message);
      } else {
        console.log('[Verify Payment] Resend successfully sent subscription email:', data);
      }
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

      const { data, error: emailError } = await resend.emails.send({
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

      if (emailError) {
        console.error('[Verify Payment] Resend failed to send WhatsApp pack email:', emailError);
        throw new Error(emailError.message);
      } else {
        console.log('[Verify Payment] Resend successfully sent WhatsApp pack email:', data);
      }
    }
}
