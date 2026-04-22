import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Plus, Search, MapPin, Phone, Building2 } from 'lucide-react';
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
import Link from 'next/link';

import { Suspense } from 'react';
import { BranchList } from './branch-list';
import { BranchSkeleton } from './skeleton';

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams?.query || '';

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) return notFound();

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', profile.default_organization_id)
    .eq('profile_id', userData.user.id)
    .single();

  // ONLY Admin/Owners can view Branches
  if (membership?.role !== 'org_owner') {
      redirect('/dashboard');
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Branches</h2>
          <p className="text-muted-foreground mt-1">Manage your clinic locations and physical spaces.</p>
        </div>
        <Link href="/branches/new">
          <Button className="rounded-full shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Button>
        </Link>
      </div>

      <Suspense key={searchQuery} fallback={<BranchSkeleton />}>
        <BranchList query={searchQuery} />
      </Suspense>
    </div>
  );
}
