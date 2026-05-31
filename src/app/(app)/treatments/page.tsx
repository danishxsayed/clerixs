import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Treatments',
};
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { TreatmentList } from './treatment-list';
import { TreatmentSkeleton } from './skeleton';
import { DoctorFilter } from './doctor-filter';
import { ListFilter } from '@/components/ui/list-filter';
import { Suspense } from 'react';

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const query = resolvedSearchParams?.query?.toString() || '';
  const statusFilter = resolvedSearchParams?.status?.toString() || 'All';
  const dateFilter = resolvedSearchParams?.date?.toString() || '';
  const doctorFilter = resolvedSearchParams?.doctor?.toString() || 'All';
  const page = parseInt(resolvedSearchParams?.page?.toString() || '1', 10);

  const supabase = await createClient();

  // Fetch doctors for organization
  const { data: doctorsData } = await supabase
    .from('organization_memberships')
    .select('id, profiles!inner(full_name)')
    .eq('role', 'doctor')
    .eq('status', 'active');

  const doctors = doctorsData?.map((d: any) => ({
    id: d.id,
    full_name: d.profiles?.full_name || 'Unknown Doctor'
  })).sort((a, b) => a.full_name.localeCompare(b.full_name)) || [];

  const filterGroups = [
    {
      id: 'date',
      label: 'Logged Date',
      options: [
        { value: 'today', label: 'Today' },
        { value: 'last7', label: 'Last 7 Days' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Treatments</h2>
        <Link 
          href="/treatments/new" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> New Treatment
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
          <div className="flex flex-col sm:flex-row flex-1 gap-2 max-w-xl items-stretch sm:items-center">
            <SearchInput placeholder="Search patient or treatment..." />
            <DoctorFilter doctors={doctors} />
            <ListFilter groups={filterGroups} showDatePicker />
          </div>

          <div className="flex rounded-md shadow-sm bg-background border overflow-hidden self-start lg:self-auto max-w-full overflow-x-auto">
             {(['All', 'Planned', 'In Progress', 'Completed', 'Cancelled'] as const).map((status) => {
               const isActive = statusFilter === status;
               
               // Build clean link parameters
               const params = new URLSearchParams();
               if (query) params.set('query', query);
               if (doctorFilter !== 'All') params.set('doctor', doctorFilter);
               if (dateFilter) params.set('date', dateFilter);
               if (status !== 'All') params.set('status', status);

               const href = `?${params.toString()}`;

               return (
                <Link
                  key={status}
                  href={href}
                  className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${status !== 'All' ? 'border-l' : ''}`}
                >
                  {status}
                </Link>
              )})}
          </div>
      </div>

      <Suspense key={`${query}-${statusFilter}-${dateFilter}-${doctorFilter}-${page}`} fallback={<TreatmentSkeleton />}>
        <TreatmentList 
          query={query}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          doctorFilter={doctorFilter}
          page={page}
        />
      </Suspense>
    </div>
  );
}
