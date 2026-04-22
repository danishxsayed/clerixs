'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { signout } from '@/app/(auth)/actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlobalSearch } from './global-search';
import { NotificationBell } from './notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar({ 
  userFullName = "Unknown User", 
  userEmail = "unknown@clerixs.com",
  userAvatar,
  userRole = "org_owner"
}: { 
  userFullName?: string; 
  userEmail?: string;
  userAvatar?: string;
  userRole?: string;
}) {
  const router = useRouter();

  // Create initials e.g. "John Doe" -> "JD"
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header 
      suppressHydrationWarning 
      className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-6"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatar || ""} alt={userFullName} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials(userFullName) || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userFullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings?tab=profile')}>Profile</DropdownMenuItem>
            {userRole === 'org_owner' && (
              <>
                 <DropdownMenuItem onClick={() => router.push('/billing')}>Billing</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => await signout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
