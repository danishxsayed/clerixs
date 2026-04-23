import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  // Check if organization_subscriptions table has any data at all
  const { data: allSubs, error: subError } = await adminSupabase
    .from('organization_subscriptions')
    .select('*');

  console.log('All Subscriptions Count:', allSubs?.length || 0);
  if (allSubs && allSubs.length > 0) {
    console.log('Sample Subscription:', JSON.stringify(allSubs[0], null, 2));
  }
  if (subError) console.error('Sub Error:', subError);

  // Check the organizations table as well
  const { data: allOrgs } = await adminSupabase
    .from('organizations')
    .select('id, name, subscription_status, plan_code')
    .limit(5);
  
  console.log('Sample Orgs:', JSON.stringify(allOrgs, null, 2));
}

check();
