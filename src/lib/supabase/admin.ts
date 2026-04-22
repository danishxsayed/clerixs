import { createClient } from '@supabase/supabase-js'

/**
 * CAUTION: This client uses the Service Role Key and bypasses Row Level Security (RLS).
 * It should ONLY be used in server-side contexts for administrative tasks like 
 * credit deduction or managing internal metadata. NEVER use this in client-side code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin environment variables are missing');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
