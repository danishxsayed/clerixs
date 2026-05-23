import * as React from 'react';
import { Landmark, Users, CreditCard, ShieldAlert } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

export default async function AdminDashboardPage() {
  // Initialize admin client with service role to bypass RLS for global metrics
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { count: totalClinics },
    { count: totalSubscribers },
    { count: totalUsers },
    { count: totalAlerts }
  ] = await Promise.all([
    supabaseAdmin.from('organizations').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('organization_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscription_events').select('*', { count: 'exact', head: true }).eq('status', 'failed')
  ]);

  const stats = [
    { name: 'Total Clinics Registered', value: totalClinics?.toString() || '0', icon: Landmark, change: 'Lifetime total', color: 'blue' },
    { name: 'Total Active Subscribers', value: totalSubscribers?.toString() || '0', icon: CreditCard, change: 'Active or trailing', color: 'emerald' },
    { name: 'Total Users/Staff', value: totalUsers?.toString() || '0', icon: Users, change: 'Registered profiles', color: 'indigo' },
    { name: 'System Logs/Alerts', value: `${totalAlerts || 0} Warnings`, icon: ShieldAlert, change: totalAlerts === 0 ? 'All systems operational' : 'Requires attention', color: 'green' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-slate-500 mt-1">Here is a quick snapshot of the Clerixs network health and metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{stat.name}</span>
              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">{stat.value}</span>
              <p className="text-xs font-semibold text-slate-400 mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Panel Welcome */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-8 text-white shadow-lg shadow-red-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-bold mb-2">Welcome Back, Clerixs Administrator!</h3>
          <p className="text-red-100 leading-relaxed font-medium">
            You are logged into the central control panel. From here you can audit clinic organizations, adjust subscriptions, manage enterprise tier accounts, and verify overall database health.
          </p>
        </div>
      </div>
    </div>
  );
}
