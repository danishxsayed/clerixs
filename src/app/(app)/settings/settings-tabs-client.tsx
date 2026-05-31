'use client';

import * as React from 'react';
import { Tabs } from '@/components/ui/tabs';

export function SettingsTabsClient({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState('profile');

  React.useEffect(() => {
    const titles: Record<string, string> = {
      profile: 'My Profile | Settings | Clerixs',
      clinic: 'Clinic Settings | Settings | Clerixs',
      catalog: 'Price Catalog | Settings | Clerixs',
      templates: 'Prescription Templates | Settings | Clerixs',
    };
    if (titles[activeTab]) {
      document.title = titles[activeTab];
    }
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {children}
    </Tabs>
  );
}
