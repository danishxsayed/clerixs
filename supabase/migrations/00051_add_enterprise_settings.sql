-- Add Enterprise Branch Settings to organizations table

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS is_enterprise BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS max_branches INTEGER DEFAULT 1 NOT NULL;
