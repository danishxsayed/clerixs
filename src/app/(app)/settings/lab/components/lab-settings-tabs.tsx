'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestList } from './test-list';
import { CategoryList } from './category-list';
import { PackageList } from './package-list';
import { FeatureLock } from '@/components/subscription/FeatureLock';

interface LabSettingsTabsProps {
  categories: any[];
  tests: any[];
  packages: any[];
}

export function LabSettingsTabs({ categories, tests, packages }: LabSettingsTabsProps) {
  return (
    <Tabs defaultValue="tests" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="tests">Lab Tests</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="packages">Packages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tests">
        <TestList initialTests={tests} categories={categories} />
      </TabsContent>
        
      <TabsContent value="categories">
        <CategoryList initialCategories={categories} />
      </TabsContent>

      <TabsContent value="packages">
        <FeatureLock featureKey="lab_packages">
          <PackageList initialPackages={packages} tests={tests} />
        </FeatureLock>
      </TabsContent>
    </Tabs>
  );
}
