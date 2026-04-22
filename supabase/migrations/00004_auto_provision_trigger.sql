-- This trigger automatically provisions the tenant architecture when a new user signs up

-- 1. Create a trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_provisioning()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    new_branch_id UUID;
BEGIN
    -- Only provision for the first user (org_owner) of a new tenant
    -- In a more complex app, we might check if they are joining an existing org via invite first

    -- A. Create their Profile mapping
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

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

-- 2. Attach the trigger to Supabase Auth table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_provisioning();

-- Optional: Since we might already have users who signed up before this trigger,
-- we should probably write a backfill script, or the user can just recreate their account.
