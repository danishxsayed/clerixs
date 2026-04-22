import * as React from 'react';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { ListFilter } from '@/components/ui/list-filter';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AppointmentList } from './appointment-list';
import { ViewToggle } from './view-toggle';
import { StatusFilter } from './status-filter';
import { AppointmentsSkeleton } from './skeleton';

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  
  const query = resolvedSearchParams?.query?.toString() || '';
  const statusFilter = resolvedSearchParams?.status?.toString() || 'All';
  const view = resolvedSearchParams?.view?.toString() || 'list';
  const dateFilter = resolvedSearchParams?.date?.toString() || '';
  const doctorFilter = resolvedSearchParams?.doctor?.toString() || '';
  const page = parseInt(resolvedSearchParams?.page?.toString() || '1', 10);
  const itemsPerPage = 50;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('default_organization_id').eq('id', user.id).single();
  const orgId = profile?.default_organization_id;
  if (!orgId) redirect('/dashboard');

  // Build Filter Groups Data (Cached or fast query)
  const { data: doctors } = await supabase
    .from('organization_memberships')
    .select('id, profiles(full_name)')
    .eq('organization_id', orgId)
    .in('role', ['doctor', 'org_owner']);

  const filterGroups = [
    {
      id: 'date',
      label: 'Date Range',
      options: [
        { value: 'today', label: 'Today' },
        { value: 'upcoming', label: 'Upcoming (7d)' },
        { value: 'month', label: 'This Month' },
        { value: 'past', label: 'Past' },
      ]
    },
    {
      id: 'doctor',
      label: 'Doctor',
      featureKey: 'multi_doctor_scheduling',
      options: doctors?.map(d => ({
         value: d.id,
         label: (d.profiles as any)?.full_name ? `Dr. ${(d.profiles as any).full_name}` : 'Unknown'
      })) || []
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <div className="flex items-center gap-4">
          <ViewToggle 
            currentView={view} 
            query={query}
            statusFilter={statusFilter}
          />
          <Link 
            href="/appointments/new" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4 hidden sm:inline" /><span className="hidden sm:inline">Add Appointment</span><span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
         <div className="relative flex-1 max-w-sm flex items-center gap-2">
            <SearchInput placeholder="Search patients..." />
            <ListFilter groups={filterGroups} showDatePicker />
          </div>

          <StatusFilter currentStatus={statusFilter} />
      </div>

      <Suspense key={`${view}-${statusFilter}-${query}-${dateFilter}-${doctorFilter}-${page}`} fallback={<AppointmentsSkeleton />}>
        <AppointmentList 
          view={view}
          query={query}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          doctorFilter={doctorFilter}
          page={page}
          itemsPerPage={itemsPerPage}
          orgId={orgId}
        />
      </Suspense>
    </div>
  );
}
