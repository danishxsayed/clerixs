-- Add DELETE policy to notifications table
CREATE POLICY "Members can delete their notifications"
ON notifications
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_memberships.profile_id = auth.uid()
    AND organization_memberships.organization_id = notifications.organization_id
    AND organization_memberships.status = 'active'
  )
);
