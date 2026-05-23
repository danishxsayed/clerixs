import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signout } from '@/app/auth/actions';
import { LayoutDashboard, Shield, Landmark, CreditCard, Settings, LogOut, ShieldAlert } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Strict server-side auth check on every render
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL || 'clerixsofficial@gmail.com';

  if (!user || user.email !== adminEmail) {
    redirect('/admin/login');
  }

  // Initial letter for avatar
  const avatarLetter = user.email ? user.email.slice(0, 1).toUpperCase() : 'A';

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Header/Logo */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white shrink-0">
            <Image src="/assets/logo.jpg" alt="Clerixs Logo" fill className="object-contain p-0.5" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-wider">CLERIXS</span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <LayoutDashboard size={18} className="text-slate-400" />
            Overview
          </Link>
          <Link
            href="/admin/clinics"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <Landmark size={18} className="text-slate-400" />
            Clinics
          </Link>
          <Link
            href="/admin/subscriptions"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <CreditCard size={18} className="text-slate-400" />
            Subscriptions
          </Link>
          <Link
            href="/admin/system"
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <Settings size={18} className="text-slate-400" />
            System
          </Link>
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <form action={signout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Admin Control Panel</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500">{user.email}</span>
            <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-red-600/20">
              {avatarLetter}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
