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
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="py-4 px-6">Clinic Name</th>
              <th className="py-4 px-6">Owner / Doctor</th>
              <th className="py-4 px-6">Org Code</th>
              <th className="py-4 px-6">Created On</th>
              <th className="py-4 px-6">Plan Tier</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="hover:bg-slate-50/50 transition-all">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="h-8 w-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <Landmark className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-slate-900 font-bold">{clinic.name}</span>
                </td>
                <td className="py-4 px-6 text-slate-600">{clinic.owner}</td>
                <td className="py-4 px-6 font-mono text-xs">{clinic.organizationCode}</td>
                <td className="py-4 px-6 text-slate-500">{clinic.created}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    clinic.tier === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                    clinic.tier === 'Professional' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {clinic.tier}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    clinic.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
  );
}
