import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { VerificationOverlay } from '../settings/subscription/VerificationOverlay';
import { WhatsAppClient } from '@/components/whatsapp/whatsapp-client';
import { Skeleton } from '@/components/ui/skeleton';

export default async function WhatsAppPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.default_organization_id) redirect('/dashboard');

  const orgId = profile.default_organization_id;

  // Fetch user role for specific tab permissions (Buy Credits)
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('profile_id', user.id)
    .single();

  const userRole = membership?.role || 'staff';

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <VerificationOverlay redirectPath="/whatsapp?tab=history" />
      </Suspense>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Management</h1>
        <p className="text-muted-foreground">Monitor credit usage, refill balance, and view message history.</p>
      </div>

      <Suspense fallback={<WhatsAppSkeleton />}>
        <WhatsAppClient 
          organizationId={orgId} 
          userRole={userRole} 
          userId={user.id} 
        />
      </Suspense>
    </div>
  );
}

function WhatsAppSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b pb-1">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
