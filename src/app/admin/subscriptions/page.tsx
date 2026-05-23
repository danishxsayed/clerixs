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
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Clinic organization</th>
              <th className="py-4 px-6">Billing Plan</th>
              <th className="py-4 px-6">Price Point</th>
              <th className="py-4 px-6">Interval</th>
              <th className="py-4 px-6">Next Billing Date</th>
              <th className="py-4 px-6">Payment Gateway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                <td className="py-4 px-6 text-slate-900 font-bold">{sub.clinic}</td>
                <td className="py-4 px-6 text-slate-600 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  {sub.plan}
                </td>
                <td className="py-4 px-6 font-semibold text-slate-900">{sub.price}</td>
                <td className="py-4 px-6 text-slate-500">{sub.billingCycle}</td>
                <td className="py-4 px-6 text-slate-500">{sub.nextBilling}</td>
                <td className="py-4 px-6 text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  {sub.gateway}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
