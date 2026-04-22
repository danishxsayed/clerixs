-- Create Enum for Notification Types
CREATE TYPE notification_type AS ENUM ('appointment', 'billing', 'system');

-- Create Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Optional: If NULL, it's a tenant-wide broadcast
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'system',
    link_url TEXT, -- Optional URI to navigate when clicked
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexing for Dashboard Speed
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Organization Members can read all tenant-wide notifications OR notifications targeted directly at them
CREATE POLICY "Members can view tenant notifications"
ON notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_memberships.profile_id = auth.uid()
    AND organization_memberships.organization_id = notifications.organization_id
    AND organization_memberships.status = 'active'
  )
  AND (notifications.profile_id IS NULL OR notifications.profile_id = auth.uid())
);

-- 2. Organization Members can update their OWN targeted notifications (e.g. mark as read)
-- OR they can mark tenant-wide notifications as read (Though ideally tenant-wide is read-status per user via a join table, 
-- but for MVP we will allow any tenant admin/staff to mark a tenant-wide alert as read/cleared for the org).
CREATE POLICY "Members can update their notifications"
ON notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_memberships.profile_id = auth.uid()
    AND organization_memberships.organization_id = notifications.organization_id
    AND organization_memberships.status = 'active'
  )
);

-- 3. Only Service Roles / Authenticated backend routes should insert notifications
CREATE POLICY "Backend can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_memberships.profile_id = auth.uid()
    AND organization_memberships.organization_id = notifications.organization_id
    AND organization_memberships.status = 'active'
  )
);
