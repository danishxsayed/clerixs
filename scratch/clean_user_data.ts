import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userId = '8e43c4e0-b252-4058-b413-794ecb355925';

async function cleanData() {
  console.log(`Starting cleanup for user ID: ${userId}`);

  // Get organization memberships first
  const { data: memberships } = await supabase
    .from('organization_memberships')
    .select('id, organization_id')
    .eq('profile_id', userId);

  console.log('User memberships:', memberships);

  if (memberships && memberships.length > 0) {
    for (const mem of memberships) {
      // 1. Delete branch memberships
      const { error: bmErr } = await supabase
        .from('branch_memberships')
        .delete()
        .eq('organization_membership_id', mem.id);
      if (bmErr) console.error('Error deleting branch memberships:', bmErr.message);
      else console.log(`Deleted branch memberships for membership ${mem.id}`);

      // 2. Delete organization memberships
      const { error: omErr } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('id', mem.id);
      if (omErr) console.error('Error deleting membership:', omErr.message);
      else console.log(`Deleted organization membership ${mem.id}`);

      // 3. Check if they own the organization or clean up branches
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_profile_id', userId);

      console.log('Owned organizations:', orgs);

      if (orgs && orgs.length > 0) {
        for (const org of orgs) {
          // Clean up price_catalog
          await supabase.from('price_catalog').delete().eq('organization_id', org.id);
          // Clean up lab_test_categories
          await supabase.from('lab_test_categories').delete().eq('organization_id', org.id);
          // Clean up branches
          await supabase.from('branches').delete().eq('organization_id', org.id);
          // Nullify default_organization_id on profile
          await supabase.from('profiles').update({ default_organization_id: null }).eq('id', userId);
          // Delete organization
          const { error: orgDelErr } = await supabase
            .from('organizations')
            .delete()
            .eq('id', org.id);
          if (orgDelErr) console.error('Error deleting organization:', orgDelErr.message);
          else console.log(`Deleted organization ${org.id}`);
        }
      }
    }
  }

  // Delete profile
  const { error: profErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profErr) console.error('Error deleting profile:', profErr.message);
  else console.log('Deleted profile');

  // Finally delete Auth User
  const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error('Error deleting auth user:', authErr.message);
  } else {
    console.log('Successfully deleted Auth User!');
  }
}

cleanData();
