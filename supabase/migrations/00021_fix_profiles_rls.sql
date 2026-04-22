-- 00021_fix_profiles_rls.sql
-- Add a policy to allow users within the same organization to view each other's basic profile full_name.

DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

CREATE POLICY "Users can view profiles in their organization"
ON profiles FOR SELECT
USING (
  id IN (
    SELECT profile_id FROM organization_memberships
    WHERE organization_id IN (
      SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid()
    )
  )
);
