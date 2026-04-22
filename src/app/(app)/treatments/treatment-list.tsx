import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { TreatmentRowActions } from './treatment-row-actions';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';
import { redirect } from 'next/navigation';

interface TreatmentListProps {
  query: string;
  statusFilter: string;
  dateFilter: string;
  page: number;
}

export async function TreatmentList({ query, statusFilter, dateFilter, page }: TreatmentListProps) {
  const supabase = await createClient();
  const itemsPerPage = 50;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  if (profile?.default_organization_id) {
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', profile.default_organization_id)
      .eq('profile_id', user.id)
      .single();

    if (membership?.role === 'receptionist') {
      redirect('/dashboard');
    }
  }

  let dbQuery = supabase
    .from('treatments')
    .select(`
      *,
      patients ( full_name )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (statusFilter !== 'All') {
    dbQuery = dbQuery.eq('status', statusFilter.toLowerCase().replace(' ', '_'));
  }
  
  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  if (dateFilter) {
    const { start, end } = getDateRangeBounds(dateFilter);
    if (start) dbQuery = dbQuery.gte('created_at', start.toISOString());
    if (end) dbQuery = dbQuery.lte('created_at', end.toISOString());
  }

  const { data: treatments, count: totalTreatments, error } = await dbQuery;

  if (error) {
    console.error("Error fetching treatments:", error);
    return <div className="text-destructive p-4">Error loading treatments. Please try again.</div>;
  }

  if (!treatments || treatments.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground flex-col gap-2 p-8 border border-dashed rounded-xl">
        <p>No treatment records found.</p>
        <p className="text-sm text-center">Try adjusting your source query or filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden whitespace-nowrap overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted bg-opacity-50 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Date Logged</th>
            <th className="px-6 py-3 font-medium">Patient</th>
            <th className="px-6 py-3 font-medium">Title/Procedure</th>
            <th className="px-6 py-3 font-medium">Diagnosis</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium text-right shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {treatments.map((t: any) => (
            <tr key={t.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4">{new Date(t.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4 font-medium">{t.patients?.full_name || 'Unknown Patient'}</td>
              <td className="px-6 py-4">{t.title}</td>
              <td className="px-6 py-4 truncate max-w-[200px]">{t.diagnosis || '-'}</td>
              <td className="px-6 py-4">
                <span 
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize 
                    ${t.status === 'planned' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' : ''}
                    ${t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : ''}
                    ${t.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : ''}
                    ${t.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' : ''}
                  `}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <TreatmentRowActions treatmentId={t.id} status={t.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ListPagination totalItems={totalTreatments || 0} itemsPerPage={itemsPerPage} />
    </div>
  );
}
