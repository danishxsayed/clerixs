import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsertInvoice() {
  const orgId = 'd666b85f-c32e-4cef-af0d-b47d15424165';
  
  const { data, error } = await adminSupabase.from('subscription_invoices').insert({
    organization_id: orgId,
    plan_name: 'Basic',
    amount_paid: 1499,
    billing_cycle: 'monthly',
    payment_date: new Date().toISOString(),
    cashfree_order_id: 'manual_test_' + Date.now(),
    status: 'paid'
  });

  console.log('Result:', data);
  console.log('Error:', error);
}

testInsertInvoice();
