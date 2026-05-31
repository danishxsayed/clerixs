import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { TreatmentCreateForm } from './treatment-create-form';

export default async function NewTreatmentPage() {
  const supabase = await createClient();

  // 1. Fetch all patients in the organization so the user can select who the treatment is for
  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name');

  if (patientError) {
    console.error('Failed to fetch patients for treatment form:', patientError);
  }

  // 2. Fetch Active Doctors in organization
  const { data: doctorsData, error: doctorError } = await supabase
    .from('organization_memberships')
    .select('id, profiles!inner(full_name)')
    .eq('status', 'active')
    .in('role', ['doctor', 'org_owner']);

  if (doctorError) {
    console.error('Failed to fetch doctors for treatment form:', doctorError);
  }

  const doctors = doctorsData?.map((d: any) => ({
    id: d.id,
    full_name: d.profiles?.full_name || 'Unknown Doctor'
  })).sort((a, b) => a.full_name.localeCompare(b.full_name)) || [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Log New Treatment</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
        <p className="text-muted-foreground mb-6">Create a new clinical record, diagnosis, or planned procedure for a patient.</p>
        
        <TreatmentCreateForm patients={patients || []} doctors={doctors} />
      </div>
    </div>
  );
}
