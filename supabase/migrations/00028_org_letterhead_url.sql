-- 00028_org_letterhead_url.sql
-- Add letterhead_url to organizations table so the clinic can use a global letterhead across prescriptions and invoices

ALTER TABLE organizations
ADD COLUMN letterhead_url TEXT;
