-- 00022_hard_remove_staff.sql

-- Elevate permissions momentarily (SECURITY DEFINER) so the org owner can explicitly delete auth.users
CREATE OR REPLACE FUNCTION public.hard_remove_staff(p_membership_id UUID)
RETURNS void AS $$
DECLARE
    v_target_profile_id UUID;
    v_org_id UUID;
    v_target_email TEXT;
BEGIN
    -- 1. Get the membership details
    SELECT profile_id, organization_id INTO v_target_profile_id, v_org_id
    FROM public.organization_memberships
    WHERE id = p_membership_id;

    IF v_target_profile_id IS NULL THEN
        RAISE EXCEPTION 'Membership not found.';
    END IF;

    -- 2. Security Check: ensure caller is an org_owner for this org
    IF NOT EXISTS (
        SELECT 1 FROM public.organization_memberships
        WHERE profile_id = auth.uid() AND organization_id = v_org_id AND role = 'org_owner'
    ) THEN
        RAISE EXCEPTION 'Not authorized. Only org owners can remove staff.';
    END IF;

    -- 3. Get the user's email before deletion to clean up staff_invites unconditionally
    SELECT email INTO v_target_email FROM auth.users WHERE id = v_target_profile_id;

    -- 4. Delete the invite so they can be re-invited cleanly in the future
    IF v_target_email IS NOT NULL THEN
        DELETE FROM public.staff_invites 
        WHERE organization_id = v_org_id AND LOWER(email) = LOWER(v_target_email);
    END IF;

    -- 5. Delete from auth.users (Cascades to profiles and memberships securely)
    DELETE FROM auth.users WHERE id = v_target_profile_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
