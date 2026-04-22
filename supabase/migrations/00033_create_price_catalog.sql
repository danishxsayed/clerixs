-- Create price_catalog table
CREATE TABLE IF NOT EXISTS public.price_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: The price is stored as DECIMAL to handle currency accurately
-- category will be things like: 'Consultation', 'Procedure', 'Lab Test', 'Medicine', 'Other'

-- Enable RLS
ALTER TABLE public.price_catalog ENABLE ROW LEVEL SECURITY;

-- Drop existing if re-running
DROP POLICY IF EXISTS "Users can view price catalog" ON price_catalog;
DROP POLICY IF EXISTS "Users can insert price catalog" ON price_catalog;
DROP POLICY IF EXISTS "Users can update price catalog" ON price_catalog;
DROP POLICY IF EXISTS "Users can delete price catalog" ON price_catalog;

-- Price Catalog Policies using the standard is_org_member helper
CREATE POLICY "Users can view price catalog" ON price_catalog FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert price catalog" ON price_catalog FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update price catalog" ON price_catalog FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete price catalog" ON price_catalog FOR DELETE USING (is_org_member(organization_id));

-- Add an index to speed up querying by organization
CREATE INDEX IF NOT EXISTS idx_price_catalog_org_id ON public.price_catalog(organization_id);
