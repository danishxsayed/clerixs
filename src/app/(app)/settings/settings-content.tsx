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
import { FlaskConical, Tag, FileText } from 'lucide-react';
import { TemplatesTab } from './templates-tab';

export async function SettingsContent() {
  const supabase = await createClient();

  // 1. Fetch current User Profile
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (!profile || !profile.default_organization_id) return null;

  // 2. Fetch Organization Details
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.default_organization_id)
    .single();

  // 3. Determine if current user is an admin/owner of this organization
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', profile.default_organization_id)
    .eq('profile_id', userData.user.id)
    .single();

  const isOwner = membership?.role === 'org_owner';

  // 4. Fetch Price Catalog Items (Already parallelized inside getCatalogItems usually, but good here)
  const { items: catalogItems } = await getCatalogItems();

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-4 overflow-x-auto flex-nowrap justify-start max-w-full bg-muted/50 p-1 border">
        <TabsTrigger value="profile">My Profile</TabsTrigger>
        <TabsTrigger value="clinic">Clinic Settings</TabsTrigger>
        <TabsTrigger value="catalog">Price Catalog</TabsTrigger>
        <TabsTrigger value="lab">Lab Catalog</TabsTrigger>
        <TabsTrigger value="templates">Rx Templates</TabsTrigger>
      </TabsList>
      
      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-xl">Personal Information</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Update your personal details and how others see you on Clerixs.
            </p>
          </div>
          <ProfileForm profile={profile} />
        </div>
        <ChangePasswordForm />
      </TabsContent>

      {/* Clinic/Organization Tab */}
      <TabsContent value="clinic">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-xl">Clinic Preferences</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your master clinic details, localization, and currency.
            </p>
          </div>
          
          {isOwner ? (
            <OrganizationForm organization={organization} profileId={profile.id} />
          ) : (
            <div className="rounded-md bg-muted/50 border p-6 text-center">
              <p className="text-muted-foreground">
                You do not have permission to edit Clinic Settings. Only Organization Owners can access this area.
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Price Catalog Tab */}
      <TabsContent value="catalog">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-xl flex items-center gap-2"><Tag className="h-5 w-5"/> Price Catalog</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your clinic's treatments, services, medicines, and their standard pricing.
            </p>
          </div>
          <PriceCatalogTab initialItems={catalogItems} isOwner={isOwner} />
        </div>
      </TabsContent>
      
      {/* Lab Settings Tab */}
      <TabsContent value="lab">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-xl flex items-center gap-2"><FlaskConical className="h-5 w-5"/> Lab Catalog Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure lab tests, test parameters, reference intervals, and custom lab packages.
            </p>
          </div>
          
          {isOwner ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Managing the lab catalog involves defining categories, tests, expected parameters, and packages.</p>
              <Link href="/settings/lab">
                <Button>
                  Manage Lab Catalog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md bg-muted/50 border p-6 text-center">
              <p className="text-muted-foreground">
                You do not have permission to manage the Lab Catalog. Only Organization Owners can access this area.
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Prescription Templates Tab */}
      <TabsContent value="templates" className="space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <TemplatesTab />
        </div>
      </TabsContent>
    </Tabs>
  );
}
