import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscriptions | Admin',
};
import { CreditCard, Landmark, ShieldCheck, Banknote, Activity, Clock, ShieldAlert, BadgeX } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const resolvedParams = await (searchParams || Promise.resolve({ filter: 'all' }));
  const currentFilter = resolvedParams.filter || 'all';

  const supabaseAdmin = createAdminClient();

  // Fetch all subscriptions without filtering by status initially
  let query = supabaseAdmin
    .from('organization_subscriptions')
    .select(`
      id,
      provider,
      status,
      current_period_start,
      current_period_end,
      trial_ends_at,
      organizations (
        name,
        id
      ),
      subscription_plans:subscription_plans!organization_subscriptions_plan_id_fkey (
        name,
        monthly_price,
        yearly_price
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filter tab
  if (currentFilter !== 'all') {
    query = query.eq('status', currentFilter);
  }

  const { data: subData } = await query;

  // Analytics queries
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: totalActive },
    { data: monthInvoices },
    { data: allInvoices }
  ] = await Promise.all([
    supabaseAdmin.from('organization_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
    supabaseAdmin.from('subscription_invoices').select('amount_paid').gte('payment_date', startOfMonth.toISOString()),
    supabaseAdmin.from('subscription_invoices').select('amount_paid')
  ]);

  const monthRevenue = (monthInvoices || []).reduce((acc: number, curr: any) => acc + Number(curr.amount_paid), 0);
  const totalRevenue = (allInvoices || []).reduce((acc: number, curr: any) => acc + Number(curr.amount_paid), 0);

  // Breakdown counts
  let basicCount = 0;
  let proCount = 0;
  let entCount = 0;
  
  const subscriptions = (subData || []).map((sub: any) => {
    const isYearly = sub.subscription_plans?.name?.toLowerCase().includes('annual');
    const price = isYearly ? sub.subscription_plans?.yearly_price : sub.subscription_plans?.monthly_price;
    const interval = isYearly ? 'Annual' : 'Monthly';
    const planName = sub.subscription_plans?.name || 'Unknown Plan';

    // Analytics breakdown
    if (sub.status === 'active' || sub.status === 'trialing') {
      if (planName.toLowerCase().includes('basic')) basicCount++;
      else if (planName.toLowerCase().includes('pro')) proCount++;
      else if (planName.toLowerCase().includes('enterprise')) entCount++;
    }
    
    const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;
    const trialEndsAt = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;
    
    let expirationDate = null;
    if (currentPeriodEnd && trialEndsAt) {
      expirationDate = currentPeriodEnd > trialEndsAt ? currentPeriodEnd : trialEndsAt;
    } else {
      expirationDate = currentPeriodEnd || trialEndsAt;
    }
    
    return {
      id: sub.id,
      clinic: sub.organizations?.name || 'Unknown Clinic',
      ownerEmail: 'Fetching...', // We would need auth.users join for exact email, left placeholder for UI
      plan: planName,
      price: price ? `₹${Number(price).toLocaleString('en-IN')}/${isYearly ? 'yr' : 'mo'}` : 'Custom',
      billingCycle: interval,
      status: sub.status,
      startDate: sub.current_period_start ? new Date(sub.current_period_start).toLocaleDateString() : 'N/A',
      endDate: expirationDate ? expirationDate.toLocaleDateString() : 'N/A',
      nextBilling: expirationDate ? expirationDate.toISOString().split('T')[0] : 'N/A',
      gateway: sub.provider === 'cashfree' ? 'Cashfree' : sub.provider === 'razorpay' ? 'Razorpay' : 'Manual',
    };
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'trialing': return 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'expired': return 'bg-red-50 text-red-600 border-red-200/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'suspended': return 'bg-rose-900 text-rose-100 border-rose-950/50 shadow-[0_0_10px_rgba(159,18,57,0.4)]';
      case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-200/50';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revenue & Subscriptions</h2>
        <p className="text-slate-500 mt-2 font-medium">Review active billing accounts, billing cycles, and comprehensive revenue analytics.</p>
      </div>

      {/* Revenue Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Subscribers</span>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-black text-slate-900">{totalActive || 0}</span>
            <div className="flex gap-2 mt-2 text-xs font-bold text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">{basicCount} Basic</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">{proCount} Pro</span>
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">{entCount} Ent</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue This Month</span>
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-black text-slate-900">₹{monthRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (All Time)</span>
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-2xl w-fit">
        {['all', 'active', 'trialing', 'expired', 'suspended', 'cancelled'].map((tab) => (
          <a key={tab} href={`/admin/subscriptions?filter=${tab}`} className={`px-4 py-2 text-sm font-bold capitalize rounded-xl transition-all ${
            currentFilter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}>
            {tab}
          </a>
        ))}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100/60 text-slate-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                <th className="py-5 px-8">Clinic / Organization</th>
                <th className="py-5 px-8">Plan Details</th>
                <th className="py-5 px-8">Pricing</th>
                <th className="py-5 px-8">Status</th>
                <th className="py-5 px-8">Start / End Dates</th>
                <th className="py-5 px-8">Next Billing Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-semibold text-slate-700">
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 hover:shadow-[inset_4px_0_0_rgb(16,185,129)] transition-all duration-300 group">
                  <td className="py-5 px-8">
                    <span className="text-slate-900 font-black tracking-tight block">{sub.clinic}</span>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                        sub.status === 'active' ? 'bg-emerald-50 border-emerald-100/50' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <CreditCard className={`h-4 w-4 ${sub.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap font-bold text-slate-800">{sub.plan}</span>
                        {sub.status === 'active' && (
                          <span className="inline-flex items-center w-fit mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                            Active Plan
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8 whitespace-nowrap">
                    <span className="font-black text-slate-900 block">{sub.price}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{sub.billingCycle}</span>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                      {sub.status === 'active' && (
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest pl-1">
                          {sub.plan} Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-8 whitespace-nowrap">
                    <span className="block text-slate-900 font-bold">{sub.startDate}</span>
                    <span className="block text-slate-400 text-[10px] uppercase font-bold">to {sub.endDate}</span>
                  </td>
                  <td className="py-5 px-8">
                    <span className="text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {sub.nextBilling}
                    </span>
                  </td>
                </tr>
              ))}
              
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    No subscriptions found for filter "{currentFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
