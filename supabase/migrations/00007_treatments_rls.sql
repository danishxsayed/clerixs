-- Enable RLS for treatments if not already done
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_items ENABLE ROW LEVEL SECURITY;

-- Drop existing if re-running
DROP POLICY IF EXISTS "Users can view treatments" ON treatments;
DROP POLICY IF EXISTS "Users can insert treatments" ON treatments;
DROP POLICY IF EXISTS "Users can update treatments" ON treatments;
DROP POLICY IF EXISTS "Users can delete treatments" ON treatments;

DROP POLICY IF EXISTS "Users can view treatment items" ON treatment_items;
DROP POLICY IF EXISTS "Users can insert treatment items" ON treatment_items;
DROP POLICY IF EXISTS "Users can update treatment items" ON treatment_items;
DROP POLICY IF EXISTS "Users can delete treatment items" ON treatment_items;

-- Treatments Policies
CREATE POLICY "Users can view treatments" ON treatments FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert treatments" ON treatments FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update treatments" ON treatments FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete treatments" ON treatments FOR DELETE USING (is_org_member(organization_id));

-- Treatment Items Policies 
CREATE POLICY "Users can view treatment items" ON treatment_items FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert treatment items" ON treatment_items FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update treatment items" ON treatment_items FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete treatment items" ON treatment_items FOR DELETE USING (is_org_member(organization_id));
