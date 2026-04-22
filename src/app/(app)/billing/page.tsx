import * as React from 'react';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SearchInput } from '@/components/ui/search-input';
import Link from 'next/link';
import { ListFilter } from '@/components/ui/list-filter';
import { Suspense } from 'react';
import { InvoiceList } from './invoice-list';
import { StatusFilter } from './status-filter';
import { BillingSkeleton } from './skeleton';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  
  const query = resolvedSearchParams?.query?.toString() || '';
  const statusFilter = resolvedSearchParams?.status?.toString() || 'All';
  const dateFilter = resolvedSearchParams?.date?.toString() || '';
  const page = parseInt(resolvedSearchParams?.page?.toString() || '1', 10);
  const itemsPerPage = 50;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.default_organization_id) {
    redirect('/dashboard');
  }

  const orgId = profile.default_organization_id;

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('profile_id', user.id)
    .single();

  if (membership?.role !== 'org_owner' && membership?.role !== 'receptionist') {
    redirect('/dashboard');
  }

  const filterGroups = [
    {
      id: 'date',
      label: 'Issue Date',
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
        <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
        <Link 
          href="/billing/new" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
         <div className="relative flex-1 max-w-sm flex items-center gap-2">
            <SearchInput placeholder="Search invoice numbers..." />
            <ListFilter groups={filterGroups} showDatePicker />
          </div>

          <StatusFilter currentStatus={statusFilter} />
      </div>

      <Suspense key={`${statusFilter}-${query}-${dateFilter}-${page}`} fallback={<BillingSkeleton />}>
        <InvoiceList 
          query={query}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          page={page}
          itemsPerPage={itemsPerPage}
          orgId={orgId}
        />
      </Suspense>
    </div>
  );
}
