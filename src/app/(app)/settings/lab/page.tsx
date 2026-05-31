import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lab Catalog | Settings',
};
import { getLabCatalog } from '@/app/(app)/lab/actions';
import { notFound } from 'next/navigation';
import { LabSettingsTabs } from './components/lab-settings-tabs';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function LabCatalogSettingsPage() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  // Get Membership Role
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (membership?.role !== 'org_owner') {
    return (
      <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-md border max-w-2xl mx-auto mt-12">
        You do not have permission to manage the lab catalog. Only organization owners can access this setting.
      </div>
    );
  }

  // Fetch data
  const { success, categories, tests, packages, error } = await getLabCatalog();

  if (!success) {
    return (
      <div className="p-6 text-red-500">
        Error loading lab catalog: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/settings?tab=lab" className="p-2 rounded-md hover:bg-muted transition-colors border shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lab Catalog Management</h2>
          <p className="text-muted-foreground mt-1">Configure lab tests, test parameters, reference intervals, and custom lab packages.</p>
        </div>
      </div>

      <LabSettingsTabs categories={categories || []} tests={tests || []} packages={packages || []} />
    </div>
  );
}
