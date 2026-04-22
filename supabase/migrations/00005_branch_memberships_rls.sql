-- Add explicit RLS policy for branch_memberships
-- We allow users to view branch memberships if the associated organization membership belongs to an organization they are a member of.

DROP POLICY IF EXISTS "Users can view branch memberships" ON branch_memberships;

CREATE POLICY "Users can view branch memberships"
ON branch_memberships
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM organization_memberships om
    WHERE om.id = branch_memberships.organization_membership_id
    AND is_org_member(om.organization_id)
  )
);

-- Note: We might also want policies for INSERT/UPDATE/DELETE later for staff management features
