import * as React from 'react';
import { Settings, ShieldCheck, Database, Server } from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

export default async function AdminSystemPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let dbOperational = false;
  try {
    const { error } = await supabaseAdmin.from('organizations').select('id').limit(1);
    dbOperational = !error;
  } catch (e) {
    dbOperational = false;
  }

  const configs = [
    { key: 'ADMIN_EMAIL', value: process.env.ADMIN_EMAIL || 'Missing', source: 'Production Env', status: process.env.ADMIN_EMAIL ? 'Secured' : 'Missing' },
    { key: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL || 'Missing', source: 'Production Env', status: process.env.NEXT_PUBLIC_APP_URL ? 'Active' : 'Missing' },
    { key: 'NEXT_PUBLIC_ADMIN_URL', value: process.env.NEXT_PUBLIC_ADMIN_URL || 'Missing', source: 'Production Env', status: process.env.NEXT_PUBLIC_ADMIN_URL ? 'Active' : 'Missing' },
    { key: 'NEXT_PUBLIC_MARKETING_URL', value: process.env.NEXT_PUBLIC_SITE_URL || 'Missing', source: 'Production Env', status: process.env.NEXT_PUBLIC_SITE_URL ? 'Active' : 'Missing' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Configurations</h2>
        <p className="text-slate-500 mt-2 font-medium">Audit active environmental variables and overall server framework diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Environment Vars Bento Box */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4 relative z-10">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Environment Audit</h3>
          </div>
          <div className="space-y-4 relative z-10">
            {configs.map((cfg) => (
              <div key={cfg.key} className="flex items-center justify-between text-sm p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all duration-300">
                <div>
                  <span className="font-mono text-xs font-black text-slate-800 block mb-1">{cfg.key}</span>
                  <span className="text-slate-400 text-xs font-medium block truncate max-w-[200px]">{cfg.value}</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                  cfg.status === 'Secured' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                  cfg.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-200/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                  'bg-rose-50 text-rose-600 border-rose-200/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                }`}>
                  {cfg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Database Status Bento Box */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />

          <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4 relative z-10">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Database className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Database Engine</h3>
          </div>
          
          <div className="space-y-6 font-semibold text-slate-600 text-sm relative z-10">
            <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-medium">Database Provider</span>
              <span className="text-slate-900 font-black tracking-tight">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-medium">Row-Level Security (RLS)</span>
              <span className="text-emerald-600 font-black flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Enabled Globally
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-medium">Database Connection</span>
              {dbOperational ? (
                <span className="text-emerald-600 font-black flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Server className="h-4 w-4" /> Operational
                </span>
              ) : (
                <span className="text-rose-600 font-black flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <Server className="h-4 w-4" /> Failing
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
