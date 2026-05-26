import * as React from 'react';
import { ReportTabs } from './report-tabs';
import { getBasicReportMetrics, getAdvancedReportMetrics } from './actions';

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
    <ReportTabs 
      basicData={basicRes.data || null} 
      advancedData={advancedRes.data || null} 
      range={range} 
    />
  );
}
