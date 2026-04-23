'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PaymentVerifierProps {
  orderId: string;
  redirectPath?: string;
  successMessage?: string;
}

export function PaymentVerifier({ 
  orderId, 
  redirectPath = '/settings/subscription',
  successMessage = 'Payment successful! Your account has been updated.'
}: PaymentVerifierProps) {
  const router = useRouter();
  const [verifying, setVerifying] = React.useState(true);
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    // Guard against double-invocation in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    async function verify() {
      try {
        const res = await fetch(`/api/cashfree/verify-payment?order_id=${orderId}&t=${Date.now()}`);
        const data = await res.json();

        if (data.success) {
          toast.success(successMessage, {
            duration: 5000,
          });
        } else {
          toast.error('Payment verification failed. Please contact support.', {
            duration: 8000,
          });
        }
      } catch {
        toast.error('Payment verification failed. Please contact support.', {
          duration: 8000,
        });
      } finally {
        setVerifying(false);
        // Force Next.js to re-fetch Server Component data (Sidebar balance, etc)
        router.refresh();
        // Remove order_id from URL
        router.replace(redirectPath);
      }
    }

    verify();
  }, [orderId, router, redirectPath, successMessage]);

  if (!verifying) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-blue-800 dark:text-blue-200">
      <Loader2 className="h-5 w-5 animate-spin shrink-0" />
      <span className="text-sm font-medium">Verifying your payment, please wait…</span>
    </div>
  );
}
