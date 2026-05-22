-- Migration: Set default for branch_id and create RLS policies
-- File: supabase/migrations/20260522_branch_id_default_and_rls.sql

-- 1. Set default value for branch_id columns using session variable
ALTER TABLE patients ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch')::uuid);
ALTER TABLE prescriptions ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch')::uuid);
ALTER TABLE clinical_notes ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch')::uuid);
-- Add defaults for other tables (if they have branch_id columns, modify accordingly)
-- Assuming tables: appointments, treatments, lab_orders, invoices, queue_entries
-- Add column definitions if missing (example shown for appointments)
-- ALTER TABLE appointments ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) DEFAULT (current_setting('app.current_branch')::uuid);

-- 2. Enable Row Level Security on tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
-- Enable for other tables as needed
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies to enforce branch isolation
-- Patients
CREATE POLICY "patients_branch_isolation" ON patients
  USING (branch_id = current_setting('app.current_branch')::uuid);

-- Prescriptions
CREATE POLICY "prescriptions_branch_isolation" ON prescriptions
  USING (branch_id = current_setting('app.current_branch')::uuid);

-- Clinical Notes
CREATE POLICY "clinical_notes_branch_isolation" ON clinical_notes
  USING (branch_id = current_setting('app.current_branch')::uuid);

-- Add similar policies for other tables as needed
-- CREATE POLICY "appointments_branch_isolation" ON appointments USING (branch_id = current_setting('app.current_branch')::uuid);
-- CREATE POLICY "treatments_branch_isolation" ON treatments USING (branch_id = current_setting('app.current_branch')::uuid);
-- CREATE POLICY "lab_orders_branch_isolation" ON lab_orders USING (branch_id = current_setting('app.current_branch')::uuid);
-- CREATE POLICY "invoices_branch_isolation" ON invoices USING (branch_id = current_setting('app.current_branch')::uuid);
-- CREATE POLICY "queue_entries_branch_isolation" ON queue_entries USING (branch_id = current_setting('app.current_branch')::uuid);

-- 4. Create a helper function to set the session variable (optional)
CREATE OR REPLACE FUNCTION set_current_branch(branch_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_branch', branch_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- End of migration
