import * as React from 'react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
};
import { createClient, getSessionUser, getSessionProfile, getSessionMembership } from '@/lib/supabase/server';
import { BranchBreakdown } from '@/components/dashboard/branch-breakdown';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SafeDashboardContent from './dashboard-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, AlertCircle, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

// Locally defined Active Treatments Widget for premium presentation
function ActiveTreatmentsWidget({ metrics }: { metrics: { inProgress: number; dueToday: number; needsAttention: number } }) {
  return (
    <Card className="col-span-full border shadow-sm rounded-2xl bg-gradient-to-r from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-lg">Active Treatments Module</CardTitle>
            <CardDescription>Real-time clinical session progress summaries</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: In Progress */}
          <Link href="/treatments?status=In Progress" className="block">
            <div className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all flex items-center justify-between cursor-pointer group">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</span>
                <p className="text-3xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform">{metrics.inProgress}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </Link>

          {/* Card 2: Due Today */}
          <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions Due Today</span>
              <p className="text-3xl font-extrabold text-emerald-600">{metrics.dueToday}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Needs Attention */}
          <Link href="/treatments?status=In Progress" className="block">
            <div className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all flex items-center justify-between cursor-pointer group">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Needs Attention</span>
                <p className={`text-3xl font-extrabold transition-transform group-hover:scale-105 ${metrics.needsAttention > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                  {metrics.needsAttention}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${metrics.needsAttention > 0 ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </Link>

        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string, date?: string }>;
}) {
  const { filter = 'month', date = '' } = await searchParams;

  let orgId = '';
  let fullName = 'there';
  let isOwner = false;
  let selectedBranchId = 'all';
  let specialty = '';

  let totalPatients = 0;
  let completedTreatments = 0;
  let cashflow = 0;
  let realTodaysAppointments = 0;
  let realTodaysAppointmentsList: any[] = [];
  let chartData: any[] = [];
  let startDate: Date | null = null;

  // Active treatment metrics
  let inProgressCount = 0;
  let dueTodayCount = 0;
  let needsAttentionCount = 0;

  try {
    // Cached helpers — deduplicated with layout, zero extra DB round-trips for auth/profile/membership
    const [user, profile] = await Promise.all([getSessionUser(), getSessionProfile()]);
    if (!user) redirect('/auth/login');

    const cookieStore = await cookies();
    selectedBranchId = cookieStore.get('clerixs_selected_branch')?.value || 'all';

    orgId = profile?.default_organization_id || '';
    fullName = profile?.full_name
      ? profile.full_name.trim().split(' ')[0]
      : 'there';
    specialty = (profile as any)?.specialty || '';

    if (!orgId) redirect('/onboarding');

    const membership = await getSessionMembership(orgId);
    isOwner = membership?.role === 'org_owner';

    // Create supabase client once for all the business queries below
    const supabase = await createClient();

    // Determine start date for filters
    const now = new Date();
    if (date) {
      startDate = new Date(date);
    } else if (filter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

    // 1. Fetch patients count query setup
    let patientsQuery = supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true);
    if (selectedBranchId && selectedBranchId !== 'all') patientsQuery = patientsQuery.eq('branch_id', selectedBranchId);
    if (date) {
      patientsQuery = patientsQuery.gte('created_at', `${date}T00:00:00.000Z`).lte('created_at', `${date}T23:59:59.999Z`);
    } else if (startDate) {
      patientsQuery = patientsQuery.gte('created_at', startDate.toISOString());
    }

    // 2. Fetch completed treatments count query setup
    let treatmentsQuery = supabase
      .from('treatments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'completed');
    if (selectedBranchId && selectedBranchId !== 'all') treatmentsQuery = treatmentsQuery.eq('branch_id', selectedBranchId);
    if (date) {
      treatmentsQuery = treatmentsQuery.gte('created_at', `${date}T00:00:00.000Z`).lte('created_at', `${date}T23:59:59.999Z`);
    } else if (startDate) {
      treatmentsQuery = treatmentsQuery.gte('created_at', startDate.toISOString());
    }

    // 3. Cashflow metric query setup
    let cashflowQuery = supabase
      .from('payments')
      .select('amount')
      .eq('organization_id', orgId);
    if (selectedBranchId && selectedBranchId !== 'all') cashflowQuery = cashflowQuery.eq('branch_id', selectedBranchId);
    if (date) {
      cashflowQuery = cashflowQuery.eq('payment_date', date);
    } else if (startDate) {
      cashflowQuery = cashflowQuery.gte('payment_date', startDate.toISOString().split('T')[0]);
    }

    // 4. Chart payments query setup
    let chartPaymentsQuery = supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('organization_id', orgId)
      .gte('payment_date', sixMonthsAgo.split('T')[0]);
    if (selectedBranchId && selectedBranchId !== 'all') chartPaymentsQuery = chartPaymentsQuery.eq('branch_id', selectedBranchId);

    // 5. Fetch appointments count and list query setup
    let realTodaysAppointmentsQuery = supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('appointment_date', targetDate);
    if (selectedBranchId && selectedBranchId !== 'all') realTodaysAppointmentsQuery = realTodaysAppointmentsQuery.eq('branch_id', selectedBranchId);

    let realTodaysAppointmentsListQuery = supabase
      .from('appointments')
      .select('id, start_time, chief_complaint, status, patients(full_name)')
      .eq('organization_id', orgId)
      .eq('appointment_date', targetDate)
      .order('start_time', { ascending: true })
      .limit(5);
    if (selectedBranchId && selectedBranchId !== 'all') realTodaysAppointmentsListQuery = realTodaysAppointmentsListQuery.eq('branch_id', selectedBranchId);

    // 6. Fetch Active Treatments Metrics query setup
    const activeCountQuery = supabase
      .from('treatments')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'in_progress');

    const dueCountQuery = supabase
      .from('treatment_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'scheduled')
      .eq('session_date', todayStr);

    const idleCountQuery = supabase
      .from('treatments')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'in_progress')
      .lt('updated_at', sevenDaysAgo);

    // Execute all queries concurrently to dramatically improve performance
    const [
      patientsRes,
      treatmentsRes,
      cashflowRes,
      chartPaymentsRes,
      appointmentsCountRes,
      appointmentsListRes,
      activeCountRes,
      dueCountRes,
      idleCountRes
    ] = await Promise.all([
      patientsQuery,
      treatmentsQuery,
      cashflowQuery,
      chartPaymentsQuery,
      realTodaysAppointmentsQuery,
      realTodaysAppointmentsListQuery,
      activeCountQuery,
      dueCountQuery,
      idleCountQuery
    ]);

    // Assign query results
    totalPatients = patientsRes.count || 0;
    completedTreatments = treatmentsRes.count || 0;
    cashflow = cashflowRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    realTodaysAppointments = appointmentsCountRes.count || 0;
    realTodaysAppointmentsList = appointmentsListRes.data || [];
    inProgressCount = activeCountRes.count || 0;
    dueTodayCount = dueCountRes.count || 0;
    needsAttentionCount = idleCountRes.count || 0;

    // Process monthly revenue map
    const monthlyRevenueMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyRevenueMap[monthName] = 0;
    }

    if (chartPaymentsRes.data) {
      chartPaymentsRes.data.forEach((payment) => {
          if (payment.payment_date) {
               const d = new Date(payment.payment_date);
               const monthName = d.toLocaleDateString('en-US', { month: 'short' });
               if (monthlyRevenueMap[monthName] !== undefined) {
                   monthlyRevenueMap[monthName] += (Number(payment.amount) || 0);
               }
          }
      });
    }
    chartData = Object.keys(monthlyRevenueMap).map(month => ({
        month,
        revenue: monthlyRevenueMap[month]
    }));

  } catch (error) {
    console.error('Error fetching dashboard data, applying safe defaults:', error);
  }

  const filterGroups = [
    {
      id: 'filter',
      label: 'Period',
      options: [
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'all', label: 'All Time' },
      ]
    }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <SafeDashboardContent
      fullName={fullName}
      specialty={specialty}
      currentDate={currentDate}
      showDemoData={false}
      displayCashflow={cashflow}
      displayTodaysAppointments={realTodaysAppointments}
      displayTotalPatients={totalPatients}
      displayCompletedTreatments={completedTreatments}
      chartData={chartData}
      displayAppointmentsList={realTodaysAppointmentsList}
      filterGroups={filterGroups}
      isOwner={isOwner}
      selectedBranchId={selectedBranchId}
      orgId={orgId}
      date={date}
      isLoading={!orgId}
      activeFilter={filter}
    >
      {orgId && (
        <div className="mt-6 col-span-full">
          <ActiveTreatmentsWidget metrics={{ inProgress: inProgressCount, dueToday: dueTodayCount, needsAttention: needsAttentionCount }} />
        </div>
      )}
      {orgId && (!selectedBranchId || selectedBranchId === 'all') && (
        <React.Suspense fallback={<div className="h-48 rounded-2xl border-none shadow-sm col-span-full mt-6 bg-muted animate-pulse" />}>
          <BranchBreakdown orgId={orgId} startDate={startDate} />
        </React.Suspense>
      )}
    </SafeDashboardContent>
  );
}
