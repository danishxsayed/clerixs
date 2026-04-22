import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id, full_name, phone')
      .eq('id', user.id)
      .single();

    if (!profile?.default_organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }
    
    const body = await req.json();
    console.log('[Cashfree Create Order] Request Body:', body);
    const { planId, interval, whatsappCreditPackId } = body;

    // 2. Prevent duplicate plan payments (only for subscription upgrades)
    const orgId = profile.default_organization_id;
    if (planId) {
      const { data: existingSub } = await supabase
        .from('organization_subscriptions')
        .select('status, current_period_end')
        .eq('organization_id', orgId)
        .single();

      if (existingSub && existingSub.status === 'active' && existingSub.current_period_end) {
        const isUnexpired = new Date(existingSub.current_period_end) > new Date();
        if (isUnexpired) {
          console.warn(`[Cashfree Create Order] Denying duplicate order for orgId ${orgId}. Active subscription found.`);
          return NextResponse.json({ error: 'You already have an active subscription. Please cancel your current plan before purchasing a new one.' }, { status: 400 });
        }
      }
    }

    let orderAmount = 0;
    let orderId = '';
    let orderTags: any = { organization_id: orgId };
    let returnPath = '/settings/subscription';

    // 3. Handle Plan Purchase
    if (planId) {
      if (!interval) return NextResponse.json({ error: 'interval is required for plan purchases' }, { status: 400 });
      
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
      
      orderAmount = interval === 'yearly' ? plan.yearly_price : plan.monthly_price;
      orderId = `sub_${orgId}_${Date.now()}`;
      orderTags = { 
        ...orderTags, 
        plan_id: String(planId), 
        interval: String(interval),
        organization_id: String(orgId)
      };
      returnPath = `/settings/subscription?order_id={order_id}`;
    } 
    // 4. Handle WhatsApp Pack Purchase
    else if (whatsappCreditPackId) {
      const { data: pack, error: packError } = await supabase
        .from('whatsapp_credit_packs')
        .select('*')
        .eq('id', whatsappCreditPackId)
        .single();

      if (packError || !pack) return NextResponse.json({ error: 'Invalid WhatsApp pack selected' }, { status: 400 });

      orderAmount = Number(pack.price);
      orderId = `wa_${orgId}_${Date.now()}`;
      orderTags = { 
        ...orderTags, 
        whatsapp_credit_pack_id: String(whatsappCreditPackId), 
        credits: String(pack.credits),
        organization_id: String(orgId)
      };
      returnPath = `/whatsapp?tab=history&order_id={order_id}`;
    }
    else {
      return NextResponse.json({ error: 'planId or whatsappCreditPackId is required' }, { status: 400 });
    }

    const customerId = `cust_${user.id.replace(/-/g, '')}`;

    // Cashfree API requirements
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID || process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'SANDBOX';
    const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

    if (!appId || !secretKey) {
       console.error("[Cashfree Create Order] ERROR: Cashfree credentials missing.");
       return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerId,
          customer_name: profile.full_name || 'Clerixs Clinic',
          customer_email: user.email,
          customer_phone: profile.phone || '9999999999'
        },
        order_meta: {
          return_url: `${req.headers.get('origin') || 'http://localhost:3000'}${returnPath}`,
        },
        order_tags: orderTags
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Cashfree Create Order] API Request Failed:', data);
      return NextResponse.json({ error: data.message || 'Payment provider error' }, { status: response.status });
    }

    return NextResponse.json({
      paymentSessionId: data.payment_session_id,
      orderId: data.order_id
    });

  } catch (err: any) {
    console.error('[Cashfree Create Order] FATAL ERROR during checkout flow:');
    console.error(err);
    if (err instanceof Error) {
       console.error('[Cashfree Create Order] Stack Trace:', err.stack);
    }
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}
