-- 1. Update lab_order_status enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block in some Postgres versions.
-- However, Supabase migration runs might handle this or we can do it separately.
ALTER TYPE lab_order_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE lab_order_status ADD VALUE IF NOT EXISTS 'revision_requested';
ALTER TYPE lab_order_status ADD VALUE IF NOT EXISTS 'approved';

-- 2. Add columns to lab_orders
ALTER TABLE lab_orders 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS doctor_comments TEXT,
ADD COLUMN IF NOT EXISTS technician_comments TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by_profile_id UUID REFERENCES profiles(id);

-- 3. Add index for approved by
CREATE INDEX IF NOT EXISTS idx_lab_orders_approved_by ON lab_orders(approved_by_profile_id);

-- 4. Audit Log Helper (Optional but good for tracking status changes)
-- Assuming audit_logs exists from initial schema
