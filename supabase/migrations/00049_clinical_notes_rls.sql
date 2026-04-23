-- Enable RLS for clinical_notes
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

-- Policies for clinical_notes
DROP POLICY IF EXISTS "Users can view clinical notes" ON clinical_notes;
CREATE POLICY "Users can view clinical notes" ON clinical_notes 
FOR SELECT USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can insert clinical notes" ON clinical_notes;
CREATE POLICY "Users can insert clinical notes" ON clinical_notes 
FOR INSERT WITH CHECK (is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can update clinical notes" ON clinical_notes;
CREATE POLICY "Users can update clinical notes" ON clinical_notes 
FOR UPDATE USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Users can delete clinical notes" ON clinical_notes;
CREATE POLICY "Users can delete clinical notes" ON clinical_notes 
FOR DELETE USING (is_org_member(organization_id));
