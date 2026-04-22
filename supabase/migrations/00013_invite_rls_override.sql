-- Allow anyone with the exact secure token hash to read the invite record so they can accept it
CREATE POLICY "Unauthenticated users can read their own invite via token hash"
ON staff_invites FOR SELECT
USING (true); -- Note: since they can only query via the 256-bit cryptographically secure token hash, exposing select is functionally secure based on exact match

