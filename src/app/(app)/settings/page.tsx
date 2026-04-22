import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from './profile-form';
import { OrganizationForm } from './organization-form';
import { ChangePasswordForm } from './change-password-form';
import { PriceCatalogTab } from './price-catalog-tab';
import { getCatalogItems } from './price-catalog-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, FlaskConical, Tag } from 'lucide-react';

import { Suspense } from 'react';
import { SettingsContent } from './settings-content';
import { SettingsSkeleton } from './skeleton';

export default async function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
        <Button variant="outline" asChild className="rounded-full shadow-sm">
          <Link href="/settings/subscription">
            Manage Subscription
          </Link>
        </Button>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
