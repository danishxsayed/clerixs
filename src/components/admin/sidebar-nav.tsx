'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Landmark, CreditCard, Settings, Newspaper } from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Clinics', href: '/admin/clinics', icon: Landmark },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Blogs', href: '/admin/blogs', icon: Newspaper },
  { name: 'System', href: '/admin/system', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-6 space-y-1.5">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 relative overflow-hidden group ${
              isActive
                ? 'text-white bg-white/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.1)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {/* Active Indicator Line */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            )}
            
            {/* Icon */}
            <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              <Icon size={18} className={isActive ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'} />
              {isActive && (
                <div className="absolute inset-0 bg-red-400 blur-md opacity-40 rounded-full" />
              )}
            </div>
            
            <span className="relative z-10">{item.name}</span>
            
            {/* Background Hover Gradient */}
            {!isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
