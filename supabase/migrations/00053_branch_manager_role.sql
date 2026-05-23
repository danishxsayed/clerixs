-- 00053_branch_manager_role.sql
-- 1. Add 'branch_manager' to the user_role enum
-- Note: ALTER TYPE ADD VALUE cannot run inside a transaction block in PostgreSQL, but Supabase allows it if we run it directly or check.
-- To make sure it doesn't fail, we do ADD VALUE IF NOT EXISTS.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'branch_manager';

-- 2. Add branch login management fields to branches table
ALTER TABLE public.branches
ADD COLUMN IF NOT EXISTS has_login BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS login_email TEXT,
ADD COLUMN IF NOT EXISTS login_status TEXT DEFAULT 'no_login'; -- 'no_login', 'active', 'disabled'
