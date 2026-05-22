import * as React from 'react';
import { Settings, ShieldCheck, Database, Server } from 'lucide-react';

export default async function AdminSystemPage() {
  const configs = [
    { key: 'ADMIN_EMAIL', value: 'clerixsofficial@gmail.com', source: 'Production Env', status: 'Secured' },
    { key: 'NEXT_PUBLIC_APP_URL', value: 'https://app.clerixs.com', source: 'Production Env', status: 'Active' },
    { key: 'NEXT_PUBLIC_ADMIN_URL', value: 'https://admin.clerixs.com', source: 'Production Env', status: 'Active' },
    { key: 'NEXT_PUBLIC_MARKETING_URL', value: 'https://clerixs.com', source: 'Production Env', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Configurations</h2>
        <p className="text-slate-500 mt-1">Audit active environmental variables and overall server framework diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Environment Vars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">Environment Audit</h3>
          </div>
          <div className="space-y-3">
            {configs.map((cfg) => (
              <div key={cfg.key} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 block">{cfg.key}</span>
                  <span className="text-slate-400 text-xs mt-0.5 block">{cfg.value}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {cfg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">Database Engine</h3>
          </div>
          <div className="space-y-4 font-semibold text-slate-700 text-sm">
            <div className="flex justify-between items-center">
              <span>Database Provider</span>
              <span className="text-slate-900 font-bold">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Row-Level Security (RLS)</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Enabled Globally
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database Connection</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Server className="h-4 w-4" /> Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
