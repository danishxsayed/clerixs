import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function manualInsert() {
  const orgId = 'd666b85f-c32e-4cef-af0d-b47d15424165';
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(now.getDate() + 30);

  const { data, error } = await adminSupabase.from('subscription_invoices').insert({
    organization_id: orgId,
    plan_name: 'Basic',
    amount_paid: 999,
    billing_cycle: 'monthly',
    payment_date: now.toISOString(),
    next_renewal_date: periodEnd.toISOString(),
    cashfree_order_id: 'manual_fix_' + Date.now(),
    status: 'paid'
  });

  if (error) console.error('Error:', error);
  else console.log('Successfully inserted manual invoice for UI verification.');
}

manualInsert();
