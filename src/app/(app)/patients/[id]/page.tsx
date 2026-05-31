import { Suspense } from 'react';
import { PatientDashboard } from './patient-dashboard';
import { PatientSkeleton } from './skeleton';

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from('patients')
    .select('full_name')
    .eq('id', resolvedParams.id)
    .single();

  return {
    title: patient ? `${patient.full_name} | Patients` : 'Patient Details',
  };
}

export default async function PatientViewPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<PatientSkeleton />}>
      <PatientDashboard id={resolvedParams.id} />
    </Suspense>
  );
}
