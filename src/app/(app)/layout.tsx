import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Toaster } from '@/components/ui/sonner';
import { WorkspacePoller } from '@/components/layout/workspace-poller';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signout } from '@/app/(auth)/actions';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { LockScreen } from '@/components/subscription/LockScreen';
import { Suspense } from 'react';
import { SidebarSkeleton } from '@/components/layout/sidebar-skeleton';
import { TopbarSkeleton } from '@/components/layout/topbar-skeleton';
import { createAdminClient } from '@/lib/supabase/admin';


async function SidebarDataFetcher({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('default_organization_id').eq('id', userId).single();
  if (!profile?.default_organization_id) return <SidebarSkeleton />;

  const [org, membership] = await Promise.all([
    supabase.from('organizations').select('name').eq('id', profile.default_organization_id).single(),
    supabase.from('organization_memberships').select('role').eq('organization_id', profile.default_organization_id).eq('profile_id', userId).single()
  ]);

  return <Sidebar clinicName={org.data?.name || "Clinic"} userRole={membership.data?.role || "Admin"} />;
}

async function TopbarDataFetcher({ userId, userEmail }: { userId: string, userEmail: string }) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, default_organization_id').eq('id', userId).single();
  
  let userRole = "Admin";
  if (profile?.default_organization_id) {
    const { data: membership } = await supabase.from('organization_memberships').select('role').eq('organization_id', profile.default_organization_id).eq('profile_id', userId).single();
    if (membership?.role) userRole = membership.role;
  }

  return <Topbar userFullName={profile?.full_name || "User"} userEmail={userEmail} userAvatar={profile?.avatar_url} userRole={userRole} />;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // 1. Critical Auth Path
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  // Handle new users/invites
  if (!profile?.default_organization_id) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Setting up your workspace...</h2>
            <p className="text-muted-foreground">Please wait a moment while we connect you to your clinic.</p>
         </div>
         <WorkspacePoller />
         <Toaster />
      </div>
    );
  }

  // 3. Defer Sub and Security Checks to a parallel blocker or use them to wrap children
  // This ensures the layout shell renders while these are pending
  const adminSupabase = createAdminClient();
  const [{ data: org }, { data: membership }, { data: subData }] = await Promise.all([
    supabase.from('organizations').select('onboarding_completed, created_at').eq('id', profile.default_organization_id).single(),
    supabase.from('organization_memberships').select('status').eq('organization_id', profile.default_organization_id).eq('profile_id', user.id).single(),
    adminSupabase.from('organization_subscriptions').select('status, trial_ends_at, current_period_end, plan:subscription_plans(name, plan_code, max_staff, features)').eq('organization_id', profile.default_organization_id).maybeSingle()
  ]);

  if (!membership || membership.status === 'disabled') {
     const status = membership && membership.status === 'disabled' ? "Account Disabled" : "Access Revoked";
     const desc = membership && membership.status === 'disabled' ? "Your access to this clinic has been temporarily disabled." : "You have been removed from the clinic organization.";
     
     return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4 max-w-sm px-6">
             <h2 className={`text-2xl font-bold ${membership?.status === 'disabled' ? 'text-orange-600' : 'text-red-600'}`}>{status}</h2>
             <p className="text-muted-foreground">{desc} If you believe this is a mistake, please contact your administrator.</p>
             <form action={signout}>
               <Button type="submit" variant="default" className="mt-2 w-full">Back to Login</Button>
             </form>
          </div>
        </div>
      );
  }

  if (org && org.onboarding_completed === false) {
    redirect('/onboarding');
  }

  let formattedSubData: any = null;
  if (subData) {
    formattedSubData = {
      ...subData,
      plan: Array.isArray(subData.plan) ? subData.plan[0] : subData.plan
    };
  }

  return (
    <SubscriptionProvider subscription={formattedSubData} orgCreatedAt={org?.created_at}>
      <LockScreen>
        <div className="flex flex-col h-screen print:h-auto bg-background overflow-hidden print:overflow-visible print:bg-white">
          <TrialBanner />
          <div className="flex flex-1 overflow-hidden">
            <div className="print:hidden h-full">
              <Suspense fallback={<SidebarSkeleton />}>
                <SidebarDataFetcher userId={user.id} />
              </Suspense>
            </div>
            <div className="flex-1 flex flex-col h-full print:h-auto relative overflow-hidden print:overflow-visible">
              <div className="print:hidden">
                <Suspense fallback={<TopbarSkeleton />}>
                  <TopbarDataFetcher userId={user.id} userEmail={user.email || ''} />
                </Suspense>
              </div>
              <main className="flex-1 overflow-auto print:overflow-visible bg-background/50 dark:bg-zinc-950/20 print:bg-white p-6 print:p-0">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </div>
      </LockScreen>
    </SubscriptionProvider>
  );
}
