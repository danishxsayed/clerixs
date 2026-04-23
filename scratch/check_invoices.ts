import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkInvoices() {
  const orgId = 'd666b85f-c32e-4cef-af0d-b47d15424165';
  console.log('Checking invoices for org:', orgId);

  const { data: invoices, error } = await adminSupabase
    .from('subscription_invoices')
    .select('*')
    .eq('organization_id', orgId);

  console.log('Invoices:', JSON.stringify(invoices, null, 2));
  if (error) console.error('Error:', error);
}

checkInvoices();
