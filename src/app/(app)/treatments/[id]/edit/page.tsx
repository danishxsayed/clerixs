import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TreatmentEditForm } from './treatment-edit-form';

export default async function EditTreatmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch the treatment. RLS ensures they can only fetch it if it belongs to their org.
  const { data: treatment, error } = await supabase
    .from('treatments')
    .select('*, patients(full_name)')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !treatment) {
    console.error('Failed to fetch treatment for editing:', error);
    notFound();
  }

  // Also fetch all patients so they can re-assign the patient if needed
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name');

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Edit Treatment</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
        <p className="text-muted-foreground mb-6">Update clinical record details for this treatment.</p>
        
        <TreatmentEditForm treatment={treatment} patients={patients || []} />
      </div>
    </div>
  );
}
