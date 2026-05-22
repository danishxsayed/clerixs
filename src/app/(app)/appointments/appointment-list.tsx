import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { ClickableTableRow } from '@/components/ui/clickable-table-row';
import { AppointmentRowActions } from './appointment-row-actions';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';
import { cookies } from 'next/headers';

interface AppointmentListProps {
  view: string;
  query: string;
  statusFilter: string;
  dateFilter: string;
  doctorFilter: string;
  page: number;
  itemsPerPage: number;
  orgId: string;
}

export async function AppointmentList({
  view,
  query,
  statusFilter,
  dateFilter,
  doctorFilter,
  page,
  itemsPerPage,
  orgId,
}: AppointmentListProps) {
  const supabase = await createClient();

  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get('clerixs_selected_branch')?.value;

  let dbQuery = supabase
    .from('appointments')
    .select(`
      *, 
      patients!inner(full_name),
      organization_memberships!doctor_membership_id(
        profiles(full_name)
      )
    `, { count: 'estimated' }) // Optimized count
    .eq('organization_id', orgId)
    .order('appointment_date', { ascending: true })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (selectedBranchId && selectedBranchId !== 'all') {
    dbQuery = dbQuery.eq('branch_id', selectedBranchId);
  }

  if (statusFilter !== 'All') {
    dbQuery = dbQuery.eq('status', statusFilter.toLowerCase());
  }
  if (query) {
    dbQuery = dbQuery.ilike('patients.full_name', `%${query}%`);
  }
  
  if (doctorFilter) {
    dbQuery = dbQuery.eq('doctor_membership_id', doctorFilter);
  }

  if (dateFilter) {
    const { start, end } = getDateRangeBounds(dateFilter);
    if (start) dbQuery = dbQuery.gte('appointment_date', start.toISOString().split('T')[0]);
    if (end) dbQuery = dbQuery.lte('appointment_date', end.toISOString().split('T')[0]);
  }

  const { data: appointments, count: totalAppointments, error } = await dbQuery;

  if (error) {
    console.error("Error fetching appointments:", error);
  }

  if (view === 'calendar') {
    return <AppointmentCalendar appointments={appointments || []} />;
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="h-96 rounded-2xl border border-dashed flex items-center justify-center text-muted-foreground flex-col gap-2">
        <p>No appointments found.</p>
        <p className="text-sm">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden whitespace-nowrap overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted bg-opacity-50 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-medium">Date</th>
            <th className="px-6 py-3 font-medium">Time</th>
            <th className="px-6 py-3 font-medium">Patient</th>
            <th className="px-6 py-3 font-medium">Treatment</th>
            <th className="px-6 py-3 font-medium">Provider</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium text-right shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((app) => (
            <ClickableTableRow 
              key={app.id} 
              href={`/appointments/${app.id}`}
              className="hover:bg-muted/50 transition-colors"
            >
              <td className="px-6 py-4 font-medium">{app.appointment_date}</td>
              <td className="px-6 py-4">{app.start_time?.slice(0, 5)}</td>
              <td className="px-6 py-4 font-medium">{app.patients?.full_name}</td>
              <td className="px-6 py-4 text-muted-foreground">{app.treatment || 'Consultation'}</td>
              <td className="px-6 py-4">{app.organization_memberships?.profiles?.full_name ? `Dr. ${app.organization_memberships.profiles.full_name}` : 'Unassigned'}</td>
              <td className="px-6 py-4">
                <span 
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize 
                    ${app.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                    ${app.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${app.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}
                >
                  {app.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <AppointmentRowActions appointmentId={app.id} status={app.status} />
              </td>
            </ClickableTableRow>
          ))}
        </tbody>
      </table>
      <ListPagination totalItems={totalAppointments || 0} itemsPerPage={itemsPerPage} />
    </div>
  );
}
