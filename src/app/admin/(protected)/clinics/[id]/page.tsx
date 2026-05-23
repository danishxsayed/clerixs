import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, CreditCard, User, Building, Activity, CalendarDays, Key, ShieldAlert } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { updateClinicStatusAction } from './actions';

// Ensure the page knows about the params Promise type correctly in Next.js 15
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

  // To actually get the email we'd need auth.users, but we can bypass for now or fetch it separately
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(orgData.owner_profile_id);
  const ownerEmail = authData?.user?.email || 'No email attached';

  const { data: subData } = await supabaseAdmin
    .from('organization_subscriptions')
    .select('*, subscription_plans(name, monthly_price)')
    .eq('organization_id', id)
    .single();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/clinics" className="h-10 w-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{orgData.name}</h2>
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
        </div>

        {/* Right Col: Controls */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Subscription Status */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4">
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Billing & Subscription Status</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Current Tier</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      orgData.plan_code === 'enterprise' ? 'bg-purple-50 text-purple-600 border-purple-200/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                      orgData.plan_code === 'pro' ? 'bg-blue-50 text-blue-600 border-blue-200/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-slate-50 text-slate-600 border-slate-200/50'
                    }`}>
                  {orgData.plan_code}
                </span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Account Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      orgData.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                      orgData.subscription_status === 'trialing' ? 'bg-amber-50 text-amber-600 border-amber-200/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                      'bg-rose-50 text-rose-600 border-rose-200/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    }`}>
                  {orgData.subscription_status}
                </span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Payment Gateway</span>
                <span className="text-slate-900 font-bold">{subData?.provider || 'None'}</span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Next Billing Date</span>
                <span className="text-slate-900 font-bold">{subData?.current_period_end ? new Date(subData.current_period_end).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone Controls */}
          <div className="bg-rose-50/30 backdrop-blur-xl p-8 rounded-3xl border border-rose-100 shadow-[0_8px_30px_rgb(225,29,72,0.04)] space-y-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              <h3 className="text-xl font-black text-red-900 tracking-tight">Administrative Overrides</h3>
            </div>
            <p className="text-sm font-medium text-rose-800/80">Use these controls to forcefully override the clinic's billing status or plan tier. These changes will take effect immediately and may disrupt the tenant's workspace access.</p>

            <form action={updateClinicStatusAction} className="bg-white rounded-2xl border border-rose-100 p-6 flex items-end gap-4 shadow-sm">
              <input type="hidden" name="orgId" value={orgData.id} />
              
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Override Plan Tier</label>
                <select name="planCode" defaultValue={orgData.plan_code} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500/20 outline-none appearance-none cursor-pointer">
                  <option value="basic">Basic</option>
                  <option value="pro">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Override Status</label>
                <select name="subscriptionStatus" defaultValue={orgData.subscription_status} className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-red-500/20 outline-none appearance-none cursor-pointer">
                  <option value="active">Active (Full Access)</option>
                  <option value="trialing">Trialing (Full Access)</option>
                  <option value="past_due">Past Due (Locked Out)</option>
                  <option value="cancelled">Cancelled (Locked Out)</option>
                </select>
              </div>

              <button type="submit" className="h-11 px-6 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md shadow-red-600/20 whitespace-nowrap">
                Force Update
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
