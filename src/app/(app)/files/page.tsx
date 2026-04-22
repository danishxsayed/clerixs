import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileManagerGrid } from '@/components/files/file-manager-grid';

export default async function FilesPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Use the profile ID since the storage bucker RLS policy checks for auth.uid()
  const profileId = user.id;

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 p-6 pt-0">
      <FileManagerGrid userId={profileId} />
    </div>
  );
}
