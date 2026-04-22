-- 00009_staff_branches_rls.sql

-- Helper function for Owner checks
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_id = org_id AND profile_id = auth.uid() AND role = 'org_owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for phase 8 tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invites ENABLE ROW LEVEL SECURITY;

-- Branches Policies
DROP POLICY IF EXISTS "Users can view branches" ON branches;
CREATE POLICY "Users can view branches" 
ON branches FOR SELECT 
USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Owners can insert branches" ON branches;
CREATE POLICY "Owners can insert branches" 
ON branches FOR INSERT 
WITH CHECK (is_org_owner(organization_id));

DROP POLICY IF EXISTS "Owners can update branches" ON branches;
CREATE POLICY "Owners can update branches" 
ON branches FOR UPDATE 
USING (is_org_owner(organization_id))
WITH CHECK (is_org_owner(organization_id));

DROP POLICY IF EXISTS "Owners can delete branches" ON branches;
CREATE POLICY "Owners can delete branches" 
ON branches FOR DELETE 
USING (is_org_owner(organization_id));

-- Organization Memberships Policies
-- NOTE: The 'is_org_member()' function actually queries this table internally already,
-- so we need to be careful with infinite recursion.
-- The simplest way is to ensure you can see YOUR OWN memberships, 
-- or you can see ALL memberships for an org if you are a member of that org.
DROP POLICY IF EXISTS "Users can view org memberships" ON organization_memberships;
CREATE POLICY "Users can view org memberships"
ON organization_memberships FOR SELECT
USING (profile_id = auth.uid() OR is_org_member(organization_id));

-- Only owners can insert/update/delete memberships
DROP POLICY IF EXISTS "Owners can insert org memberships" ON organization_memberships;
CREATE POLICY "Owners can insert org memberships" 
ON organization_memberships FOR INSERT 
WITH CHECK (is_org_owner(organization_id));

DROP POLICY IF EXISTS "Owners can update org memberships" ON organization_memberships;
CREATE POLICY "Owners can update org memberships" 
ON organization_memberships FOR UPDATE 
USING (is_org_owner(organization_id))
WITH CHECK (is_org_owner(organization_id));

DROP POLICY IF EXISTS "Owners can delete org memberships" ON organization_memberships;
CREATE POLICY "Owners can delete org memberships" 
ON organization_memberships FOR DELETE 
USING (is_org_owner(organization_id));


-- Branch Memberships Policies
DROP POLICY IF EXISTS "Users can view branch memberships" ON branch_memberships;
CREATE POLICY "Users can view branch memberships"
ON branch_memberships FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM organization_memberships om 
        WHERE om.id = branch_memberships.organization_membership_id
        AND is_org_member(om.organization_id)
    )
);

DROP POLICY IF EXISTS "Owners can insert branch memberships" ON branch_memberships;
CREATE POLICY "Owners can insert branch memberships" 
ON branch_memberships FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organization_memberships om 
        WHERE om.id = branch_memberships.organization_membership_id
        AND is_org_owner(om.organization_id)
    )
);


-- Staff Invites Policies
DROP POLICY IF EXISTS "Users can view staff invites" ON staff_invites;
CREATE POLICY "Users can view staff invites" 
ON staff_invites FOR SELECT 
USING (is_org_member(organization_id));

DROP POLICY IF EXISTS "Owners can insert staff invites" ON staff_invites;
CREATE POLICY "Owners can insert staff invites" 
ON staff_invites FOR INSERT 
WITH CHECK (is_org_owner(organization_id));

DROP POLICY IF EXISTS "Owners can update staff invites" ON staff_invites;
CREATE POLICY "Owners can update staff invites" 
ON staff_invites FOR UPDATE 
USING (is_org_owner(organization_id))
WITH CHECK (is_org_owner(organization_id));

DROP POLICY IF EXISTS "Owners can delete staff invites" ON staff_invites;
CREATE POLICY "Owners can delete staff invites" 
ON staff_invites FOR DELETE 
USING (is_org_owner(organization_id));
