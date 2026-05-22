import * as React from 'react';
import { CreditCard, Landmark, ShieldCheck } from 'lucide-react';

export default async function AdminSubscriptionsPage() {
  const subscriptions = [
    { id: '1', clinic: 'Apex Dental Care', plan: 'Professional Monthly', price: '₹4,999/mo', billingCycle: 'Monthly', nextBilling: '2026-06-10', gateway: 'Cashfree' },
    { id: '2', clinic: 'CarePlus Multispeciality', plan: 'Enterprise Annual', price: '₹49,999/yr', billingCycle: 'Annual', nextBilling: '2027-05-12', gateway: 'Cashfree' },
    { id: '3', clinic: 'SecureMed Dental Group', plan: 'Basic Monthly', price: '₹2,499/mo', billingCycle: 'Monthly', nextBilling: '2026-06-15', gateway: 'Cashfree' },
  ];

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
