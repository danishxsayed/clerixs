'use client';

import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Stethoscope, ArrowUpRight } from 'lucide-react';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { Greeting } from '@/components/dashboard/greeting';
import { ListFilter } from '@/components/ui/list-filter';

function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center bg-card rounded-2xl border border-red-100 shadow-sm mt-8 space-y-4">
      <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">⚠️</div>
      <h2 className="text-xl font-bold text-red-600">Something went wrong loading the dashboard</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{error?.message || 'Unexpected rendering exception detected.'}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/95 transition-all shadow-sm"
      >
        Try again
      </button>
    </div>
  );
}

interface DashboardContentProps {
  fullName?: string;
  specialty?: string;
  currentDate?: string;
  showDemoData?: boolean;
  displayCashflow?: number;
  displayTodaysAppointments?: number;
  displayTotalPatients?: number;
  displayCompletedTreatments?: number;
  chartData?: any[];
  displayAppointmentsList?: any[];
  filterGroups?: any[];
  isOwner?: boolean;
  selectedBranchId?: string;
  orgId?: string;
  date?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function DashboardContent({
  fullName = 'there',
  specialty = '',
  currentDate = '',
  showDemoData = false,
  displayCashflow = 0,
  displayTodaysAppointments = 0,
  displayTotalPatients = 0,
  displayCompletedTreatments = 0,
  chartData = [],
  displayAppointmentsList = [],
  filterGroups = [],
  isOwner = false,
  selectedBranchId = 'all',
  orgId = '',
  date = '',
  isLoading = false,
  children
}: DashboardContentProps) {
  
  const mockRecentActivity = [
    { time: '10 mins ago', action: 'New patient registered', description: 'Vikram Singh added to system' },
    { time: '25 mins ago', action: 'Payment received', description: '₹1,500 from Rahul Mehta' },
    { time: '1 hour ago', action: 'Prescription sent', description: 'WhatsApp sent to Priya Shah' },
    { time: '2 hours ago', action: 'Report uploaded', description: 'Lab report for Amir Khan' },
  ];

  // Visual loading skeletons for dashboard content
  if (isLoading || !orgId) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded-lg" />
          </div>
          <div className="h-10 w-28 bg-muted rounded-lg" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border-none shadow-sm h-32 bg-muted/30" />
          ))}
        </div>

        <div className="h-48 bg-muted/30 rounded-2xl border-none shadow-sm col-span-full mt-6" />

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 rounded-2xl border-none shadow-sm h-[380px] bg-muted/30" />
          <Card className="col-span-3 rounded-2xl border-none shadow-sm h-[380px] bg-muted/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {showDemoData && (
        <div className="absolute top-[-10px] right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 z-50">
          Demo Data
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
        <div>
          <Greeting name={fullName} />
          {specialty && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                {specialty} · Clerixs Pro
              </span>
            </div>
          )}
          <p className="text-muted-foreground/90 font-medium mt-1">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
           <React.Suspense fallback={<div className="h-10 w-24 bg-muted animate-pulse rounded-md" />}>
             <ListFilter groups={filterGroups} showDatePicker />
           </React.Suspense>
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
              <div className="text-3xl font-bold">₹{displayCashflow.toLocaleString('en-IN')}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center font-medium">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {showDemoData ? '+12%' : '+0.00%'}
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
             <div className="text-3xl font-bold">{displayTodaysAppointments}</div>
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
            <div className="text-3xl font-bold">{displayTotalPatients}</div>
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
            <div className="text-3xl font-bold">{displayCompletedTreatments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed overall
            </p>
          </CardContent>
        </Card>
      </div>

      {children}

      <div className="grid gap-6 md:grid-cols-7">
        {isOwner && (
          <Card className="col-span-4 rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle>Cashflow Overview</CardTitle>
              <CardDescription>Last 6 Months</CardDescription>
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
              {displayAppointmentsList && displayAppointmentsList.length > 0 ? (
                displayAppointmentsList.map((appointment: any) => {
                  if (!appointment) return null;
                  const patientName = (appointment.patients as any)?.full_name || 'Unknown Patient';
                  const initials = patientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="ml-4 space-y-1 w-full flex justify-between min-w-0">
                        <div className="truncate pr-2">
                          <p className="text-sm font-medium leading-none truncate">{patientName}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {appointment.chief_complaint || 'Consultation'} • {appointment.start_time?.slice(0, 5)}
                          </p>
                        </div>
                        <div className="text-right flex flex-col justify-center shrink-0">
                           <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                             appointment.status === 'in-waiting' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                           }`}>
                             {appointment.status || 'scheduled'}
                           </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-8">No appointments scheduled for today.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showDemoData && (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live updates from your clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-start">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SafeDashboardContent(props: DashboardContentProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DashboardContent {...props} />
    </ErrorBoundary>
  );
}
