import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Search, MailPlus, UserRound, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StaffInviteForm } from './invite-form';
import { StaffRowActions } from './staff-row-actions';
import { InviteRowActions } from './invite-row-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Suspense } from 'react';
import { StaffList } from './staff-list';
import { StaffSkeleton } from './skeleton';

export default async function StaffPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return notFound();

  // Get current user's profile and default org
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) return notFound();

  // Get current user's role to determine if they can invite
  const { data: currentMembership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', profile.default_organization_id)
    .eq('profile_id', userData.user.id)
    .single();

  const isOwner = currentMembership?.role === 'org_owner';
  const isAdmin = currentMembership?.role === 'admin';

  if (!isOwner && !isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff & Team</h2>
          <p className="text-muted-foreground mt-1">Manage doctors, receptionists, and clinic access.</p>
        </div>
        
        {isOwner && (
          <Dialog>
            <DialogTrigger render={<Button className="rounded-full shadow-sm" />}>
                <MailPlus className="mr-2 h-4 w-4" />
                Invite Member
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite to Clinic workspace</DialogTitle>
                <DialogDescription>
                  Send an email invitation to add a new colleague to your Clerixs organization.
                </DialogDescription>
              </DialogHeader>
              <StaffInviteForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Suspense fallback={<StaffSkeleton />}>
        <StaffList />
      </Suspense>
    </div>
  );
}
