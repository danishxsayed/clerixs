import { Suspense } from 'react';
import { PatientDashboard } from './patient-dashboard';
import { PatientSkeleton } from './skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientViewPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<PatientSkeleton />}>
      <PatientDashboard id={resolvedParams.id} />
    </Suspense>
  );
}
