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

async function deleteUserByEmail(email: string) {
  console.log(`Searching for user with email: ${email}`);
  
  // 1. List users from Supabase Auth Admin API
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Failed to list users:', listError.message);
    return;
  }
  
  const targetUser = users.find(user => user.email?.toLowerCase() === email.toLowerCase());
  
  if (!targetUser) {
    console.log(`User with email "${email}" not found.`);
    return;
  }
  
  console.log(`Found user: ID = ${targetUser.id}, Email = ${targetUser.email}`);
  
  // 2. Delete user using Supabase Auth Admin API
  const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);
  
  if (deleteError) {
    console.error(`Failed to delete user ${targetUser.id}:`, deleteError.message);
  } else {
    console.log(`Successfully deleted user with email ${email} (ID: ${targetUser.id})`);
  }
}

deleteUserByEmail('hosting.onlinecrawlers@gmail.com');
