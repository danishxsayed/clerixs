-- Migration: Add branch_id to lab_orders table to enforce branch data isolation
-- File: supabase/migrations/00055_add_branch_id_to_lab_orders.sql

-- 1. Add branch_id to lab_orders
ALTER TABLE public.lab_orders 
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- 2. Populate branch_id for existing records using the first branch of the organization
UPDATE public.lab_orders lo
SET branch_id = (
  SELECT id FROM public.branches b
  WHERE b.organization_id = lo.organization_id
  ORDER BY b.created_at ASC LIMIT 1
)
WHERE lo.branch_id IS NULL;

-- 3. Set default value for branch_id columns using session variable (optional fallback)
ALTER TABLE public.lab_orders ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch', true)::uuid);

-- 4. Ensure NOT NULL constraint after backfill
ALTER TABLE public.lab_orders ALTER COLUMN branch_id SET NOT NULL;

-- 5. Add index for branch_id on lab_orders table
CREATE INDEX IF NOT EXISTS idx_lab_orders_branch_id ON public.lab_orders(branch_id);

-- 6. Configure RLS Policies for lab_orders branch isolation
DROP POLICY IF EXISTS "Users can view lab_orders" ON public.lab_orders;
CREATE POLICY "Users can view lab_orders" ON public.lab_orders
  FOR SELECT USING (is_org_member(organization_id) AND branch_id = current_setting('app.current_branch', true)::uuid);

DROP POLICY IF EXISTS "Users can insert lab_orders" ON public.lab_orders;
CREATE POLICY "Users can insert lab_orders" ON public.lab_orders
  FOR INSERT WITH CHECK (is_org_member(organization_id) AND branch_id = current_setting('app.current_branch', true)::uuid);

DROP POLICY IF EXISTS "Users can update lab_orders" ON public.lab_orders;
CREATE POLICY "Users can update lab_orders" ON public.lab_orders
  FOR UPDATE USING (is_org_member(organization_id) AND branch_id = current_setting('app.current_branch', true)::uuid);

DROP POLICY IF EXISTS "Users can delete lab_orders" ON public.lab_orders;
CREATE POLICY "Users can delete lab_orders" ON public.lab_orders
  FOR DELETE USING (is_org_member(organization_id) AND branch_id = current_setting('app.current_branch', true)::uuid);
