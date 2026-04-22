import * as React from 'react';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AppointmentDetails } from './appointment-details';
import { AppointmentSkeleton } from './skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentViewPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
      {/* Navigation Header - Rendered Instantly */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/appointments" className="hover:text-foreground transition-colors">Appointments</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium">Appointment Details</span>
      </div>

      <Suspense fallback={<AppointmentSkeleton />}>
        <AppointmentDetails id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
