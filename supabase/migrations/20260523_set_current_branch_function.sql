-- Migration: Create helper function to set current branch for RLS
-- File: supabase/migrations/20260523_set_current_branch_function.sql

CREATE OR REPLACE FUNCTION set_current_branch(branch_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_branch', branch_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution rights to anon role (or appropriate)
GRANT EXECUTE ON FUNCTION set_current_branch(uuid) TO anon;

-- End of migration
