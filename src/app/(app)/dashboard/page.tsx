import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};
import { createClient } from '@/lib/supabase/server';
import { BranchBreakdown } from '@/components/dashboard/branch-breakdown';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SafeDashboardContent from './dashboard-content';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string, date?: string }>;
}) {
  const { filter = 'month', date = '' } = await searchParams;
  const supabase = await createClient();

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

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      redirect('/auth/login');
    }

    const cookieStore = await cookies();
    selectedBranchId = cookieStore.get('clerixs_selected_branch')?.value || 'all';

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, default_organization_id, specialty')
      .eq('id', userData.user.id)
      .single();

    orgId = profile?.default_organization_id || '';
    fullName = profile?.full_name 
      ? profile.full_name.trim().split(' ')[0] 
      : 'there';
    specialty = profile?.specialty || '';

    if (!orgId) {
      redirect('/onboarding');
    }

    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('profile_id', userData.user.id)
      .single();

    isOwner = membership?.role === 'org_owner';

    // Determine start date for filters
    const now = new Date();
    if (date) {
      startDate = new Date(date);
    } else if (filter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // 1. Fetch patients count
    let patientsQuery = supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true);
    if (selectedBranchId && selectedBranchId !== 'all') patientsQuery = patientsQuery.eq('branch_id', selectedBranchId);
    if (startDate) patientsQuery = patientsQuery.gte('created_at', startDate.toISOString());
    const { count: patientsCount } = await patientsQuery;
    totalPatients = patientsCount || 0;

    // 2. Fetch completed treatments count
    let treatmentsQuery = supabase
      .from('treatments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'completed');
    if (selectedBranchId && selectedBranchId !== 'all') treatmentsQuery = treatmentsQuery.eq('branch_id', selectedBranchId);
    if (startDate) treatmentsQuery = treatmentsQuery.gte('created_at', startDate.toISOString());
    const { count: treatmentsCount } = await treatmentsQuery;
    completedTreatments = treatmentsCount || 0;

    // 3. Cashflow metric
    let cashflowQuery = supabase
      .from('payments')
      .select('amount')
      .eq('organization_id', orgId);
    if (selectedBranchId && selectedBranchId !== 'all') cashflowQuery = cashflowQuery.eq('branch_id', selectedBranchId);
    if (startDate) cashflowQuery = cashflowQuery.gte('payment_date', startDate.toISOString().split('T')[0]);
    const { data: cashflowPayments } = await cashflowQuery;
    cashflow = cashflowPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // 4. Chart payments data (Last 6 months)
    const monthlyRevenueMap: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyRevenueMap[monthName] = 0;
    }
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
    let chartPaymentsQuery = supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('organization_id', orgId)
      .gte('payment_date', sixMonthsAgo.split('T')[0]);
    if (selectedBranchId && selectedBranchId !== 'all') chartPaymentsQuery = chartPaymentsQuery.eq('branch_id', selectedBranchId);
    const { data: chartPayments } = await chartPaymentsQuery;

    if (chartPayments) {
      chartPayments.forEach((payment) => {
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

    // 5. Fetch appointments count and list
    const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    let realTodaysAppointmentsQuery = supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('appointment_date', targetDate);
    if (selectedBranchId && selectedBranchId !== 'all') realTodaysAppointmentsQuery = realTodaysAppointmentsQuery.eq('branch_id', selectedBranchId);
    const { count: realTodaysAppointmentsCount } = await realTodaysAppointmentsQuery;
    realTodaysAppointments = realTodaysAppointmentsCount || 0;

    let realTodaysAppointmentsListQuery = supabase
      .from('appointments')
      .select('id, start_time, chief_complaint, status, patients(full_name)')
      .eq('organization_id', orgId)
      .eq('appointment_date', targetDate)
      .order('start_time', { ascending: true })
      .limit(5);
    if (selectedBranchId && selectedBranchId !== 'all') realTodaysAppointmentsListQuery = realTodaysAppointmentsListQuery.eq('branch_id', selectedBranchId);
    const { data: realTodaysAppointmentsListData } = await realTodaysAppointmentsListQuery;
    realTodaysAppointmentsList = realTodaysAppointmentsListData || [];

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
    >
      {orgId && (!selectedBranchId || selectedBranchId === 'all') && (
        <React.Suspense fallback={<div className="h-48 rounded-2xl border-none shadow-sm col-span-full mt-6 bg-muted animate-pulse" />}>
          <BranchBreakdown orgId={orgId} startDate={startDate} />
        </React.Suspense>
      )}
    </SafeDashboardContent>
  );
}
