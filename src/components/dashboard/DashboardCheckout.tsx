'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// @ts-ignore
import { load } from '@cashfreepayments/cashfree-js';
import { Loader2, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function DashboardCheckout() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [planDetails, setPlanDetails] = React.useState<{id: string, name: string, price: number, interval: string} | null>(null);

  React.useEffect(() => {
    const checkPendingPlan = async () => {
      const stored = localStorage.getItem('pending_plan');
      if (!stored) return;

      try {
        const { planId, interval, timestamp } = JSON.parse(stored);
        
        // Only trigger if it's recent (last 2 hours) to avoid annoying users with old picks
        const twoHours = 2 * 60 * 60 * 1000;
        if (Date.now() - timestamp > twoHours) {
          localStorage.removeItem('pending_plan');
          return;
        }

        const supabase = createClient();
        const { data: plan, error } = await supabase
           .from('subscription_plans')
           .select('name, monthly_price, yearly_price')
           .eq('id', planId)
           .maybeSingle();

        if (error || !plan) {
           console.error('[DashboardCheckout] Error fetching plan details:', error);
           localStorage.removeItem('pending_plan');
           return;
        }

        setPlanDetails({
           id: planId,
           name: plan.name,
           interval: interval || 'monthly',
           price: interval === 'yearly' ? plan.yearly_price : plan.monthly_price
        });
        setOpen(true);
      } catch (err: any) {
        console.error('[DashboardCheckout] Error:', err);
        localStorage.removeItem('pending_plan');
      }
    };

    // Small delay to ensure everything is settled on the dashboard
    const timer = setTimeout(checkPendingPlan, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
     if (!planDetails) return;
     try {
       setLoading(true);
       const response = await fetch('/api/cashfree/create-order', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ planId: planDetails.id, interval: planDetails.interval }),
       });

       const data = await response.json();
       if (!response.ok) throw new Error(data.error || 'Failed to create payment session');

       const { paymentSessionId } = data;
       
       // Clear storage now that we're committing to checkout
       localStorage.removeItem('pending_plan');
       
       const cashfree = await load({ mode: 'sandbox' }); 
       await cashfree.checkout({
         paymentSessionId,
         redirectTarget: '_top',
       });
     } catch (err: any) {
       console.error('[DashboardCheckout] Subscription flow error:', err);
       toast.error(err.message || "Failed to initialize payment gateway.");
       setLoading(false);
     }
  };

  const handleStartTrial = () => {
    localStorage.removeItem('pending_plan');
    setOpen(false);
    toast.success('Awesome! Your 7-day free trial has started.');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
         className="sm:max-w-[425px] [&>button]:hidden" 
         onInteractOutside={(e) => e.preventDefault()} 
         onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
            <CreditCard className="w-7 h-7" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Complete Your Subscription</DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            You selected the <strong>{planDetails?.name}</strong> plan during signup. Would you like to check out now, or try it risk-free first?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
           {planDetails && (
               <Button 
                 onClick={handleSubscribe} 
                 disabled={loading} 
                 size="lg" 
                 className="w-full font-bold h-14 text-base shadow-md transition-transform hover:scale-[1.02]"
               >
                 {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                 {loading ? "Redirecting to checkout..." : `Subscribe to ${planDetails.name} — ₹${planDetails.price}/${planDetails.interval === 'yearly' ? 'yr' : 'mo'}`}
               </Button>
           )}

           <button 
             onClick={handleStartTrial}
             disabled={loading}
             className="text-sm font-semibold text-muted-foreground hover:text-slate-900 dark:hover:text-white underline-offset-4 hover:underline transition-colors py-2"
           >
             Start my 7-day free trial instead
           </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
