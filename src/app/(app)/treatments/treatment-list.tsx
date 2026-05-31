import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { TreatmentRowActions } from './treatment-row-actions';
import { ListPagination } from '@/components/ui/list-pagination';
import { getDateRangeBounds } from '@/lib/utils';
import { cookies } from 'next/headers';
import Link from 'next/link';

interface TreatmentListProps {
  query: string;
  statusFilter: string;
  dateFilter: string;
  doctorFilter: string;
  page: number;
}

export async function TreatmentList({ query, statusFilter, dateFilter, doctorFilter, page }: TreatmentListProps) {
  const supabase = await createClient();
  const itemsPerPage = 25;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) return null;

  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get('clerixs_selected_branch')?.value;

  // Search by patient name
  let patientIds: string[] = [];
  if (query) {
    const { data: matchedPatients } = await supabase
      .from('patients')
      .select('id')
      .eq('organization_id', orgId)
      .ilike('full_name', `%${query}%`);
    
    if (matchedPatients) {
      patientIds = matchedPatients.map(p => p.id);
    }
  }

  let dbQuery = supabase
    .from('treatments')
    .select(`
      *,
      patients ( id, full_name, patient_code ),
      doctor:organization_memberships!doctor_membership_id (
        profiles ( full_name )
      )
    `, { count: 'exact' })
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (selectedBranchId && selectedBranchId !== 'all') {
    dbQuery = dbQuery.eq('branch_id', selectedBranchId);
  }

  if (statusFilter !== 'All') {
    dbQuery = dbQuery.eq('status', statusFilter.toLowerCase().replace(' ', '_'));
  }

  if (doctorFilter !== 'All') {
    dbQuery = dbQuery.eq('doctor_membership_id', doctorFilter);
  }
  
  if (query) {
    if (patientIds.length > 0) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,patient_id.in.(${patientIds.join(',')})`);
    } else {
      dbQuery = dbQuery.ilike('title', `%${query}%`);
    }
  }

  if (dateFilter) {
    const { start, end } = getDateRangeBounds(dateFilter);
    if (start) dbQuery = dbQuery.gte('created_at', start.toISOString());
    if (end) dbQuery = dbQuery.lte('created_at', end.toISOString());
  }

  const { data: treatments, count: totalTreatments, error } = await dbQuery;

  if (error) {
    console.error("Error fetching treatments:", error);
    return <div className="text-destructive p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-center font-medium">Error loading treatments. Please try again.</div>;
  }

  if (!treatments || treatments.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground flex-col gap-2 p-8 border border-dashed rounded-xl bg-card">
        <p className="font-semibold text-lg">No treatment records found.</p>
        <p className="text-sm text-center">Try adjusting your query or filter selections.</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden whitespace-nowrap overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted bg-opacity-50 text-muted-foreground border-b">
            <tr>
              <th className="px-6 py-3.5 font-medium">Treatment & Diagnosis</th>
              <th className="px-6 py-3.5 font-medium">Patient</th>
              <th className="px-6 py-3.5 font-medium">Type & Sessions</th>
              <th className="px-6 py-3.5 font-medium">Assigned Doctor</th>
              <th className="px-6 py-3.5 font-medium">Cost Status</th>
              <th className="px-6 py-3.5 font-medium">Status & Updated</th>
              <th className="px-6 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {treatments.map((t: any) => {
              const patient = t.patients;
              const doctorProfile = t.doctor?.profiles;
              
              // Progress tracking
              const totalSessions = t.estimated_sessions || 1;
              const completedSessions = t.completed_sessions || 0;
              const progressPercentage = Math.min(100, Math.round((completedSessions / totalSessions) * 100));

              return (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                  
                  {/* Treatment & Diagnosis */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[240px] truncate">
                      <span className="font-semibold text-foreground truncate">{t.title}</span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5" title={t.diagnosis || 'No Diagnosis'}>
                        {t.diagnosis || 'No Diagnosis'}
                      </span>
                    </div>
                  </td>

                  {/* Patient (Clickable) */}
                  <td className="px-6 py-4">
                    <Link 
                      href={`/patients/${patient?.id}`} 
                      className="flex flex-col hover:underline text-primary group-hover:text-primary/90"
                    >
                      <span className="font-medium">{patient?.full_name || 'Unknown Patient'}</span>
                      <span className="text-xs text-muted-foreground font-mono mt-0.5">{patient?.patient_code}</span>
                    </Link>
                  </td>

                  {/* Type & Session Progress */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col min-w-[150px]">
                      <span className={`inline-flex self-start rounded-full px-2 py-0.5 text-xs font-semibold
                        ${t.treatment_type === 'multi' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-300' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200/50 dark:bg-slate-900 dark:text-slate-300'}
                      `}>
                        {t.treatment_type === 'multi' ? 'Multi-Session' : 'Single Session'}
                      </span>
                      {t.treatment_type === 'multi' && (
                        <div className="mt-2 w-full">
                          <div className="flex justify-between text-[11px] text-muted-foreground font-medium mb-1">
                            <span>{completedSessions} of {totalSessions} completed</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-muted dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                progressPercentage === 100 ? 'bg-emerald-500' : 'bg-primary'
                              }`} 
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Assigned Doctor */}
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="font-medium text-sm">
                      {doctorProfile?.full_name ? `Dr. ${doctorProfile.full_name}` : '-'}
                    </span>
                  </td>

                  {/* Cost Summary */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{formatCurrency(t.collected_amount || 0)}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        of {formatCurrency(t.estimated_cost || 0)} est.
                      </span>
                    </div>
                  </td>

                  {/* Status & Last Updated */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span 
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide
                          ${t.status === 'planned' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-300' : ''}
                          ${t.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-300' : ''}
                          ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300' : ''}
                          ${t.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-300' : ''}
                        `}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Updated {new Date(t.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    <TreatmentRowActions treatmentId={t.id} status={t.status} />
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ListPagination totalItems={totalTreatments || 0} itemsPerPage={itemsPerPage} />
    </div>
  );
}
