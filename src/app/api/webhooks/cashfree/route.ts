import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server'; // We need an admin client for webhooks

// Supabase helper for webhook context which doesn't have an authed user session
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function verifyCashfreeWebhook(rawBody: string, signature: string, timestamp: string) {
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!secretKey) return false;
  
  const payload = timestamp + rawBody;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64');
    
  return signature === expectedSignature;
}

export async function POST(req: Request) {
  try {
    const rawBodyText = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    if (!signature || !timestamp || !verifyCashfreeWebhook(rawBodyText, signature, timestamp)) {
       return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBodyText);
    const eventType = payload.type;
    const { order } = payload.data;

    // We only care about SUCCESS events for now
    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
       
       // Note: Webhooks don't have user cookies, so we need to use service_role key to bypass RLS.
       const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
       const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
       
       if (!supabaseUrl || !supabaseServiceKey) {
           console.error("Missing supabase service role key for webhook");
           return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
       }
       
       const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

       // Re-fetch the order from Cashfree to be absolutely secure and get tags
       // Alternatively, tags might be included in the webhook payload depending on Cashfree API version
       // Assuming tags are in order_tags
       let tags = order.order_tags;
       
       // Fallback to fetching order details if tags not present in webhook
       if (!tags) {
         const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
         const secretKey = process.env.CASHFREE_SECRET_KEY;
         const env = process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX';
         const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

         const orderRes = await fetch(`${baseUrl}/orders/${order.order_id}`, {
            headers: {
              'x-client-id': appId!,
              'x-client-secret': secretKey!,
              'x-api-version': '2023-08-01',
            }
         });
         const orderData = await orderRes.json();
         tags = orderData.order_tags;
       }

       if (!tags || !tags.organization_id || !tags.plan_id) {
          console.error("No tags found for order:", order.order_id);
          return NextResponse.json({ received: true }); // Acknowledge to stop retries
       }

       const { organization_id: orgId, plan_id: planId, interval } = tags;

       // Calculate new period
       const now = new Date();
       const currentPeriodEnd = new Date();
       if (interval === 'yearly') {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
       } else {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
       }

       // Update or Insert the subscription record
       const { error: upsertError } = await supabaseAdmin
          .from('organization_subscriptions')
          .upsert({
             organization_id: orgId,
             plan_id: planId,
             status: 'active',
             price_paid: order.order_amount,
             billing_cycle: interval,
             current_period_start: now.toISOString(),
             current_period_end: currentPeriodEnd.toISOString(),
             cancel_at_period_end: false,
             updated_at: now.toISOString()
          }, { onConflict: 'organization_id' });

       if (upsertError) {
          console.error("Error updating subscription:", upsertError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
       }
       
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
