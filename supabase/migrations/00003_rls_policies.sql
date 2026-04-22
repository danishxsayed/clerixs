-- Drop existing policies to cleanly replace them
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_memberships;
DROP POLICY IF EXISTS "Users can insert memberships" ON organization_memberships;
DROP POLICY IF EXISTS "Users can view patients in their organization" ON patients;
DROP POLICY IF EXISTS "Users can insert patients in their organization" ON patients;
DROP POLICY IF EXISTS "Users can update patients in their organization" ON patients;
DROP POLICY IF EXISTS "Users can view appointments in their organization" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments in their organization" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments in their organization" ON appointments;
DROP POLICY IF EXISTS "Users can view branches for their organizations" ON branches;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Helper function to break infinite recursion
-- SECURITY DEFINER allows the function to bypass RLS to check membership
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE organization_id = org_id AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Organizations
CREATE POLICY "Users can view orgs" ON organizations FOR SELECT USING (is_org_member(id) OR owner_profile_id = auth.uid());
CREATE POLICY "Users can create orgs" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_profile_id);
CREATE POLICY "Owners can update orgs" ON organizations FOR UPDATE USING (auth.uid() = owner_profile_id);

-- 3. Memberships
CREATE POLICY "Users can view memberships" ON organization_memberships FOR SELECT USING (is_org_member(organization_id) OR profile_id = auth.uid());
CREATE POLICY "Users can insert memberships" ON organization_memberships FOR INSERT WITH CHECK (profile_id = auth.uid());

-- 4. Patients
CREATE POLICY "Users can view patients" ON patients FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert patients" ON patients FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update patients" ON patients FOR UPDATE USING (is_org_member(organization_id));

-- 5. Appointments
CREATE POLICY "Users can view appointments" ON appointments FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert appointments" ON appointments FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update appointments" ON appointments FOR UPDATE USING (is_org_member(organization_id));

-- 6. Branches
CREATE POLICY "Users can view branches" ON branches FOR SELECT USING (is_org_member(organization_id));
