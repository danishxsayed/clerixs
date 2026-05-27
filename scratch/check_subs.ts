import { createAdminClient } from '../src/lib/supabase/admin';

async function checkStatus() {
  const supabase = createAdminClient();
  
  console.log('--- Subscription Plans ---');
  const { data: plans, error: plansError } = await supabase.from('subscription_plans').select('*');
  if (plansError) console.error('Plans Error:', plansError);
  else console.log(JSON.stringify(plans, null, 2));

  console.log('\n--- Current Subscriptions ---');
  const { data: subs, error: subsError } = await supabase.from('organization_subscriptions').select('*, subscription_plans!organization_subscriptions_plan_id_fkey(name)');
  if (subsError) console.error('Subs Error:', subsError);
  else console.log(JSON.stringify(subs, null, 2));
}

checkStatus();
