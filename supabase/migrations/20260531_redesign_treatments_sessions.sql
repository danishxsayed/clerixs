-- Migration: Redesign treatments module for single/multi session support
-- Path: supabase/migrations/20260531_redesign_treatments_sessions.sql

-- 1. Extend treatments table
ALTER TABLE public.treatments
ADD COLUMN IF NOT EXISTS treatment_type TEXT NOT NULL DEFAULT 'single' CHECK (treatment_type IN ('single', 'multi')),
ADD COLUMN IF NOT EXISTS estimated_sessions INTEGER,
ADD COLUMN IF NOT EXISTS completed_sessions INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS collected_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_end_date DATE;

-- 2. Create treatment_sessions table
CREATE TABLE IF NOT EXISTS public.treatment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_id UUID NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    doctor_membership_id UUID REFERENCES public.organization_memberships(id) ON DELETE SET NULL,
    notes TEXT,
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('completed', 'scheduled', 'cancelled')),
    next_session_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Enable RLS on treatment_sessions
ALTER TABLE public.treatment_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Drop and recreate policies for treatment_sessions
DROP POLICY IF EXISTS "Users can view treatment_sessions" ON public.treatment_sessions;
DROP POLICY IF EXISTS "Users can insert treatment_sessions" ON public.treatment_sessions;
DROP POLICY IF EXISTS "Users can update treatment_sessions" ON public.treatment_sessions;
DROP POLICY IF EXISTS "Users can delete treatment_sessions" ON public.treatment_sessions;

CREATE POLICY "Users can view treatment_sessions" ON public.treatment_sessions 
    FOR SELECT USING (is_org_member(organization_id));

CREATE POLICY "Users can insert treatment_sessions" ON public.treatment_sessions 
    FOR INSERT WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Users can update treatment_sessions" ON public.treatment_sessions 
    FOR UPDATE USING (is_org_member(organization_id));

CREATE POLICY "Users can delete treatment_sessions" ON public.treatment_sessions 
    FOR DELETE USING (is_org_member(organization_id));

-- 5. Add trigger for updated_at on treatment_sessions
DROP TRIGGER IF EXISTS set_timestamp_treatment_sessions ON public.treatment_sessions;
CREATE TRIGGER set_timestamp_treatment_sessions
BEFORE UPDATE ON public.treatment_sessions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. Extend patient_files table with treatment_id
ALTER TABLE public.patient_files
ADD COLUMN IF NOT EXISTS treatment_id UUID REFERENCES public.treatments(id) ON DELETE CASCADE;

-- 7. Setup treatments storage bucket and policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('treatments', 'treatments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Treatments are publicly accessible" ON storage.objects;
CREATE POLICY "Treatments are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'treatments' );

DROP POLICY IF EXISTS "Users can upload treatments" ON storage.objects;
CREATE POLICY "Users can upload treatments"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'treatments' );

DROP POLICY IF EXISTS "Users can delete treatments" ON storage.objects;
CREATE POLICY "Users can delete treatments"
ON storage.objects FOR DELETE
USING ( bucket_id = 'treatments' );
