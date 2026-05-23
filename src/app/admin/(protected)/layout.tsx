import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signout } from '@/app/auth/actions';
import { LogOut } from 'lucide-react';
import { SidebarNav } from '@/components/admin/sidebar-nav';

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
      <aside className="w-64 bg-[#0a0f1c] border-r border-white/5 flex flex-col shrink-0 shadow-2xl relative z-20">
        {/* Subtle glowing orb in sidebar */}
        <div className="absolute top-0 left-0 w-full h-32 bg-red-500/10 blur-[50px] pointer-events-none rounded-full" />

        {/* Header/Logo */}
        <div className="h-16 px-6 border-b border-white/5 flex items-center gap-3 relative z-10">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white/10 shrink-0 backdrop-blur-sm border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Image src="/assets/logo.jpg" alt="Clerixs Logo" fill className="object-contain p-0.5" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CLERIXS</span>
        </div>

        {/* Sidebar Nav (Client Component) */}
        <div className="flex-1 overflow-y-auto relative z-10 py-2">
          <SidebarNav />
        </div>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-white/5 relative z-10">
          <form action={signout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 cursor-pointer group"
            >
              <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
        {/* Subtle background mesh gradient for the main workspace */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-red-400/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Admin Top Bar */}
        <header className="h-16 border-b border-slate-200/60 px-8 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-xl relative z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-extrabold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Admin Control Panel</h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white uppercase tracking-wider shadow-sm shadow-red-500/20">
              System Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-700">{user.email}</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Superuser Access</span>
            </div>
            <div className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_15px_rgba(225,29,72,0.3)] ring-2 ring-white">
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
