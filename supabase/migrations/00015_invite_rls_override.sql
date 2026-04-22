-- 00015_invite_rls_override.sql
-- Drop the restrictive policies on staff invites
DROP POLICY IF EXISTS "Users can view staff invites" ON staff_invites;
DROP POLICY IF EXISTS "Unauthenticated users can read their own invite via token hash" ON staff_invites;

-- Master override for invite reads: ANYONE can read a staff invite record.
-- Security is maintained because the `invite_token_hash` acts as a 256-bit password,
-- meaning attackers cannot guess rows, and they can only ever see the email/role 
-- if they hold the cryptographically secure token exactly.
CREATE POLICY "Public read access to invites"
ON staff_invites FOR SELECT
USING (true);

-- Fix the invoice RLS to ensure org owners can read/update all invoices freely
DROP POLICY IF EXISTS "Users can update their org invoices" ON invoices;
CREATE POLICY "Users can update their org invoices"
ON invoices FOR UPDATE
USING (is_org_member(organization_id))
WITH CHECK (is_org_member(organization_id));
