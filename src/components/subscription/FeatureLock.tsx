'use client';

import React from 'react';
import { useSubscription, FeatureKey } from '@/contexts/SubscriptionContext';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export function FeatureLock({
  featureKey,
  children,
  className = '',
}: {
  featureKey: FeatureKey;
  children: React.ReactNode;
  className?: string;
}) {
  const { hasFeature } = useSubscription();

  if (hasFeature(featureKey)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden rounded-md border border-muted ${className}`}>
      {/* Blur layer over the element so it looks disabled but still somewhat visible */}
      <div className="opacity-40 pointer-events-none select-none grayscale filter blur-[1px]">
        {children}
      </div>
      
      {/* Overlay with Lock */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[1px]">
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-foreground mb-1">Upgrade to Pro</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-[250px] text-center">
          This feature is available on the Pro plan.
        </p>
        <Link 
          href="/settings/subscription" 
          className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-blue-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
