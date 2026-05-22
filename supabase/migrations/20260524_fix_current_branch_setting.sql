-- Migration: Fix app.current_branch setting to handle missing values gracefully
-- File: supabase/migrations/20260524_fix_current_branch_setting.sql

-- 1. Fix default values for branch_id columns
ALTER TABLE patients ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch', true)::uuid);
ALTER TABLE prescriptions ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch', true)::uuid);
ALTER TABLE clinical_notes ALTER COLUMN branch_id SET DEFAULT (current_setting('app.current_branch', true)::uuid);

-- 2. Drop existing RLS policies
DROP POLICY IF EXISTS "patients_branch_isolation" ON patients;
DROP POLICY IF EXISTS "prescriptions_branch_isolation" ON prescriptions;
DROP POLICY IF EXISTS "clinical_notes_branch_isolation" ON clinical_notes;

-- 3. Recreate RLS policies with missing_ok = true
CREATE POLICY "patients_branch_isolation" ON patients
  USING (branch_id = current_setting('app.current_branch', true)::uuid);

CREATE POLICY "prescriptions_branch_isolation" ON prescriptions
  USING (branch_id = current_setting('app.current_branch', true)::uuid);

CREATE POLICY "clinical_notes_branch_isolation" ON clinical_notes
  USING (branch_id = current_setting('app.current_branch', true)::uuid);

-- End of migration
