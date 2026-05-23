import * as React from 'react';
import Link from 'next/link';
import { Landmark, Plus, Search, ArrowRight, Settings, CalendarPlus, ShieldAlert, BadgeCheck } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

export default async function AdminClinicsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const resolvedParams = await (searchParams || Promise.resolve({ filter: 'all' }));
  const currentFilter = resolvedParams.filter || 'all';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabaseAdmin
    .from('organizations')
    .select(`
      id,
      name,
      slug,
      created_at,
      plan_code,
      subscription_status,
      is_enterprise,
      profiles!organizations_owner_profile_id_fkey (
        full_name
      ),
      organization_subscriptions (
        current_period_end,
        trial_ends_at
      )
    `)
    .order('created_at', { ascending: false });

  if (currentFilter === 'trialing') {
    query = query.eq('subscription_status', 'trialing');
  }

  const { data: orgData } = await query;

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

  const calculateDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const allClinics = (orgData || []).map((org: any) => {
    const sub = org.organization_subscriptions?.[0] || {};
    const relevantEnd = org.subscription_status === 'trialing' ? sub.trial_ends_at : sub.current_period_end;
    const daysRemaining = calculateDaysRemaining(relevantEnd);
    
    return {
      id: org.id,
      name: org.name,
      owner: org.profiles?.full_name || 'Unknown Owner',
      organizationCode: org.slug,
      created: new Date(org.created_at).toISOString().split('T')[0],
      tier: org.plan_code,
      status: org.subscription_status,
      isEnterprise: org.is_enterprise,
      endDate: relevantEnd ? new Date(relevantEnd).toLocaleDateString() : 'N/A',
      daysRemaining: daysRemaining,
    };
  });

  // Apply "expiring" filter in memory since it's a calculated date difference
  const clinics = currentFilter === 'expiring' 
    ? allClinics.filter(c => c.daysRemaining !== null && c.daysRemaining >= 0 && c.daysRemaining <= 7)
    : allClinics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinics Registered</h2>
          <p className="text-slate-500 mt-2 font-medium">Review and manage registered clinic organizations globally.</p>
        </div>
        <Link href="/admin/clinics/new" className="h-10 px-4 inline-flex items-center justify-center text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-600/20 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Clinic Manual
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex gap-4 items-center flex-1">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clinic or doctor..."
              className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <a href="/admin/clinics" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</a>
            <a href="/admin/clinics?filter=trialing" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter === 'trialing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Trialing</a>
            <a href="/admin/clinics?filter=expiring" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter === 'expiring' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Expiring Soon</a>
          </div>
        </div>
        <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">Showing {clinics.length} registered clinics</span>
      </div>

      {/* Clinics Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100/60 text-slate-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                <th className="py-5 px-6">Clinic Name</th>
                <th className="py-5 px-6">Owner / Code</th>
                <th className="py-5 px-6">Plan / Status</th>
                <th className="py-5 px-6">Access Expires</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-semibold text-slate-700">
              {clinics.map((clinic: any) => (
                <tr key={clinic.id} className="hover:bg-slate-50/80 hover:shadow-[inset_4px_0_0_rgb(225,29,72)] transition-all duration-300 group">
                  <td className="py-5 px-6 flex items-center gap-4 min-w-[250px]">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors duration-300 shrink-0">
                      <Landmark className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors duration-300" />
                    </div>
                    <div>
                      <Link href={`/admin/clinics/${clinic.id}`} className="text-slate-900 font-black tracking-tight hover:text-red-600 hover:underline flex items-center gap-2 group/link">
                        {clinic.name}
                        {clinic.isEnterprise && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-amber-100 text-amber-700 border border-amber-200/50">ENT</span>}
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-red-500" />
                      </Link>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Created {clinic.created}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="block text-slate-900 font-bold">{clinic.owner}</span>
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">{clinic.organizationCode}</span>
                  </td>
                  <td className="py-5 px-6 space-y-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      clinic.tier === 'enterprise' ? 'bg-purple-50 text-purple-600 border-purple-200/50' :
                      clinic.tier === 'pro' ? 'bg-blue-50 text-blue-600 border-blue-200/50' : 'bg-slate-50 text-slate-600 border-slate-200/50'
                    }`}>
                      {clinic.tier}
                    </span>
                    <br />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${getStatusColor(clinic.status)}`}>
                      {clinic.status}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="block text-slate-900 font-bold">{clinic.endDate}</span>
                    {clinic.daysRemaining !== null && clinic.daysRemaining >= 0 && clinic.daysRemaining <= 7 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        <ShieldAlert className="h-3 w-3" /> {clinic.daysRemaining} Days Left
                      </span>
                    )}
                    {clinic.daysRemaining !== null && clinic.daysRemaining > 7 && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">
                        {clinic.daysRemaining} Days
                      </span>
                    )}
                    {clinic.daysRemaining !== null && clinic.daysRemaining < 0 && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                        Past Due
                      </span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/clinics/${clinic.id}`} title="Upgrade Plan" className="h-8 w-8 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center transition-colors border border-purple-200/50">
                        <BadgeCheck className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/clinics/${clinic.id}`} title="Extend Trial" className="h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition-colors border border-blue-200/50">
                        <CalendarPlus className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/clinics/${clinic.id}`} title="Settings" className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Settings className="h-3.5 w-3.5" /> Manage
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {clinics.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No clinics match your current filters.
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
