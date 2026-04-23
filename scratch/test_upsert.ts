import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUpsert() {
  const organizationId = 'd666b85f-c32e-4cef-af0d-b47d15424165';
  const planId = '069b2ba6-f81d-4edd-9964-37288df60201'; // From sample subs or verified ID
  
  console.log('Testing upsert for org:', organizationId);
  
  const { data, error } = await adminSupabase
    .from('organization_subscriptions')
    .upsert({
      organization_id: organizationId,
      plan_id: planId,
      status: 'active',
      billing_cycle: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date().toISOString(),
      price_paid: 1499,
      updated_at: new Date().toISOString()
    }, { onConflict: 'organization_id' });

  console.log('Result:', JSON.stringify(data, null, 2));
  console.log('Error:', JSON.stringify(error, null, 2));

  const { data: verifyData } = await adminSupabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', organizationId);
  
  console.log('Verify Data:', JSON.stringify(verifyData, null, 2));
}

testUpsert();
