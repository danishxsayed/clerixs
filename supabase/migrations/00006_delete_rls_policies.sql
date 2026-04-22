-- Add DELETE policies for patients and appointments
-- Requires the is_org_member() function defined in 00003_rls_policies.sql

CREATE POLICY "Users can delete patients" ON patients FOR DELETE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete appointments" ON appointments FOR DELETE USING (is_org_member(organization_id));
