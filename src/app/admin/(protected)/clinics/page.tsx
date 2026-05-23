import * as React from 'react';
import { Landmark, Plus, Search } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

export default async function AdminClinicsPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: orgData } = await supabaseAdmin
    .from('organizations')
    .select(`
      id,
      name,
      slug,
      created_at,
      plan_code,
      subscription_status,
      profiles!organizations_owner_profile_id_fkey (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  const clinics = (orgData || []).map((org: any) => ({
    id: org.id,
    name: org.name,
    owner: org.profiles?.full_name || 'Unknown Owner',
    organizationCode: org.slug,
    created: new Date(org.created_at).toISOString().split('T')[0],
    tier: org.plan_code === 'enterprise' ? 'Enterprise' : org.plan_code === 'pro' ? 'Professional' : 'Basic',
    status: org.subscription_status === 'active' ? 'Active' : org.subscription_status === 'trialing' ? 'Trialing' : 'Inactive',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinics Registered</h2>
          <p className="text-slate-500 mt-1">Review and manage registered clinic organizations globally.</p>
        </div>
        <button className="h-10 px-4 inline-flex items-center justify-center text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/10 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Clinic Manual
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinic or doctor..."
            className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <span className="text-sm font-medium text-slate-500">Showing {clinics.length} registered clinics</span>
      </div>

      {/* Clinics Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100/60 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="py-5 px-8">Clinic Name</th>
                <th className="py-5 px-8">Owner / Doctor</th>
                <th className="py-5 px-8">Org Code</th>
                <th className="py-5 px-8">Created On</th>
                <th className="py-5 px-8">Plan Tier</th>
                <th className="py-5 px-8">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-semibold text-slate-700">
              {clinics.map((clinic: any) => (
                <tr key={clinic.id} className="hover:bg-slate-50/80 hover:shadow-[inset_4px_0_0_rgb(225,29,72)] transition-all duration-300 group">
                  <td className="py-5 px-8 flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors duration-300">
                      <Landmark className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors duration-300" />
                    </div>
                    <span className="text-slate-900 font-black tracking-tight">{clinic.name}</span>
                  </td>
                  <td className="py-5 px-8 text-slate-500 font-medium">{clinic.owner}</td>
                  <td className="py-5 px-8 font-mono text-xs font-bold text-slate-400 bg-slate-50/50 rounded-lg px-2 py-1 ml-6 w-fit">{clinic.organizationCode}</td>
                  <td className="py-5 px-8 text-slate-400 font-medium">{clinic.created}</td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      clinic.tier === 'Enterprise' ? 'bg-purple-50 text-purple-600 border-purple-200/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                      clinic.tier === 'Professional' ? 'bg-blue-50 text-blue-600 border-blue-200/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-50 text-slate-600 border-slate-200/50'
                    }`}>
                      {clinic.tier}
                    </span>
                  </td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      clinic.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                      clinic.status === 'Trialing' ? 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                      'bg-rose-50 text-rose-600 border-rose-200/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    }`}>
                      {clinic.status}
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
