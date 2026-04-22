-- 00023_process_invite_rpc.sql
-- Forcefully resurrects Zombie Users by locking them securely into a clinic

CREATE OR REPLACE FUNCTION public.process_existing_user_invite(p_invite_id UUID, p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_org_id UUID;
    v_role TEXT;
BEGIN
    -- 1. Get verified invite details
    SELECT organization_id, role INTO v_org_id, v_role
    FROM public.staff_invites
    WHERE id = p_invite_id AND accepted_at IS NULL;

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Invite not found or already accepted.';
    END IF;

    -- 2. Update user's profile to default to this organization
    UPDATE public.profiles SET default_organization_id = v_org_id WHERE id = p_user_id;

    -- 3. Infallible Insert/Upsert into organization memberships
    INSERT INTO public.organization_memberships (organization_id, profile_id, role, status)
    VALUES (v_org_id, p_user_id, v_role, 'active')
    ON CONFLICT (organization_id, profile_id) 
    DO UPDATE SET status = 'active', role = EXCLUDED.role;

    -- 4. Neutralize the pending invite receipt
    UPDATE public.staff_invites SET accepted_at = NOW() WHERE id = p_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
