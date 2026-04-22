'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Calendar, Stethoscope, FlaskConical, Receipt, BarChart3, UserRoundCog, Building2, Files, Settings } from 'lucide-react';

const STATIC_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Users, label: 'Patients' },
  { icon: Calendar, label: 'Appointments' },
  { icon: Stethoscope, label: 'Treatments' },
  { icon: FlaskConical, label: 'Lab Dashboard' },
  { icon: Receipt, label: 'Billing' },
];

export function SidebarSkeleton() {
  return (
    <div className="relative flex h-screen w-64 flex-col border-r bg-background transition-all duration-300">
      <div className="flex h-16 items-center px-4 pt-6">
        <div className="flex items-center gap-2 px-2">
           <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
           <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="mt-12 flex-1 px-3 space-y-8">
        {/* ... items ... */}
      </div>

      <div className="mt-auto border-t p-4 space-y-4">
        <div className="h-9 w-full bg-muted/40 animate-pulse rounded-xl" />
        
        <div className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20 animate-pulse">
           <div className="h-9 w-9 bg-muted rounded-lg" />
           <div className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-2 w-12 bg-muted rounded" />
           </div>
        </div>
      </div>
    </div>
  );
}
