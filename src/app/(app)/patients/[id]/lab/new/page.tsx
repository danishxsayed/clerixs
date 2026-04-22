import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLabCatalog } from '@/app/(app)/lab/actions';
import { LabOrderForm } from './lab-order-form';

export default async function NewLabOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Get patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name, patient_code')
    .eq('id', resolvedParams.id)
    .single();

  if (!patient) return notFound();

  // Get catalog
  const { success, tests, packages } = await getLabCatalog();

  return (
    <div className="flex-1 space-y-4 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Order Lab Test</h2>
        <p className="text-muted-foreground mt-1">Select tests and packages for {patient.full_name} ({patient.patient_code}).</p>
      </div>

      <LabOrderForm patientId={patient.id} tests={tests || []} packages={packages || []} />
    </div>
  );
}
