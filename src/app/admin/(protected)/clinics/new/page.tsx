'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Building, User, Mail, Phone, Lock, Save, ShieldAlert, BadgeCheck } from 'lucide-react';
import { createClinicAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl text-white font-bold transition-all shadow-md ${
        pending ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/20 active:scale-95'
      }`}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Provisioning Tenant...
        </span>
      ) : (
        <>
          <Save size={18} /> Provision New Clinic Workspace
        </>
      )}
    </button>
  );
}

export default function NewClinicPage() {
  const [error, setError] = React.useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);
    const result = await createClinicAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/clinics" className="h-10 w-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manual Clinic Registration</h2>
          <p className="text-slate-500 mt-1 font-medium">Bypass self-serve checkout and provision a workspace directly.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {error && (
          <div className="m-8 mb-0 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-semibold">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form action={clientAction} className="p-8 space-y-10">
          
          {/* Clinic Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Building size={16} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Organization Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Name</label>
                <input required name="clinicName" type="text" placeholder="e.g. Apex Dental Care" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Org Slug (Unique ID)</label>
                <input required name="orgSlug" type="text" placeholder="e.g. apex-dental-xyz" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* Owner Profile */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <User size={16} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Owner Identity</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input required name="ownerName" type="text" placeholder="Dr. Sarah Smith" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input required name="ownerEmail" type="email" placeholder="sarah@apexdental.com" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input name="ownerPhone" type="tel" placeholder="+91 9876543210" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input required name="password" type="password" placeholder="••••••••" minLength={8} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Initial Subscription */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
              <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <BadgeCheck size={16} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Initial Subscription Setup</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Tier</label>
                <select required name="planCode" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none">
                  <option value="basic">Basic (Standard Limits)</option>
                  <option value="pro">Professional (High Limits)</option>
                  <option value="enterprise">Enterprise (Custom)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Override</label>
                <select required name="subscriptionStatus" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none">
                  <option value="trialing">Start 14-Day Free Trial</option>
                  <option value="active">Force Active (Comped / Pre-paid)</option>
                </select>
              </div>
            </div>
          </div>

          <SubmitButton />

        </form>
      </div>
    </div>
  );
}
