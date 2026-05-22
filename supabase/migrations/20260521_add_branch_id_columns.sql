-- Migration: Add branch_id columns to relevant tables
-- File: supabase/migrations/20260521_add_branch_id_columns.sql

-- 1. Add branch_id to patients (optional primary branch already exists, add for data isolation)
ALTER TABLE patients
  ADD COLUMN branch_id UUID REFERENCES branches(id);

-- 2. Add branch_id to prescriptions
ALTER TABLE prescriptions
  ADD COLUMN branch_id UUID REFERENCES branches(id);

-- 3. Add branch_id to clinical_notes
ALTER TABLE clinical_notes
  ADD COLUMN branch_id UUID REFERENCES branches(id);

-- 4. Populate branch_id for existing records using the first branch of the organization
-- Update patients
UPDATE patients p
SET branch_id = (
  SELECT id FROM branches b
  WHERE b.organization_id = p.organization_id
  ORDER BY b.created_at ASC LIMIT 1
)
WHERE p.branch_id IS NULL;

-- Update prescriptions
UPDATE prescriptions pr
SET branch_id = (
  SELECT id FROM branches b
  WHERE b.organization_id = pr.organization_id
  ORDER BY b.created_at ASC LIMIT 1
)
WHERE pr.branch_id IS NULL;

-- Update clinical_notes
UPDATE clinical_notes cn
SET branch_id = (
  SELECT id FROM branches b
  WHERE b.organization_id = cn.organization_id
  ORDER BY b.created_at ASC LIMIT 1
)
WHERE cn.branch_id IS NULL;

-- Ensure NOT NULL constraint after backfill (optional, if required)
ALTER TABLE patients ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE prescriptions ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE clinical_notes ALTER COLUMN branch_id SET NOT NULL;

-- Add indexes for branch_id on these tables
CREATE INDEX idx_patients_branch_id ON patients(branch_id);
CREATE INDEX idx_prescriptions_branch_id ON prescriptions(branch_id);
CREATE INDEX idx_clinical_notes_branch_id ON clinical_notes(branch_id);

-- End of migration
