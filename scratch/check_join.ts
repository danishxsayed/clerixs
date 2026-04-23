import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: plans } = await adminSupabase.from('subscription_plans').select('*');
  console.log('Plans:', JSON.stringify(plans, null, 2));

  const orgId = 'd666b85f-c32e-4cef-af0d-b47d15424165';

  const { data: sub, error } = await adminSupabase
    .from('organization_subscriptions')
    .select('*, plan:subscription_plans!organization_subscriptions_plan_id_fkey(*)')
    .eq('organization_id', orgId)
    .maybeSingle();

  console.log('Subscription with Join:', JSON.stringify(sub, null, 2));
  console.log('Subscription Join Error:', error);
}

check();
