'use client';

import React from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Link from 'next/link';

export function TrialBanner() {
  const { isTrialing, trialDaysLeft } = useSubscription();

  if (!isTrialing) return null;

  const isExpiredTrial = trialDaysLeft <= 0;

  if (isExpiredTrial) {
    return (
      <div className="bg-red-600 px-4 py-2.5 text-sm flex items-center justify-center gap-3 text-white shrink-0">
        <span className="font-semibold">Your trial has expired. Please subscribe to continue.</span>
        <Link
          href="/pricing"
          className="bg-white text-red-700 font-bold text-xs px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
        >
          Subscribe Now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-400 px-4 py-2.5 text-sm flex items-center justify-center gap-3 text-amber-900 shrink-0">
      <span className="font-semibold">
        Your free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} — Upgrade Now
      </span>
      <Link
        href="/pricing"
        className="bg-amber-900 text-white font-bold text-xs px-3 py-1 rounded-full hover:bg-amber-800 transition-colors"
      >
        Upgrade Now
      </Link>
    </div>
  );
}
