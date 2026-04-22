import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ImportPatientsModal } from './import-modal';
import { FeatureLock } from '@/components/subscription/FeatureLock';
import { PatientRowActions } from './patient-row-actions';
import { ClickableTableRow } from '@/components/ui/clickable-table-row';
import { ListFilter } from '@/components/ui/list-filter';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';

import { Suspense } from 'react';
import { PatientList } from './patient-list';
import { PatientSkeleton } from './skeleton';

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query?.toString() || '';
  const statusFilter = resolvedSearchParams?.status?.toString() || '';
  const dateFilter = resolvedSearchParams?.date?.toString() || '';
  const page = parseInt(resolvedSearchParams?.page?.toString() || '1', 10);

  const filterGroups = [
    {
      id: 'date',
      label: 'Registered Date',
      options: [
        { value: 'today', label: 'Today' },
        { value: 'last7', label: 'Last 7 Days' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
      ]
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
        <div className="flex items-center gap-2">
          <FeatureLock featureKey="bulk_patient_import">
            <ImportPatientsModal />
          </FeatureLock>
          <Link 
            href="/patients/new" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm flex items-center gap-2">
            <SearchInput placeholder="Search patients by name..." />
            <ListFilter groups={filterGroups} showDatePicker />
        </div>
      </div>
      
      <Suspense key={`${query}-${statusFilter}-${dateFilter}-${page}`} fallback={<PatientSkeleton />}>
        <PatientList 
          query={query}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          page={page}
        />
      </Suspense>
    </div>
  );
}
