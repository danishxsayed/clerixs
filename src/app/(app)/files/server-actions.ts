'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function registerFileUsage(data: {
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
}) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  // 2. Derive the organization_id from their active membership
  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { error: 'No active organization found' };
  }

  const organizationId = membership.organization_id;
  
  // 3. STORAGE QUOTA CHECK (Hard Blocking)
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  // 4. Insert into patient_files (central tracking)
  // patient_id is null for general clinic files
  const { error: insertError } = await supabase
    .from('patient_files')
    .insert({
      organization_id: organizationId,
      patient_id: null,
      storage_bucket: 'avatars',
      storage_path: data.storagePath,
      file_name: data.fileName,
      file_type: data.fileType,
      file_size_bytes: data.fileSize,
      category: 'other',
      uploaded_by: user.id,
    });

  if (insertError) {
    console.error('Failed to register file in database:', insertError);
    return { error: 'Failed to record file in database' };
  }

  revalidatePath('/settings/subscription');
  return { success: true };
}

export async function unregisterFileUsage(storagePath: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Delete from tracking table based on path
  const { error } = await supabase
    .from('patient_files')
    .delete()
    .eq('storage_path', storagePath);

  if (error) {
    console.error('Failed to unregister file:', error);
    return { error: 'Failed to update storage calculation after deletion' };
  }

  revalidatePath('/settings/subscription');
  return { success: true };
}
