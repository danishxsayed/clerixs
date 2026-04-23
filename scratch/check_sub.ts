import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: userData } = await adminSupabase.auth.admin.listUsers();
  const targetUser = userData.users.find(u => u.email === 'mddanishsayed786@gmail.com');
  
  if (!targetUser) {
    console.error('User not found');
    return;
  }

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', targetUser.id)
    .single();

  const orgId = profile.default_organization_id;
  console.log('Org ID:', orgId);

  const { data: orgData } = await adminSupabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  console.log('Organization:', JSON.stringify(orgData, null, 2));

  const { data: sub } = await adminSupabase
    .from('organization_subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('organization_id', orgId)
    .maybeSingle();

  console.log('Subscription:', JSON.stringify(sub, null, 2));
}

check();
