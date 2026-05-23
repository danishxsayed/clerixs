import * as React from 'react';
import { CreditCard, Landmark, ShieldCheck } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

export default async function AdminSubscriptionsPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: subData } = await supabaseAdmin
    .from('organization_subscriptions')
    .select(`
      id,
      provider,
      current_period_end,
      organizations (
        name
      ),
      subscription_plans (
        name,
        monthly_price,
        yearly_price
      )
    `)
    .order('created_at', { ascending: false });

  const subscriptions = (subData || []).map((sub: any) => {
    const isYearly = sub.subscription_plans?.name?.toLowerCase().includes('annual');
    const price = isYearly ? sub.subscription_plans?.yearly_price : sub.subscription_plans?.monthly_price;
    const interval = isYearly ? 'Annual' : 'Monthly';
    
    return {
      id: sub.id,
      clinic: sub.organizations?.name || 'Unknown Clinic',
      plan: sub.subscription_plans?.name || 'Unknown Plan',
      price: price ? `₹${Number(price).toLocaleString('en-IN')}/${isYearly ? 'yr' : 'mo'}` : 'Custom',
      billingCycle: interval,
      nextBilling: sub.current_period_end ? new Date(sub.current_period_end).toISOString().split('T')[0] : 'N/A',
      gateway: sub.provider === 'cashfree' ? 'Cashfree' : sub.provider === 'razorpay' ? 'Razorpay' : 'Manual',
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Subscriptions</h2>
        <p className="text-slate-500 mt-1">Review active billing accounts, billing cycles, and gateway statuses.</p>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100/60 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="py-5 px-8">Clinic organization</th>
                <th className="py-5 px-8">Billing Plan</th>
                <th className="py-5 px-8">Price Point</th>
                <th className="py-5 px-8">Interval</th>
                <th className="py-5 px-8">Next Billing Date</th>
                <th className="py-5 px-8">Payment Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-semibold text-slate-700">
              {subscriptions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 hover:shadow-[inset_4px_0_0_rgb(16,185,129)] transition-all duration-300 group">
                  <td className="py-5 px-8 text-slate-900 font-black tracking-tight">{sub.clinic}</td>
                  <td className="py-5 px-8 text-slate-600 flex items-center gap-3">
                    <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100/50">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                    </div>
                    {sub.plan}
                  </td>
                  <td className="py-5 px-8 font-black text-slate-900">{sub.price}</td>
                  <td className="py-5 px-8">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-slate-50 text-slate-500 border border-slate-200/50">
                      {sub.billingCycle}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-slate-400 font-medium">{sub.nextBilling}</td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      sub.gateway === 'Cashfree' ? 'bg-blue-50 text-blue-600 border-blue-200/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                      'bg-slate-50 text-slate-600 border-slate-200/50'
                    }`}>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {sub.gateway}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
