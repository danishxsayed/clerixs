'use client';

import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export function LockScreen({ children }: { children: React.ReactNode }) {
  const { isExpired, subscription } = useSubscription();
  const pathname = usePathname();
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if the user had selected a plan before signup/onboarding
    import('js-cookie').then((Cookies) => {
      const planId = Cookies.default.get('selected_plan_id');
      if (planId) {
        console.log('[LockScreen] Found selected_plan_id:', planId);
        setSelectedPlanId(planId);
      }
    });

    if (isExpired) {
      console.log('[LockScreen] Subscription is expired or missing. subscription:', subscription?.status);
    }
  }, [isExpired, subscription]);

  // Allow access to settings/subscription so they can upgrade
  const isUpgrading = pathname?.startsWith('/settings/subscription');
  const isPricing = pathname?.startsWith('/pricing');
  const isSettings = pathname?.startsWith('/settings');

  if (isExpired && !isUpgrading && !isPricing && !isSettings) {
    const isNewUser = !subscription;
    const planName = selectedPlanId === '069b2ba6-f81d-4edd-9964-37288df60201' ? 'Basic' : 
                     selectedPlanId === '93caba67-1f28-4abf-8032-f735941b467b' ? 'Pro' : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center max-w-md text-center p-8 bg-card rounded-xl border shadow-lg">
          <Lock className="w-16 h-16 text-primary mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isNewUser ? 'Complete Your Setup' : 'Subscription Expired'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isNewUser 
              ? `Ready to start your journey with Clerixs? ${planName ? `Please complete the payment for your ${planName} plan to access your dashboard.` : 'Please select and subscribe to a plan to access your dashboard.'}`
              : 'Your trial or subscription has ended. Please subscribe to a plan to continue accessing Clerixs features.'
            }
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Link 
              href={selectedPlanId ? `/settings/subscription?planId=${selectedPlanId}` : "/settings/subscription"}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground h-11 px-8 rounded-md font-medium transition-colors hover:bg-primary/90"
            >
              {planName ? `Pay for ${planName} Plan` : 'View Plans & Upgrade'}
            </Link>
            {isNewUser && (
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Change Selected Plan
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
