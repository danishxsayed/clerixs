import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BasicReports } from './basic-reports';
import { AdvancedReports } from './advanced-reports';
import { getBasicReportMetrics, getAdvancedReportMetrics } from './actions';
import { FeatureLock } from '@/components/subscription/FeatureLock';

interface ReportContentProps {
  range: string;
}

export async function ReportContent({ range }: ReportContentProps) {
  // We can fetch them in parallel efficiently
  const [basicRes, advancedRes] = await Promise.all([
    getBasicReportMetrics(range),
    getAdvancedReportMetrics(range)
  ]);

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px] print:hidden">
        <TabsTrigger value="basic">Basic Reports</TabsTrigger>
        <TabsTrigger value="advanced">Advanced Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-6 print:mt-0">
        <BasicReports data={basicRes.data || null} isLoading={false} />
      </TabsContent>
      <TabsContent value="advanced" className="mt-6 print:mt-0">
        <FeatureLock featureKey="advanced_reports">
          <AdvancedReports data={advancedRes.data || null} isLoading={false} dateFilter={range} />
        </FeatureLock>
      </TabsContent>
    </Tabs>
  );
}
