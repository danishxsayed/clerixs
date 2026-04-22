-- 00020_fix_billing_notifications.sql
-- Modify the row level security policy for notifications so that doctors do not see billing notifications.

DROP POLICY IF EXISTS "Members can view tenant notifications" ON notifications;

CREATE POLICY "Members can view tenant notifications"
ON notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_memberships.profile_id = auth.uid()
    AND organization_memberships.organization_id = notifications.organization_id
    AND organization_memberships.status = 'active'
    AND (
      notifications.type != 'billing'
      OR role IN ('org_owner', 'receptionist')
    )
  )
  AND (notifications.profile_id IS NULL OR notifications.profile_id = auth.uid())
);
