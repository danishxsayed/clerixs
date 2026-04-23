'use client';

import React, { createContext, useContext } from 'react';

export type FeatureKey = 
  | 'dashboard'
  | 'patients'
  | 'treatments'
  | 'prescriptions'
  | 'medicine_autocomplete'
  | 'billing'
  | 'lab_dashboard'
  | 'basic_reports'
  | 'price_catalog'
  | 'advanced_reports'
  | 'export_reports'
  | 'bulk_patient_import'
  | 'multi_doctor_scheduling'
  | 'patient_visit_summary'
  | 'lab_packages';

export interface SubscriptionFeatures {
  [key: string]: boolean;
}

export interface SubscriptionData {
  status: 'trialing' | 'active' | 'past_due' | 'paused' | 'cancelled' | 'expired';
  trial_ends_at: string | null;
  current_period_end: string | null;
  plan: {
    name: string;
    plan_code: string;
    max_staff: number;
    features: SubscriptionFeatures;
  };
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  hasFeature: (key: FeatureKey) => boolean;
  isExpired: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ 
  subscription, 
  orgCreatedAt,
  children 
}: { 
  subscription: SubscriptionData | null; 
  orgCreatedAt?: string;
  children: React.ReactNode 
}) {
  const hasFeature = (key: FeatureKey) => {
    // During trial, everything is accessible
    if (subscription?.status === 'trialing' || (!subscription && !isExpired)) return true;
    return !!subscription?.plan?.features?.[key];
  };

  const isTrialing = subscription?.status === 'trialing' || (!subscription && orgCreatedAt !== undefined);
  
  let trialDaysLeft = 0;
  let isExpired = (!subscription && !orgCreatedAt) || subscription?.status === 'expired' || subscription?.status === 'past_due';

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const now = new Date();

  // 1. Handle Virtual Trial (if no DB record exists)
  if (!subscription && orgCreatedAt) {
    const created = new Date(orgCreatedAt);
    const virtualTrialEnd = new Date(created);
    virtualTrialEnd.setDate(created.getDate() + 7); // 7-day auto trial
    
    const diff = virtualTrialEnd.getTime() - now.getTime();
    trialDaysLeft = Math.ceil(diff / (1000 * 3600 * 24));
    
    if (trialDaysLeft <= 0) {
      trialDaysLeft = 0;
      isExpired = true;
    } else {
      isExpired = false;
    }
  } 
  // 2. Handle DB Subscription Trial
  else if (subscription?.status === 'trialing' && subscription?.trial_ends_at) {
    const end = new Date(subscription.trial_ends_at);
    const diff = end.getTime() - now.getTime();
    trialDaysLeft = Math.ceil(diff / (1000 * 3600 * 24));
    if (trialDaysLeft < 0) {
      trialDaysLeft = 0;
      isExpired = true; // Trial has ended
    }
  }

  // Handle cancelled sub access grace period
  if (subscription?.status === 'cancelled' && subscription?.current_period_end) {
    if (new Date(subscription.current_period_end) < now) {
      isExpired = true;
    }
  }

  const displayExpired = isMounted ? isExpired : false;

  return (
    <SubscriptionContext.Provider value={{ subscription, hasFeature, isExpired: displayExpired, isTrialing, trialDaysLeft }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
