import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Treatments',
};
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TreatmentRowActions } from './treatment-row-actions';
import { ListFilter } from '@/components/ui/list-filter';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';

import { Suspense } from 'react';
import { TreatmentList } from './treatment-list';
import { TreatmentSkeleton } from './skeleton';

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const query = resolvedSearchParams?.query?.toString() || '';
  const statusFilter = resolvedSearchParams?.status?.toString() || 'All';
  const dateFilter = resolvedSearchParams?.date?.toString() || '';
  const page = parseInt(resolvedSearchParams?.page?.toString() || '1', 10);

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

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm flex items-center gap-2">
            <SearchInput placeholder="Search records..." />
            <ListFilter groups={filterGroups} showDatePicker />
          </div>

          <div className="flex rounded-md shadow-sm bg-background border overflow-hidden">
             {(['All', 'Planned', 'In Progress', 'Completed', 'Cancelled'] as const).map((status) => {
               const isActive = statusFilter === status;
               const href = query 
                ? `?query=${encodeURIComponent(query)}${status !== 'All' ? `&status=${status}` : ''}`
                : status !== 'All' ? `?status=${status}` : '?';

               return (
                <Link
                  key={status}
                  href={href}
                  className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground text-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${status !== 'All' ? 'border-l' : ''}`}
                >
                  {status}
                </Link>
             )})}
          </div>
      </div>

      <Suspense key={`${query}-${statusFilter}-${dateFilter}-${page}`} fallback={<TreatmentSkeleton />}>
        <TreatmentList 
          query={query}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          page={page}
        />
      </Suspense>
    </div>
  );
}
