'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BasicReports } from './basic-reports';
import { AdvancedReports } from './advanced-reports';
import { FeatureLock } from '@/components/subscription/FeatureLock';

interface ReportTabsProps {
  basicData: any;
  advancedData: any;
  range: string;
}

export function ReportTabs({ basicData, advancedData, range }: ReportTabsProps) {
  const [activeTab, setActiveTab] = React.useState('basic');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px] print:hidden">
        <TabsTrigger value="basic">Basic Reports</TabsTrigger>
        <TabsTrigger value="advanced">Advanced Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-6 print:mt-0">
        {activeTab === 'basic' && (
          <BasicReports data={basicData} isLoading={false} />
        )}
      </TabsContent>
      <TabsContent value="advanced" className="mt-6 print:mt-0">
        <FeatureLock featureKey="advanced_reports">
          {activeTab === 'advanced' && (
            <AdvancedReports data={advancedData} isLoading={false} dateFilter={range} />
          )}
        </FeatureLock>
      </TabsContent>
    </Tabs>
  );
}
