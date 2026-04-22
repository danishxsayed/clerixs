import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PatientEditForm } from './patient-edit-form';

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch the patient. RLS ensures they can only fetch it if it belongs to their org.
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !patient) {
    console.error('Failed to fetch patient for editing:', error);
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Edit Patient</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
        <p className="text-muted-foreground mb-6">Update details for {patient.patient_code} - {patient.full_name}.</p>
        
        <PatientEditForm patient={patient} />
      </div>
    </div>
  );
}
