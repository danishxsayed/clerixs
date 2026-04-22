-- [PHASE 30] HOTFIX: Handle Staff Invite Provisioning in Trigger to Avoid RLS/Session Race Conditions

CREATE OR REPLACE FUNCTION public.handle_new_user_provisioning()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    new_branch_id UUID;
    v_invite_record RECORD;
BEGIN
    -- A. Create their Profile mapping unconditionally
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

    -- CRITICAL FIX: If this is a staff invite link, join them to the clinic directly
    IF (NEW.raw_user_meta_data->>'is_staff_invite') = 'true' THEN
        
        -- Find the valid invite for this email
        SELECT id, organization_id, role INTO v_invite_record
        FROM public.staff_invites
        WHERE LOWER(email) = LOWER(NEW.email) AND accepted_at IS NULL
        ORDER BY expires_at DESC LIMIT 1;

        IF v_invite_record.id IS NOT NULL THEN
            -- Update their profile with the joined org
            UPDATE public.profiles 
            SET default_organization_id = v_invite_record.organization_id 
            WHERE id = NEW.id;

            -- Assign them to the Org as per invite role
            INSERT INTO public.organization_memberships (organization_id, profile_id, role, status)
            VALUES (v_invite_record.organization_id, NEW.id, v_invite_record.role, 'active');

            -- Assign them to the default branch (Headquarters) of that org, if it exists
            SELECT id INTO new_branch_id 
            FROM public.branches 
            WHERE organization_id = v_invite_record.organization_id 
            ORDER BY created_at ASC LIMIT 1;
            
            IF new_branch_id IS NOT NULL THEN
                INSERT INTO public.branch_memberships (organization_membership_id, branch_id, is_primary)
                SELECT id, new_branch_id, true
                FROM public.organization_memberships
                WHERE organization_id = v_invite_record.organization_id AND profile_id = NEW.id;
            END IF;

            -- Mark invite as accepted
            UPDATE public.staff_invites 
            SET accepted_at = NOW() 
            WHERE id = v_invite_record.id;
        END IF;

        RETURN NEW;
    END IF;

    -- B. [Regular user flow] Provision a default Organization for them
    INSERT INTO public.organizations (name, slug, owner_profile_id)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Clinic') || '''s Clinic',
        LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', 'clinic'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(NEW.id::text, 1, 4),
        NEW.id
    ) RETURNING id INTO new_org_id;

    -- Update their profile with the default org
    UPDATE public.profiles SET default_organization_id = new_org_id WHERE id = NEW.id;

    -- C. Auto-assign them as the Org Owner in Memberships
    INSERT INTO public.organization_memberships (organization_id, profile_id, role, status)
    VALUES (new_org_id, NEW.id, 'org_owner', 'active');

    -- D. Provision a default Branch (Headquarters)
    INSERT INTO public.branches (organization_id, name, is_active)
    VALUES (new_org_id, 'Headquarters', true)
    RETURNING id INTO new_branch_id;

    -- E. Auto-assign the user to this Branch
    INSERT INTO public.branch_memberships (organization_membership_id, branch_id, is_primary)
    SELECT id, new_branch_id, true
    FROM public.organization_memberships
    WHERE organization_id = new_org_id AND profile_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
