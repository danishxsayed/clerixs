-- 00018_fix_invite_rls.sql
-- Allow invitees to update their own invite status (e.g. accepted_at)
-- This allows the server action (running under their newly created auth session)
-- to mark the invite as redeemed immediately after signup.

DROP POLICY IF EXISTS "Invitees can update their invite status" ON staff_invites;

CREATE POLICY "Invitees can update their invite status"
ON staff_invites FOR UPDATE
USING (email = (auth.jwt() ->> 'email'))
WITH CHECK (email = (auth.jwt() ->> 'email'));
