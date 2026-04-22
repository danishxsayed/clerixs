-- 00025_prescriptions_rls.sql
-- Security Policies ensuring only Doctors or Owners can create prescriptions, but all verified staff can read them.

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

-- Reading Prescriptions
CREATE POLICY "Staff can view org prescriptions"
ON public.prescriptions FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active'
    )
);

-- Writing Prescriptions
CREATE POLICY "Doctors and Owners can insert prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active' AND role IN ('doctor', 'org_owner')
    )
);

CREATE POLICY "Doctors and Owners can update prescriptions"
ON public.prescriptions FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active' AND role IN ('doctor', 'org_owner')
    )
);

CREATE POLICY "Doctors and Owners can delete prescriptions"
ON public.prescriptions FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active' AND role IN ('doctor', 'org_owner')
    )
);

-- Reading Prescription Items
CREATE POLICY "Staff can view org prescription items"
ON public.prescription_items FOR SELECT
USING (
    prescription_id IN (
        SELECT id FROM public.prescriptions WHERE organization_id IN (
            SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active'
        )
    )
);

-- Writing Prescription Items
CREATE POLICY "Doctors and Owners can insert prescription items"
ON public.prescription_items FOR INSERT
WITH CHECK (
    prescription_id IN (
        SELECT id FROM public.prescriptions WHERE organization_id IN (
            SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active' AND role IN ('doctor', 'org_owner')
        )
    )
);

CREATE POLICY "Doctors and Owners can update prescription items"
ON public.prescription_items FOR UPDATE
USING (
    prescription_id IN (
        SELECT id FROM public.prescriptions WHERE organization_id IN (
            SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active' AND role IN ('doctor', 'org_owner')
        )
    )
);

CREATE POLICY "Doctors and Owners can delete prescription items"
ON public.prescription_items FOR DELETE
USING (
    prescription_id IN (
        SELECT id FROM public.prescriptions WHERE organization_id IN (
            SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid() AND status = 'active' AND role IN ('doctor', 'org_owner')
        )
    )
);
