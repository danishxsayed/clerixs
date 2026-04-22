import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select(`
      profiles_fake_join (full_name)
    `)
    .limit(1);

  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
run();
