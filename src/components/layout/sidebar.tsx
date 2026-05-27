'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Receipt,
  Settings,
  Stethoscope,
  Users,
  UserRoundCog,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hospital,
  Files,
  FlaskConical,
  BarChart3,
  MessageSquare,
  Zap,
  Activity,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from './theme-toggle';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { useBranch } from '@/contexts/BranchContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['org_owner', 'doctor', 'receptionist', 'branch_manager'] },
  { name: 'Patients', href: '/patients', icon: Users, roles: ['org_owner', 'doctor', 'receptionist', 'branch_manager'] },
  { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['org_owner', 'doctor', 'receptionist', 'branch_manager'] },
  { name: 'Queue', href: '/queue', icon: Activity, roles: ['org_owner', 'doctor', 'receptionist', 'branch_manager'], pulsing: true },
  { name: 'Treatments', href: '/treatments', icon: Stethoscope, roles: ['org_owner', 'doctor', 'branch_manager'] },
  { name: 'Lab Dashboard', href: '/lab', icon: FlaskConical, roles: ['org_owner', 'doctor', 'laboratory', 'branch_manager'] },
  { name: 'Billing', href: '/billing', icon: Receipt, roles: ['org_owner', 'receptionist'] },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare, roles: ['org_owner', 'admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['org_owner', 'admin'] },
  { name: 'Staff', href: '/staff', icon: UserRoundCog, roles: ['org_owner', 'admin'] },
  { name: 'Branches', href: '/branches', icon: Building2, roles: ['org_owner', 'admin'] },
  { name: 'Files', href: '/files', icon: Files, roles: ['org_owner', 'admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['org_owner', 'doctor', 'receptionist', 'branch_manager'] },
];

interface SidebarProps {
  clinicName?: string;
  userRole?: string;
}

export function Sidebar({ 
  clinicName = "Wait...", 
  userRole = "Loading..."
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = React.useSyncExternalStore?.length === 0 ? null : (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null);
  // Actually, usePathname is enough to trigger on navigation. 
  // Let's use the actual searchParams hook.
  const currentSearchParams = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search).toString() : '';

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { subscription } = useSubscription();
  const [credits, setCredits] = React.useState<{ balance: number; total_used: number } | null>(null);
  
  const { branches, currentBranch, setCurrentBranch, setAllBranches, isAllBranches } = useBranch();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const showBranchSwitcher = userRole === 'org_owner' || userRole === 'admin';

  const fetchCredits = React.useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.default_organization_id) {
      const { data } = await supabase
        .from('whatsapp_credits')
        .select('balance, total_used')
        .eq('organization_id', profile.default_organization_id)
        .maybeSingle();
      
      if (data) {
        setCredits(data);
      } else {
        // Set mock credits for demo/new accounts
        setCredits({ balance: 100, total_used: 0 });
      }
    }
  }, []);

  React.useEffect(() => {
    fetchCredits();
  }, [fetchCredits, pathname, currentSearchParams]);

  // Listen to Escape key to close the mobile sidebar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, setIsMobileOpen]);

  // Close mobile sidebar on navigation path change
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // Filter items based on user role
  const visibleItems = SIDEBAR_ITEMS.filter(item => item.roles.includes(userRole));
  
  // Split into sections (Treatments is the last Clinic item)
  const clinicBreakpoint = visibleItems.findIndex(item => item.name === 'Billing' || item.name === 'Staff' || item.name === 'Settings');
  const clinicItems = clinicBreakpoint > -1 ? visibleItems.slice(0, clinicBreakpoint) : visibleItems;
  const managementItems = clinicBreakpoint > -1 ? visibleItems.slice(clinicBreakpoint) : [];

  return (
    <>
      {/* Backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background md:relative md:translate-x-0 mobile-sidebar',
          isMobileOpen && 'mobile-sidebar-open',
          isCollapsed ? 'md:w-20' : 'md:w-64',
          'w-64', // default mobile width
        )}
      >
      <div className="flex h-16 items-center px-4 pt-6">
        <Link 
          href="/dashboard" 
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-2 overflow-hidden px-2"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
            <Image
              src="/assets/logo.jpg"
              alt="Clerixs Logo"
              fill
              className="object-contain"
            />
          </div>
          {!isCollapsed && <span className="text-xl font-bold">Clerixs</span>}
        </Link>
      </div>

      {showBranchSwitcher && !isCollapsed && branches.length > 0 && (
        <div className="px-4 py-2">
          <Select 
            value={isAllBranches ? 'all' : (currentBranch?.id || '')} 
            onValueChange={(val) => {
              if (val === 'all') setAllBranches();
              else if (val) setCurrentBranch(val as string);
            }}
          >
            <SelectTrigger className="w-full bg-muted/50 border-none shadow-none h-9">
              <SelectValue>
                {(val) => {
                  if (val === 'all') return 'All Branches';
                  const found = branches.find(b => b.id === val);
                  return found?.name || currentBranch?.name || 'Select Branch';
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(userRole === 'org_owner') && (
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>All Branches</span>
                  </div>
                </SelectItem>
              )}
              {branches.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[140px]">{b.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {showBranchSwitcher && isCollapsed && branches.length > 0 && (
         <div className="px-2 py-2 flex justify-center">
             <div className="h-9 w-9 flex items-center justify-center rounded-md bg-muted/50 text-muted-foreground" title={isAllBranches ? "All Branches" : currentBranch?.name}>
                 <Building2 className="h-5 w-5" />
             </div>
         </div>
      )}

      <div className="mt-4 flex-1 px-3 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {clinicItems.length > 0 && (
                <>
                    <div className="mb-4 px-2">
                    {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground uppercase">Clinic</p>}
                    </div>
                    {clinicItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    isCollapsed ? 'justify-center' : 'justify-start',
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                  {(item as any).pulsing && (
                    <span className={cn(
                      "relative flex h-2 w-2 rounded-full bg-emerald-500",
                      isCollapsed ? "absolute top-1.5 right-1.5" : "ml-auto"
                    )}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                  )}
                </Link>
              );
            })}
                </>
            )}

            {managementItems.length > 0 && (
                <>
                    <div className="mb-4 mt-6 px-2">
                    {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground uppercase">Management</p>}
                    </div>
                    {managementItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                            'group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                            isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            isCollapsed ? 'justify-center' : 'justify-start',
                        )}
                        title={isCollapsed ? item.name : undefined}
                        >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                    })}
                </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto border-t p-4 space-y-4">
        {/* Credit Usage Bar */}
        {!isCollapsed && credits && (
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 font-medium text-primary">
                <Zap className="h-3 w-3 fill-primary" />
                <span>{subscription?.status === 'trialing' ? 'Free Trial' : subscription?.plan?.name || 'Trial'}</span>
              </div>

              <span className="text-muted-foreground">{credits.balance} left</span>
            </div>
            <Progress 
              value={Math.min(100, (credits.balance / (credits.balance + credits.total_used || 100)) * 100)} 
              className="h-1.5 shadow-inner" 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <span>Used: {credits.total_used}</span>
              <span>Total: {credits.balance + credits.total_used}</span>
            </div>
          </div>
        )}

        <ThemeToggle isCollapsed={isCollapsed} />
        
        {!isCollapsed && (
          <div className="space-y-3">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts-help'))}
              className="flex w-full items-center gap-3 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Keyboard className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>⌨️ Shortcuts</span>
              <kbd className="ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex">
                <span className="text-xs">⌘</span>/
              </kbd>
            </button>

            <div className="flex items-center gap-3 rounded-xl border p-3 bg-muted/30">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Hospital className="h-5 w-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate" title={clinicName}>
                  {clinicName}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {userRole.replace('org_', '')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border bg-white shadow-sm hidden md:flex"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
    </>
  );
}
