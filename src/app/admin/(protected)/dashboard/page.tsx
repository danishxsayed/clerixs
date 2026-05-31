import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Overview | Admin',
};
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
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-slate-500 mt-2 font-medium">Here is a quick snapshot of the Clerixs network health and metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="relative group bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-44 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="text-sm font-bold text-slate-500">{stat.name}</span>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${
                stat.color === 'blue' ? 'bg-blue-50/50 text-blue-600' :
                stat.color === 'emerald' ? 'bg-emerald-50/50 text-emerald-600' :
                stat.color === 'indigo' ? 'bg-indigo-50/50 text-indigo-600' :
                'bg-red-50/50 text-red-600'
              }`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</span>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Panel Welcome */}
      <div className="rounded-3xl p-10 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
        {/* Dynamic mesh gradient background */}
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[150%] bg-gradient-to-br from-red-600 to-rose-900 rounded-full mix-blend-screen filter blur-[80px] opacity-80 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-tl from-indigo-600 to-purple-900 rounded-full mix-blend-screen filter blur-[80px] opacity-60 group-hover:scale-110 transition-transform duration-1000" />
        
        {/* Abstract shapes */}
        <div className="absolute right-10 top-10 w-32 h-32 border border-white/10 rounded-full opacity-20" />
        <div className="absolute right-20 top-20 w-16 h-16 border border-white/20 rounded-full opacity-30" />

        <div className="relative z-10 max-w-2xl">
          <h3 className="text-3xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-rose-200">Welcome Back, System Administrator!</h3>
          <p className="text-slate-300/90 leading-relaxed font-medium text-lg">
            You have full elevated access to the central control panel. Audit clinic organizations, adjust subscriptions, manage enterprise tier accounts, and monitor database health in real-time.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6">
        <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/clinics/new" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 group">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Manually Add Subscription</span>
          </a>
          <a href="/admin/clinics?filter=trialing" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 group">
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">View All Trialing Clinics</span>
          </a>
          <a href="/admin/clinics?filter=expiring" className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 group">
            <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">View Expiring Soon</span>
          </a>
          <button className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 group text-left cursor-pointer">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Send Bulk Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
