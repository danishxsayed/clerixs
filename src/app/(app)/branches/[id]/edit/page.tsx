import * as React from 'react';
import { BranchEditForm } from './branch-edit-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  if (!profile?.default_organization_id) return notFound();

  // Fetch specific branch
  const { data: branch } = await supabase
    .from('branches')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('organization_id', profile.default_organization_id)
    .single();

  if (!branch) return notFound();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link 
          href="/branches" 
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Branch</h2>
          <p className="text-muted-foreground mt-1">
            Update details for {branch.name}.
          </p>
        </div>
      </div>
      
      <div className="mt-4 w-full">
        <BranchEditForm branch={branch} />
      </div>
    </div>
  );
}
