import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { InvoiceRowActions } from './invoice-row-actions';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';
import { cookies } from 'next/headers';

interface InvoiceListProps {
  query: string;
  statusFilter: string;
  dateFilter: string;
  page: number;
  itemsPerPage: number;
  orgId: string;
}

export async function InvoiceList({
  query,
  statusFilter,
  dateFilter,
  page,
  itemsPerPage,
  orgId,
}: InvoiceListProps) {
  const supabase = await createClient();
  const formatCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format;

  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get('clerixs_selected_branch')?.value;

  let dbQuery = supabase
    .from('invoices')
    .select(`
      *,
      patients ( full_name )
    `, { count: 'estimated' })
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (selectedBranchId && selectedBranchId !== 'all') {
    dbQuery = dbQuery.eq('branch_id', selectedBranchId);
  }

  if (statusFilter !== 'All') {
    dbQuery = dbQuery.eq('status', statusFilter.toLowerCase().replace(' ', '_'));
  }
  
  if (query) {
    dbQuery = dbQuery.ilike('invoice_number', `%${query}%`);
  }

  if (dateFilter) {
    const { start, end } = getDateRangeBounds(dateFilter);
    if (start) dbQuery = dbQuery.gte('issue_date', start.toISOString().split('T')[0]);
    if (end) dbQuery = dbQuery.lte('issue_date', end.toISOString().split('T')[0]);
  }

  const { data: invoices, count: totalInvoices, error } = await dbQuery;

  if (error) {
    return <div className="p-6 text-red-500 text-sm">Error loading invoices: {error.message}</div>;
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground flex-col gap-2 p-8 border rounded-xl border-dashed">
        <p>No invoices found.</p>
        <p className="text-sm">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden whitespace-nowrap overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted bg-opacity-50 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Invoice No.</th>
            <th className="px-6 py-3 font-medium">Issue Date</th>
            <th className="px-6 py-3 font-medium">Patient</th>
            <th className="px-6 py-3 font-medium text-right">Total Amount</th>
            <th className="px-6 py-3 font-medium text-right">Balance Due</th>
            <th className="px-6 py-3 font-medium text-center">Status</th>
            <th className="px-6 py-3 font-medium text-right shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoices.map((inv: any) => (
            <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4 font-medium">{inv.invoice_number}</td>
              <td className="px-6 py-4">{new Date(inv.issue_date).toLocaleDateString()}</td>
              <td className="px-6 py-4">{inv.patients?.full_name || 'Unknown Patient'}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(inv.total_amount)}</td>
              <td className="px-6 py-4 text-right font-semibold">{formatCurrency(inv.balance_due)}</td>
              <td className="px-6 py-4 text-center">
                <span 
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize 
                    ${inv.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                    ${inv.status === 'issued' ? 'bg-blue-100 text-blue-800' : ''}
                    ${inv.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                    ${inv.status === 'void' ? 'bg-red-100 text-red-800' : ''}
                  `}
                >
                  {inv.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <InvoiceRowActions invoiceId={inv.id} status={inv.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ListPagination totalItems={totalInvoices || 0} itemsPerPage={itemsPerPage} />
    </div>
  );
}
