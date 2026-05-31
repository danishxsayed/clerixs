import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, CreditCard, User, Building, Activity, CalendarDays, Key, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { activateSubscriptionAction, extendTrialAction, suspendAccountAction, reactivateAccountAction, saveEnterpriseSettingsAction } from './actions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: orgData } = await supabaseAdmin
    .from('organizations')
    .select('name')
    .eq('id', id)
    .single();

  return {
    title: orgData ? `${orgData.name} | Admin` : 'Clinic Details | Admin',
  };
}

export default async function ClinicManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: orgData } = await supabaseAdmin
    .from('organizations')
    .select(`
      *,
      profiles!organizations_owner_profile_id_fkey (
        full_name,
        email:id
      )
    `)
    .eq('id', id)
    .single();

  if (!orgData) {
    return <div>Clinic not found.</div>;
  }

  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(orgData.owner_profile_id);
  const ownerEmail = authData?.user?.email || 'No email attached';

  const { data: subData } = await supabaseAdmin
    .from('organization_subscriptions')
    .select('*, subscription_plans(name, monthly_price)')
    .eq('organization_id', id)
    .single();

  const { data: plans } = await supabaseAdmin.from('subscription_plans').select('*');
  const { data: branches } = await supabaseAdmin
    .from('branches')
    .select('id, name, has_login, login_email, login_status')
    .eq('organization_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clinics" className="h-10 w-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{orgData.name} {orgData.is_enterprise && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black tracking-widest uppercase bg-amber-100 text-amber-700 border border-amber-200/50 shadow-sm align-middle">ENT</span>}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm font-medium">
            <span className="text-slate-500">{orgData.slug}</span>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            <span className="text-slate-500">ID: {orgData.id.split('-')[0]}...</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Identity */}
        <div className="space-y-6 lg:col-span-1">
          {/* Organization Bento */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Organization</h3>
            </div>
            
            <div className="space-y-4 pt-4 font-semibold text-slate-600 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Name</span>
                <span className="text-slate-900">{orgData.name}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Slug Domain</span>
                <span className="text-slate-900">{orgData.slug}.clerixs.com</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Created</span>
                <span className="text-slate-900">{new Date(orgData.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Owner Bento */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Owner Identity</h3>
            </div>
            
            <div className="space-y-4 pt-4 font-semibold text-slate-600 text-sm">
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Full Name</span>
                <span className="text-slate-900">{orgData.profiles?.full_name}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Auth Email</span>
                <span className="text-slate-900">{ownerEmail}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase">Auth ID</span>
                <span className="text-slate-900 font-mono text-xs">{orgData.owner_profile_id.split('-')[0]}...</span>
              </div>
            </div>
          </div>
          
          {/* Enterprise Branch Settings */}
          <div className="bg-amber-50/50 backdrop-blur-xl p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-3 border-b border-amber-200/50 pb-4">
              <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Key className="h-5 w-5 text-amber-700" />
              </div>
              <h3 className="text-xl font-black text-amber-900 tracking-tight">Enterprise Setup</h3>
            </div>
            
            <form action={saveEnterpriseSettingsAction} className="space-y-4 pt-4">
              <input type="hidden" name="orgId" value={orgData.id} />
              <input type="hidden" name="ownerEmail" value={ownerEmail} />
              <input type="hidden" name="orgName" value={orgData.name} />

              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Enable Enterprise Tier</label>
                <select name="isEnterprise" defaultValue={orgData.is_enterprise ? 'true' : 'false'} className="h-9 bg-white border border-slate-200 rounded-lg px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20">
                  <option value="true">ON</option>
                  <option value="false">OFF</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Branches Limit</label>
                <input type="number" name="maxBranches" defaultValue={orgData.max_branches || 1} min={1} max={50} className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>

              <button type="submit" className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-sm">
                Save Enterprise Settings
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Controls */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Subscription Manual Override */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Manual Subscription Activation</h3>
            </div>
            
            {/* Status Display */}
            <div className="flex items-center justify-between mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                  orgData.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                  orgData.subscription_status === 'trialing' ? 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                  orgData.subscription_status === 'suspended' ? 'bg-rose-900 text-rose-100 border-rose-950/50 shadow-[0_0_10px_rgba(159,18,57,0.4)]' :
                  'bg-rose-50 text-rose-600 border-rose-200/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                }`}>
                  {orgData.subscription_status}
                </span>
                <span className="text-slate-900 font-black">{subData?.subscription_plans?.name || 'No Plan Active'}</span>
              </div>
              <span className="text-slate-500 font-bold text-sm bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                Next Bill: {subData?.current_period_end ? new Date(subData.current_period_end).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {/* Activation Form */}
            <form action={activateSubscriptionAction} className="mt-6 space-y-4">
              <input type="hidden" name="orgId" value={orgData.id} />
              <input type="hidden" name="ownerEmail" value={ownerEmail} />
              <input type="hidden" name="orgName" value={orgData.name} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Plan</label>
                  <select name="planId" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none cursor-pointer">
                    {plans?.map(p => (
                      <option key={p.id} value={p.id} selected={p.id === subData?.plan_id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Cycle</label>
                  <select name="billingCycle" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none cursor-pointer">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                  <input type="date" name="startDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date (Next Billing)</label>
                  <input type="date" name="endDate" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 mt-2">
                <CheckCircle2 className="h-5 w-5" /> Activate Plan Manually
              </button>
            </form>
            <p className="text-[10px] text-center mt-2 text-slate-400 font-bold uppercase tracking-widest">Activating will send a welcome email to the clinic owner</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Trial Extension */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100/60 pb-3">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <h4 className="font-bold text-slate-900">Extend Trial</h4>
              </div>
              <form action={extendTrialAction} className="flex gap-2">
                <input type="hidden" name="orgId" value={orgData.id} />
                <input type="number" name="days" placeholder="Days" min={1} max={90} required className="w-20 h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" />
                <button type="submit" className="flex-1 h-10 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg transition-colors border border-blue-200">
                  Add Days
                </button>
              </form>
            </div>

            {/* Suspend / Reactivate */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100/60 pb-3">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h4 className="font-bold text-slate-900">Access Control</h4>
              </div>
              {orgData.subscription_status === 'suspended' ? (
                <form action={reactivateAccountAction}>
                  <input type="hidden" name="orgId" value={orgData.id} />
                  <button type="submit" className="w-full h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-lg transition-colors border border-emerald-200">
                    Reactivate Account
                  </button>
                </form>
              ) : (
                <form action={suspendAccountAction}>
                  <input type="hidden" name="orgId" value={orgData.id} />
                  <button type="submit" className="w-full h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition-colors border border-rose-200">
                    Suspend Account
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Branches & Branch Login Status Section (Visible to Admin only) */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4 mb-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Building className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinic Locations & Login Statuses</h3>
            <p className="text-xs text-slate-500 font-semibold">All physical branch sites of this clinic and their login statuses.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 font-semibold">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 rounded-xl">
              <tr>
                <th className="px-6 py-3 rounded-l-xl">Branch Name</th>
                <th className="px-6 py-3">Login Status</th>
                <th className="px-6 py-3">Manager Login Email</th>
                <th className="px-6 py-3 rounded-r-xl">Database ID</th>
              </tr>
            </thead>
            <tbody>
              {!branches || branches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium italic">
                    No branch locations have been added yet by this clinic.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-extrabold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                      {b.name}
                    </td>
                    <td className="px-6 py-4">
                      {b.has_login ? (
                        b.login_status === 'disabled' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">Disabled</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">Active</span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 uppercase">No Login</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {b.login_email || <span className="text-slate-400 italic">Not set</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {b.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
