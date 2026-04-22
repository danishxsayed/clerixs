'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, X, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
// @ts-ignore
import { load } from '@cashfreepayments/cashfree-js';

interface PricingClientProps {
  plans: any[];
  user: any;
}

export function PricingClient({ plans, user }: PricingClientProps) {
  const router = useRouter();
  const [interval, setInterval] = React.useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlanId, setLoadingPlanId] = React.useState<string | null>(null);

  const handleGetStarted = async (planId: string) => {
    if (!user) {
      // Save selected plan to cookie and redirect to signup
      import('js-cookie').then((Cookies) => {
        Cookies.default.set('selected_plan_id', planId, { expires: 1 }); // 1 day expiry
      });
      router.push('/signup');
      return;
    }

    if (planId === 'free_trial') {
      // Authed users already have their trial or don't need checkout to access the dashboard
      router.push('/');
      return;
    }

    // Proceed to Cashfree checkout
    try {
      setLoadingPlanId(planId);
      
      const response = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, interval }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      const { paymentSessionId } = data;
      
      // Load Cashfree SDK and redirect
      const cashfree = await load({ mode: 'sandbox' }); 
      
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_top', 
        // will redirect back to the return_url provided to backend
      });

    } catch (err: any) {
      toast.error(err.message || 'Error initializing checkout');
      setLoadingPlanId(null);
    }
  };

  if (!plans || plans.length === 0) {
     return <div className="text-center p-12 text-muted-foreground">No plans configured yet.</div>;
  }

  // Predefine features to show neatly
  const formatFeatures = (plan: any) => {
    return [
      { name: `Up to ${plan.max_staff} Staff Members`, included: true },
       { name: 'Patient Management', included: true },
       { name: 'Appointments & Calendar', included: true },
       { name: 'Basic Reporting', included: true },
       { name: 'Advanced Dynamic Reports', included: plan.features?.advanced_reports === true },
       { name: 'Lab Catalog & Packages', included: plan.features?.lab_packages === true },
       { name: 'Data Export (Excel/PDF)', included: plan.features?.export_reports === true },
       { name: 'Bulk Patient Import', included: plan.features?.bulk_patient_import === true },
       { name: 'Patient Visit Summary PDF', included: plan.features?.patient_visit_summary === true },
       { name: 'Multi-Doctor View Filter', included: plan.features?.multi_doctor_scheduling === true },
    ];
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="space-y-16 max-w-6xl mx-auto pb-12">
      {/* Interval Toggle */}
      <div className="flex justify-center">
        <div className="relative flex p-1.5 bg-slate-200/60 rounded-full dark:bg-slate-800 shadow-inner">
          <button
            onClick={() => setInterval('monthly')}
            className={`relative w-40 rounded-full py-2.5 text-sm font-semibold transition-all ${
              interval === 'monthly'
                ? 'bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`relative w-40 rounded-full py-2.5 text-sm font-semibold transition-all ${
              interval === 'yearly'
                ? 'bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-3 -right-3 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 shadow-sm border border-emerald-200">
              Save ~15%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <motion.div 
        className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 items-stretch justify-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[{
           id: 'free_trial',
           name: 'Free Trial',
           monthly_price: 0,
           yearly_price: 0,
           max_staff: 1,
           features: {} 
        }, ...plans].map((plan, index) => {
          const isPro = plan.name.toLowerCase() === 'pro';
          const isFree = plan.id === 'free_trial';
          const price = interval === 'monthly' ? plan.monthly_price : plan.yearly_price;
          const features = formatFeatures(plan);
          const formattedPrice = isFree ? '₹0' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

          return (
            <motion.div key={plan.id} variants={fadeInUp} className="h-full">
              <Card 
                className={`relative h-full flex flex-col pt-8 transition-all duration-300 hover:-translate-y-2 ${
                  isPro 
                    ? 'border-none shadow-[0_20px_50px_-12px_rgba(37,99,235,0.4)] scale-105 z-10 bg-gradient-to-b from-blue-900 via-slate-900 to-black text-white' 
                    : 'border border-slate-200 bg-white/70 backdrop-blur-xl hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50'
                }`}
              >
                {isPro && (
                  <>
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg border border-blue-400/30 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  </>
                )}

                <CardHeader className="text-center pb-8 relative z-10">
                  <CardTitle className={`text-2xl font-bold ${isPro ? 'text-white' : 'text-slate-900'}`}>{plan.name}</CardTitle>
                  <CardDescription className={`text-sm mt-3 font-medium ${isPro ? 'text-blue-100/70' : 'text-slate-500'}`}>
                    {isFree ? 'Test out Clerixs entirely risk-free.' : isPro ? 'Everything you need to scale your clinic.' : 'Essential tools for growing your practice.'}
                  </CardDescription>
                  <div className="mt-8 flex justify-center items-baseline gap-1.5">
                    <span className={`text-5xl font-extrabold tracking-tight ${isPro ? 'text-white' : 'text-slate-900'}`}>{formattedPrice}</span>
                    <span className={`font-semibold ${isPro ? 'text-blue-200/50' : 'text-slate-400'}`}>/{isFree ? '7 days' : interval === 'yearly' ? 'year' : 'mo'}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 relative z-10 px-8">
                  <div className={`h-px w-full mb-8 ${isPro ? 'bg-white/10' : 'bg-slate-100'}`} />
                  <ul className="space-y-4 text-sm text-left">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${isPro ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${isPro ? 'text-white/10' : 'text-slate-200'}`}>
                            <X className="h-4 w-4" strokeWidth={3} />
                          </div>
                        )}
                        <span className={`leading-tight ${feature.included ? (isPro ? 'text-blue-50 font-medium' : 'text-slate-700 font-semibold') : (isPro ? 'text-white/40' : 'text-slate-400')}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-8 pb-8 px-8 relative z-10 mt-auto">
                  <Button 
                    className={`w-full h-14 text-base font-bold transition-all ${
                      isPro 
                        ? 'bg-white text-blue-600 hover:bg-slate-50 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.03]' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.03]'
                    }`}
                    variant="default"
                    size="lg"
                    onClick={() => handleGetStarted(plan.id)}
                    disabled={!!loadingPlanId}
                  >
                    {loadingPlanId === plan.id ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting...</>
                    ) : (
                      isFree ? (user ? 'Go to Dashboard' : 'Start Free Trial') : (user ? `Upgrade to ${plan.name}` : 'Get Started Now')
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
