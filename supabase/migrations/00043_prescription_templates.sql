-- Create prescription templates table
CREATE TABLE IF NOT EXISTS public.prescription_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by_membership_id UUID NOT NULL REFERENCES public.organization_memberships(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    diagnosis TEXT,
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_advice TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescription_templates ENABLE ROW LEVEL SECURITY;

-- Helper to find user's organization from organization_memberships
-- Create a policy that allows owners, admins, and doctors to manage templates within their org
CREATE POLICY "Users can view templates in their organization"
    ON public.prescription_templates
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE profile_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Users can create templates in their organization"
    ON public.prescription_templates
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE profile_id = auth.uid()
            AND status = 'active'
            AND role IN ('org_owner', 'doctor')
        )
    );

CREATE POLICY "Users can update templates in their organization"
    ON public.prescription_templates
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE profile_id = auth.uid()
            AND status = 'active'
            AND role IN ('org_owner', 'doctor')
        )
    );

CREATE POLICY "Users can delete templates in their organization"
    ON public.prescription_templates
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_memberships
            WHERE profile_id = auth.uid()
            AND status = 'active'
            AND role IN ('org_owner', 'doctor')
        )
    );

-- Add index for organization_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_prescription_templates_org_id ON public.prescription_templates(organization_id);
