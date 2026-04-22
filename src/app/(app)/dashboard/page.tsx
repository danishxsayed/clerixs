import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Stethoscope, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { Greeting } from '@/components/dashboard/greeting';
import Link from 'next/link';
import { ListFilter } from '@/components/ui/list-filter';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string, date?: string }>;
}) {
  const { filter = 'month', date = '' } = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, default_organization_id')
    .eq('id', userData.user?.id)
    .single();

  const orgId = profile?.default_organization_id;
  const fullName = profile?.full_name 
    ? profile.full_name.split(' ')[0] 
    : 'there';

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('profile_id', userData.user?.id)
    .single();

  const isOwner = membership?.role === 'org_owner';
    
  // Determine start date for filters
  let startDate: Date | null = null;
  const now = new Date();
  if (date) {
    startDate = new Date(date);
    // When date is selected, we only show aggregates for that date
  } else if (filter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  }
  
  // 1. Fetch basic aggregates from Supabase for this org
  let patientsQuery = supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_active', true);
  if (startDate) patientsQuery = patientsQuery.gte('created_at', startDate.toISOString());
  const { count: totalPatients } = await patientsQuery;

  let treatmentsQuery = supabase
    .from('treatments')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'completed');
  if (startDate) treatmentsQuery = treatmentsQuery.gte('created_at', startDate.toISOString());
  const { count: completedTreatments } = await treatmentsQuery;

  // CASHFLOW METRIC (Using the payments table)
  let cashflowQuery = supabase
    .from('payments')
    .select('amount')
    .eq('organization_id', orgId);
  if (startDate) cashflowQuery = cashflowQuery.gte('payment_date', startDate.toISOString().split('T')[0]);
  const { data: cashflowPayments } = await cashflowQuery;
  const cashflow = cashflowPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  
  // Prepare data for the Revenue Chart (STATIC: Last 6 Months)
  const monthlyRevenueMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenueMap[monthName] = 0;
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
  const { data: chartPayments } = await supabase
    .from('payments')
    .select('amount, payment_date')
    .eq('organization_id', orgId)
    .gte('payment_date', sixMonthsAgo.split('T')[0]);

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

  const chartData = Object.keys(monthlyRevenueMap).map(month => ({
      month,
      revenue: monthlyRevenueMap[month]
  }));

  // 2. Fetch Appointments for the Target Date
  const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const { count: todaysAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('appointment_date', targetDate);

  const { data: todaysAppointmentsList } = await supabase
    .from('appointments')
    .select('id, start_time, chief_complaint, status, patients(full_name)')
    .eq('organization_id', orgId)
    .eq('appointment_date', targetDate)
    .order('start_time', { ascending: true })
    .limit(5);

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
        <div>
          <Greeting name={fullName} />
          <p className="text-muted-foreground/90 font-medium mt-1">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
           <ListFilter groups={filterGroups} showDatePicker />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isOwner && (
          <Card className="rounded-2xl border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cashflow</CardTitle>
              <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <IndianRupee className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{cashflow.toLocaleString('en-IN')}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center font-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +0.00%
              </p>
            </CardContent>
          </Card>
        )}
        <Card className="rounded-2xl border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{date ? 'Selected Date' : "Today's"} Appointments</CardTitle>
            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold">{todaysAppointments || 0}</div>
             <p className="text-xs text-muted-foreground mt-1">
               Scheduled for {date ? 'this date' : 'today'}
             </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <div className="h-8 w-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total registered
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Treatments</CardTitle>
            <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTreatments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed overall
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {isOwner && (
          <Card className="col-span-4 rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle>Cashflow Overview</CardTitle>
              <CardDescription>
                Last 6 Months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <RevenueChart data={chartData} />
            </CardContent>
          </Card>
        )}

        <Card className={`rounded-2xl border-none shadow-sm ${isOwner ? 'col-span-3' : 'col-span-7'}`}>
          <CardHeader>
            <CardTitle>{date ? 'Appointments' : "Today's Appointments"}</CardTitle>
            <CardDescription>Scheduled for {date ? 'the selected date' : 'today'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {todaysAppointmentsList && todaysAppointmentsList.length > 0 ? (
                todaysAppointmentsList.map((appointment) => {
                  const patientName = (appointment.patients as any)?.full_name || 'Unknown Patient';
                  const initials = patientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  
                  return (
                    <Link
                      href={`/appointments/${appointment.id}`}
                      key={appointment.id}
                      className="flex items-center hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                        {initials}
                      </div>
                      <div className="ml-4 space-y-1 w-full flex justify-between">
                        <div>
                          <p className="text-sm font-medium leading-none">{patientName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {appointment.chief_complaint || 'Consultation'} • {appointment.start_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                           <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize bg-gray-100 text-gray-800">
                             {appointment.status}
                           </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-8">No appointments scheduled for today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
