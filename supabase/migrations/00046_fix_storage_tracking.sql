-- 00046_fix_storage_tracking.sql
-- Description: Unify storage tracking by making patient_id nullable and ensuring RLS

-- 1. Make patient_id nullable in patient_files
ALTER TABLE public.patient_files ALTER COLUMN patient_id DROP NOT NULL;

-- 2. Ensure RLS is enabled and policies exist for storage calculation and management
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view files in their organization" ON public.patient_files;
CREATE POLICY "Users can view files in their organization"
ON public.patient_files FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships
        WHERE profile_id = auth.uid() AND status = 'active'
    )
);

DROP POLICY IF EXISTS "Users can insert files in their organization" ON public.patient_files;
CREATE POLICY "Users can insert files in their organization"
ON public.patient_files FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships
        WHERE profile_id = auth.uid() AND status = 'active'
    )
);

DROP POLICY IF EXISTS "Users can delete files in their organization" ON public.patient_files;
CREATE POLICY "Users can delete files in their organization"
ON public.patient_files FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships
        WHERE profile_id = auth.uid() AND status = 'active'
    )
);

-- 3. Add index for better storage calculation performance
CREATE INDEX IF NOT EXISTS idx_patient_files_org_size ON public.patient_files(organization_id, file_size_bytes);
