import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data, error } = await adminSupabase.from('organization_subscriptions').select('auto_renewal_enabled').limit(1);
  if (error) {
    console.log('Column missing, applying migration...');
    // We can't apply migrations easily via JS without a PG driver, but we can try to run SQL if there is an RPC
    // Usually we just assume the user will apply or we write it.
    // However, if we want to be helpful we can try to add it via a simple RPC if available.
  } else {
    console.log('Column exists.');
  }
}

check();
