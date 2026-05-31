import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log('Checking profiles columns...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, specialty')
    .limit(1);

  if (profileError) {
    console.error('Profiles check error:', profileError);
  } else {
    console.log('Profiles columns check successful:', profileData);
  }

  console.log('Checking organizations columns...');
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, primary_specialty, onboarding_step')
    .limit(1);

  if (orgError) {
    console.error('Organizations check error:', orgError);
  } else {
    console.log('Organizations columns check successful:', orgData);
  }
}

check();
