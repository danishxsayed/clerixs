-- Allow org_owners to delete staff_invites

CREATE POLICY "Owners can delete staff_invites"
ON public.staff_invites
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM public.organization_memberships
    WHERE profile_id = auth.uid()
    AND role = 'org_owner'
  )
);
