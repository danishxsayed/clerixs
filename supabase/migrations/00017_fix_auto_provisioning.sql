-- Modify trigger to skip auto-provisioning if they are a staff invite
CREATE OR REPLACE FUNCTION public.handle_new_user_provisioning()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    new_branch_id UUID;
BEGIN
    -- A. Create their Profile mapping unconditionally
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

    -- Skip provisioning default org if this is a staff invite
    IF (NEW.raw_user_meta_data->>'is_staff_invite') = 'true' THEN
        RETURN NEW;
    END IF;

    -- B. Provision a default Organization for them
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
