-- 00047_calculate_db_size_function.sql
-- Description: Create a function to calculate the total byte size of database records for an organization

CREATE OR REPLACE FUNCTION public.calculate_organization_data_size(target_org_id uuid)
RETURNS bigint AS $$
DECLARE
    total_size bigint := 0;
BEGIN
    -- 1. Tables with direct organization_id
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.patients t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.appointments t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.prescriptions t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.invoices t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.payments t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.treatments t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.clinical_notes t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.lab_orders t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.prescription_templates t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.invoice_items t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.treatment_items t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.lab_test_categories t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.lab_tests t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.lab_packages t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.patient_medical_histories t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.patient_files t WHERE organization_id = target_org_id);
    total_size := total_size + (SELECT COALESCE(SUM(pg_column_size(t.*)), 0) FROM public.audit_logs t WHERE organization_id = target_org_id);

    -- 2. Tables requiring joins (no direct organization_id)
    
    -- Prescription Items
    total_size := total_size + (
        SELECT COALESCE(SUM(pg_column_size(pi.*)), 0) 
        FROM public.prescription_items pi
        JOIN public.prescriptions p ON pi.prescription_id = p.id
        WHERE p.organization_id = target_org_id
    );

    -- Lab Order Items
    total_size := total_size + (
        SELECT COALESCE(SUM(pg_column_size(loi.*)), 0) 
        FROM public.lab_order_items loi
        JOIN public.lab_orders lo ON loi.lab_order_id = lo.id
        WHERE lo.organization_id = target_org_id
    );

    -- Lab Samples
    total_size := total_size + (
        SELECT COALESCE(SUM(pg_column_size(ls.*)), 0) 
        FROM public.lab_samples ls
        JOIN public.lab_orders lo ON ls.lab_order_id = lo.id
        WHERE lo.organization_id = target_org_id
    );

    -- Lab Results
    total_size := total_size + (
        SELECT COALESCE(SUM(pg_column_size(lr.*)), 0) 
        FROM public.lab_results lr
        JOIN public.lab_orders lo ON lr.lab_order_id = lo.id
        WHERE lo.organization_id = target_org_id
    );

    -- Lab Test Parameters
    total_size := total_size + (
        SELECT COALESCE(SUM(pg_column_size(ltp.*)), 0) 
        FROM public.lab_test_parameters ltp
        JOIN public.lab_tests lt ON ltp.lab_test_id = lt.id
        WHERE lt.organization_id = target_org_id
    );

    RETURN total_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
