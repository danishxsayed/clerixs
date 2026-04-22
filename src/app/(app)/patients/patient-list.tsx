import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { PatientRowActions } from './patient-row-actions';
import { ClickableTableRow } from '@/components/ui/clickable-table-row';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';

interface PatientListProps {
  query: string;
  statusFilter: string;
  dateFilter: string;
  page: number;
}

export async function PatientList({ query, statusFilter, dateFilter, page }: PatientListProps) {
  const supabase = await createClient();
  const itemsPerPage = 50;

  let dbQuery = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`);
  }

  if (statusFilter) {
    dbQuery = dbQuery.eq('is_active', statusFilter === 'active');
  }

  if (dateFilter) {
    const { start, end } = getDateRangeBounds(dateFilter);
    if (start) dbQuery = dbQuery.gte('created_at', start.toISOString());
    if (end) dbQuery = dbQuery.lte('created_at', end.toISOString());
  }

  const { data: patients, count: totalPatients, error } = await dbQuery;

  if (error) {
    console.error('Error fetching patients:', error);
    return <div className="text-destructive p-4">Error loading patients. Please try again.</div>;
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="h-96 rounded-2xl border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-2">
        {query ? (
          <>
            <p>No patients found matching &quot;{query}&quot;.</p>
            <p className="text-sm">Try adjusting your search term.</p>
          </>
        ) : (
          <>
            <p>No patients found.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted bg-opacity-50 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Code</th>
            <th className="px-6 py-3 font-medium">Phone</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium text-right shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {patients.map((patient) => (
            <ClickableTableRow 
              key={patient.id} 
              href={`/patients/${patient.id}`}
              className="hover:bg-muted/50 transition-colors"
            >
              <td className="px-6 py-4 font-medium">{patient.full_name}</td>
              <td className="px-6 py-4 text-muted-foreground">{patient.patient_code}</td>
              <td className="px-6 py-4">{patient.phone || '-'}</td>
              <td className="px-6 py-4">{patient.email || '-'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {patient.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <PatientRowActions patientId={patient.id} />
              </td>
            </ClickableTableRow>
          ))}
        </tbody>
      </table>
      <ListPagination totalItems={totalPatients || 0} itemsPerPage={itemsPerPage} />
    </div>
  );
}
