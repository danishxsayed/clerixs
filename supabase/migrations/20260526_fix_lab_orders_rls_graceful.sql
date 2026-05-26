-- Migration: Fix lab_orders RLS policies to handle missing app.current_branch setting gracefully
-- File: supabase/migrations/20260526_fix_lab_orders_rls_graceful.sql

-- 1. Drop existing strict RLS policies on lab_orders
DROP POLICY IF EXISTS "Users can view lab_orders" ON public.lab_orders;
DROP POLICY IF EXISTS "Users can insert lab_orders" ON public.lab_orders;
DROP POLICY IF EXISTS "Users can update lab_orders" ON public.lab_orders;
DROP POLICY IF EXISTS "Users can delete lab_orders" ON public.lab_orders;

-- 2. Recreate policies to handle missing/empty branch session gracefully
CREATE POLICY "Users can view lab_orders" ON public.lab_orders
  FOR SELECT USING (
    is_org_member(organization_id) 
    AND (
      current_setting('app.current_branch', true) IS NULL 
      OR current_setting('app.current_branch', true) = '' 
      OR branch_id = current_setting('app.current_branch', true)::uuid
    )
  );

CREATE POLICY "Users can insert lab_orders" ON public.lab_orders
  FOR INSERT WITH CHECK (
    is_org_member(organization_id) 
    AND (
      current_setting('app.current_branch', true) IS NULL 
      OR current_setting('app.current_branch', true) = '' 
      OR branch_id = current_setting('app.current_branch', true)::uuid
    )
  );

CREATE POLICY "Users can update lab_orders" ON public.lab_orders
  FOR UPDATE USING (
    is_org_member(organization_id) 
    AND (
      current_setting('app.current_branch', true) IS NULL 
      OR current_setting('app.current_branch', true) = '' 
      OR branch_id = current_setting('app.current_branch', true)::uuid
    )
  );

CREATE POLICY "Users can delete lab_orders" ON public.lab_orders
  FOR DELETE USING (
    is_org_member(organization_id) 
    AND (
      current_setting('app.current_branch', true) IS NULL 
      OR current_setting('app.current_branch', true) = '' 
      OR branch_id = current_setting('app.current_branch', true)::uuid
    )
  );
