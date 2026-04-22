-- 00027_org_signature.sql
-- Add signature_url to organizations table so the clinic owner's signature applies globally to all prescriptions

ALTER TABLE organizations
ADD COLUMN signature_url TEXT;
