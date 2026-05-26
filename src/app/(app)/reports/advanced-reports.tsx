'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { getPatientsExportData, getInvoicesExportData } from './actions';
import { toast } from 'sonner';
import { FeatureLock } from '@/components/subscription/FeatureLock';

// Dynamically load Recharts drawing components
const RevenueTrendChart = React.lazy(() => import('./components/LazyCharts').then(m => ({ default: m.RevenueTrendChart })));
const StaffRevenueChart = React.lazy(() => import('./components/LazyCharts').then(m => ({ default: m.StaffRevenueChart })));
const PatientRetentionChart = React.lazy(() => import('./components/LazyCharts').then(m => ({ default: m.PatientRetentionChart })));
const AppointmentStatusChart = React.lazy(() => import('./components/LazyCharts').then(m => ({ default: m.AppointmentStatusChart })));
const TopTreatmentsChart = React.lazy(() => import('./components/LazyCharts').then(m => ({ default: m.TopTreatmentsChart })));

// Skeletons
const ChartSkeleton = () => (
  <div className="w-full h-full flex flex-col justify-between p-4 space-y-4 animate-pulse select-none">
    <div className="flex justify-between items-end h-[220px] gap-2 pt-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-muted rounded w-full" style={{ height: `${20 + i * 15}%` }} />
      ))}
    </div>
    <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
  </div>
);

const PieChartSkeleton = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-6 animate-pulse select-none">
    <div className="h-36 w-36 rounded-full border-[16px] border-muted flex items-center justify-center">
      <div className="h-12 w-12 bg-muted rounded-full"></div>
    </div>
    <div className="flex gap-4">
      <div className="h-4 bg-muted rounded w-16"></div>
      <div className="h-4 bg-muted rounded w-16"></div>
    </div>
  </div>
);

interface AdvancedReportsProps {
  data: any;
  isLoading: boolean;
  dateFilter: string;
}

export function AdvancedReports({ data, isLoading, dateFilter }: AdvancedReportsProps) {
  const [isExportingPatients, setIsExportingPatients] = React.useState(false);
  const [isExportingInvoices, setIsExportingInvoices] = React.useState(false);

  const downloadCSV = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) {
      toast.error('No data to export for this period.');
      return;
    }
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map(r => Object.values(r).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPatients = async () => {
    setIsExportingPatients(true);
    const res = await getPatientsExportData(dateFilter);
    setIsExportingPatients(false);
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      downloadCSV(`patients_export_${new Date().toISOString().split('T')[0]}.csv`, res.data);
      toast.success('Patients exported successfully.');
    }
  };

  const handleExportInvoices = async () => {
    setIsExportingInvoices(true);
    const res = await getInvoicesExportData(dateFilter);
    setIsExportingInvoices(false);
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      // Flatten relational data for CSV export
      const flatData = res.data.map((inv: any) => ({
        invoice_number: inv.invoice_number,
        patient_name: inv.patients?.full_name || '',
        patient_code: inv.patients?.patient_code || '',
        doctor_name: inv.profiles?.full_name || '',
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        status: inv.status,
        total_amount: inv.total_amount,
        amount_paid: inv.amount_paid,
        discount_amount: inv.discount_amount
      }));
      downloadCSV(`invoices_export_${new Date().toISOString().split('T')[0]}.csv`, flatData);
      toast.success('Invoices exported successfully.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 mb-4">
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 w-48 bg-muted rounded"></div></CardHeader>
              <CardContent className="h-[300px] bg-muted/50 rounded-xl m-4"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6" id="advanced-reports-content">
      {/* Export Controls */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
        <FeatureLock featureKey="export_reports" className="flex gap-3">
          <Button variant="secondary" onClick={handleExportPatients} disabled={isExportingPatients}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {isExportingPatients ? 'Exporting...' : 'Export Patients (Excel)'}
          </Button>
          <Button variant="secondary" onClick={handleExportInvoices} disabled={isExportingInvoices}>
            <Download className="mr-2 h-4 w-4" />
            {isExportingInvoices ? 'Exporting...' : 'Export Invoices (Excel)'}
          </Button>
        </FeatureLock>
      </div>

      {/* 1. Monthly Revenue & Staff Revenue */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue generated over this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {data.monthlyRevenue?.length > 0 ? (
                <React.Suspense fallback={<ChartSkeleton />}>
                  <RevenueTrendChart monthlyRevenue={data.monthlyRevenue} />
                </React.Suspense>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">No revenue data.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Staff</CardTitle>
            <CardDescription>Performance breakdown by doctor/provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {data.staffRevenue?.length > 0 ? (
                <React.Suspense fallback={<ChartSkeleton />}>
                  <StaffRevenueChart staffRevenue={data.staffRevenue} />
                </React.Suspense>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">No staff revenue data.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Donuts: Retention & Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Retention</CardTitle>
            <CardDescription>New vs Returning patients this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {data.patientRetention?.[0]?.value > 0 || data.patientRetention?.[1]?.value > 0 ? (
                <React.Suspense fallback={<PieChartSkeleton />}>
                  <PatientRetentionChart patientRetention={data.patientRetention} />
                </React.Suspense>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">No patient data.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Breakdown of all appointment states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {data.appointmentStatus?.length > 0 ? (
                <React.Suspense fallback={<PieChartSkeleton />}>
                  <AppointmentStatusChart appointmentStatus={data.appointmentStatus} />
                </React.Suspense>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">No appointment data.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Top Treatments & Outstanding Payments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Treatments</CardTitle>
            <CardDescription>By total revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
              {data.topTreatmentsByRevenue?.length > 0 ? (
                <React.Suspense fallback={<ChartSkeleton />}>
                  <TopTreatmentsChart topTreatmentsByRevenue={data.topTreatmentsByRevenue} />
                </React.Suspense>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">No treatment data.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Outstanding Payments</CardTitle>
            <CardDescription>Unpaid and partially paid invoices</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                {data.outstandingPayments?.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-4 py-2 font-medium text-left">Patient</th>
                        <th className="px-4 py-2 font-medium text-right">Due</th>
                        <th className="px-4 py-2 font-medium text-right">Overdue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y relative">
                      {data.outstandingPayments.map((inv: any) => (
                        <tr key={inv.id} className="bg-background">
                          <td className="px-4 py-3">
                            <div className="font-medium">{inv.patient_name}</div>
                            <div className="text-xs text-muted-foreground">{inv.invoice_number}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">₹{inv.amount_due.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right">
                            {inv.days_overdue > 0 ? (
                              <span className="text-red-500 font-medium">{inv.days_overdue} days</span>
                            ) : (
                              <span className="text-muted-foreground">Not due</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No outstanding payments.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
