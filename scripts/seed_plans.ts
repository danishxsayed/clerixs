import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedPlans() {
  const plans = [
    {
      plan_code: 'basic',
      name: 'Basic',
      monthly_price: 999.00,
      yearly_price: 9999.00,
      max_branches: 1,
      max_staff: 2,
      max_monthly_appointments: -1, // representing unlimited or some high number
      features: {
        dashboard: true,
        patients: true,
        treatments: true,
        prescriptions: true,
        medicine_autocomplete: true,
        billing: true,
        lab_dashboard: true,
        basic_reports: true,
        price_catalog: true,
        advanced_reports: false,
        export_reports: false,
        bulk_patient_import: false,
        multi_doctor_scheduling: false,
        patient_visit_summary: false,
        lab_packages: false,
      },
      is_active: true
    },
    {
      plan_code: 'pro',
      name: 'Pro',
      monthly_price: 1599.00,
      yearly_price: 16999.00,
      max_branches: 3,
      max_staff: 5,
      max_monthly_appointments: -1,
      features: {
        dashboard: true,
        patients: true,
        treatments: true,
        prescriptions: true,
        medicine_autocomplete: true,
        billing: true,
        lab_dashboard: true,
        basic_reports: true,
        price_catalog: true,
        advanced_reports: true,
        export_reports: true,
        bulk_patient_import: true,
        multi_doctor_scheduling: true,
        patient_visit_summary: true,
        lab_packages: true,
      },
      is_active: true
    }
  ];

  console.log('Seeding plans...');
  
  for (const plan of plans) {
    const { data: existingPlan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_code', plan.plan_code)
      .single();

    if (existingPlan) {
      console.log(`Plan ${plan.plan_code} already exists, updating...`);
      const { error } = await supabase
        .from('subscription_plans')
        .update(plan)
        .eq('id', existingPlan.id);
      
      if (error) {
        console.error(`Failed to update plan ${plan.plan_code}:`, error.message);
      } else {
        console.log(`Updated plan ${plan.plan_code}`);
      }
    } else {
      console.log(`Plan ${plan.plan_code} not found, inserting...`);
      const { error } = await supabase
        .from('subscription_plans')
        .insert(plan);
        
      if (error) {
        console.error(`Failed to insert plan ${plan.plan_code}:`, error.message);
      } else {
        console.log(`Inserted plan ${plan.plan_code}`);
      }
    }
  }

  console.log('Seeding complete.');
}

seedPlans();
