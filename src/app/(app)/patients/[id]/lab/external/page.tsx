import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ExternalReportForm } from './external-report-form';

export default async function ExternalLabReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Get patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name, patient_code')
    .eq('id', resolvedParams.id)
    .single();

  if (!patient) return notFound();

  return (
    <div className="flex-1 space-y-4 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Upload External Report</h2>
        <p className="text-muted-foreground mt-1">Upload a lab report from an external diagnostic center for {patient.full_name}.</p>
      </div>

      <ExternalReportForm patientId={patient.id} />
    </div>
  );
}
