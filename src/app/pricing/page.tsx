import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { createClient } from '@/lib/supabase/server';
import { PricingClient } from './pricing-client';

export const metadata = {
  title: 'Pricing - Clerixs',
  description: 'Simple, transparent pricing for modern clinic management.',
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch plans from the database
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('monthly_price', { ascending: true });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 relative overflow-hidden light">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-sky-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none" />

      <Navbar />
      
      <main className="flex-1 py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-sm font-medium mb-4">
              <span>Transparent Pricing</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900">
              Plans that grow with your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                clinic's success.
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mt-4 font-medium">
              Choose the perfect plan for your practice size. Start with a 7-day free trial on any tier, no credit card required.
            </p>
          </div>
          
          <PricingClient plans={plans || []} user={user} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
