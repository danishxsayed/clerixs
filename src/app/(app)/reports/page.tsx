import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports & Analytics',
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportDateFilter } from './date-filter';
import { BasicReports } from './basic-reports';
import { AdvancedReports } from './advanced-reports';
import { getBasicReportMetrics, getAdvancedReportMetrics } from './actions';
import { FeatureLock } from '@/components/subscription/FeatureLock';

import { Suspense } from 'react';
import { ReportContent } from './report-content';
import { ReportSkeleton } from './skeleton';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const range = (resolvedSearchParams.range as string) || 'this-month';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your clinic's performance.</p>
        </div>
        <ReportDateFilter />
      </div>

      <Suspense key={range} fallback={<ReportSkeleton />}>
        <ReportContent range={range} />
      </Suspense>
    </div>
  );
}
