INSERT INTO subscription_plans (
  plan_code, 
  name, 
  monthly_price, 
  yearly_price, 
  max_branches, 
  max_staff, 
  max_monthly_appointments, 
  features, 
  is_active
) VALUES 
(
  'basic',
  'Basic',
  999.00,
  9999.00,
  1,
  2,
  -1,
  '{
    "dashboard": true,
    "patients": true,
    "treatments": true,
    "prescriptions": true,
    "medicine_autocomplete": true,
    "billing": true,
    "lab_dashboard": true,
    "basic_reports": true,
    "price_catalog": true,
    "advanced_reports": false,
    "export_reports": false,
    "bulk_patient_import": false,
    "multi_doctor_scheduling": false,
    "patient_visit_summary": false,
    "lab_packages": false
  }'::jsonb,
  true
),
(
  'pro',
  'Pro',
  1599.00,
  16999.00,
  3,
  5,
  -1,
  '{
    "dashboard": true,
    "patients": true,
    "treatments": true,
    "prescriptions": true,
    "medicine_autocomplete": true,
    "billing": true,
    "lab_dashboard": true,
    "basic_reports": true,
    "price_catalog": true,
    "advanced_reports": true,
    "export_reports": true,
    "bulk_patient_import": true,
    "multi_doctor_scheduling": true,
    "patient_visit_summary": true,
    "lab_packages": true
  }'::jsonb,
  true
)
ON CONFLICT (plan_code) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  max_branches = EXCLUDED.max_branches,
  max_staff = EXCLUDED.max_staff,
  max_monthly_appointments = EXCLUDED.max_monthly_appointments,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;
