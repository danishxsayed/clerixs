'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const treatmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  title: z.string().min(2, 'Title is required.'),
  diagnosis: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

export async function createTreatment(formData: z.infer<typeof treatmentSchema>) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Fetch active membership and primary branch
  const { data: membershipData, error: membershipError } = await supabase
    .from('organization_memberships')
    .select(`
      id,
      organization_id,
      branch_memberships!inner (
        branch_id
      )
    `)
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membershipData) {
    console.error("Membership Error:", membershipError);
    return { error: 'No active branch membership found for your account.' };
  }

  const branchMemberships = membershipData.branch_memberships as any;
  const branchId = Array.isArray(branchMemberships) 
    ? branchMemberships[0]?.branch_id 
    : branchMemberships?.branch_id;

  if (!branchId) {
    return { error: 'Could not resolve your branch assignment.' };
  }

  const organizationId = membershipData.organization_id;
  const membershipId = membershipData.id;

  // STORAGE QUOTA CHECK (Hard Blocking)
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  // 3. Insert new treatment
  const { error: insertError } = await supabase
    .from('treatments')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: formData.patient_id,
      doctor_membership_id: membershipId, // Assuming creator is the doctor for now
      title: formData.title,
      diagnosis: formData.diagnosis || null,
      notes: formData.notes || null,
      status: formData.status || 'planned',
      started_at: ['in_progress', 'completed'].includes(formData.status || '') ? new Date().toISOString() : null,
      completed_at: formData.status === 'completed' ? new Date().toISOString() : null,
    });

  if (insertError) {
    console.error('Failed to create treatment:', insertError);
    return { error: 'Database error: Could not save the treatment.' };
  }

  revalidatePath('/treatments');
  return { success: true };
}

export async function updateTreatment(treatmentId: string, formData: Partial<z.infer<typeof treatmentSchema>>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { error: 'No active organization found.' };
  }

  const updatePayload: any = {
    title: formData.title,
    diagnosis: formData.diagnosis,
    notes: formData.notes,
  };

  if (formData.status) {
    updatePayload.status = formData.status;
    if (formData.status === 'in_progress') updatePayload.started_at = new Date().toISOString();
    if (formData.status === 'completed') updatePayload.completed_at = new Date().toISOString();
  }
  
  // Also allow changing patient if passed
  if (formData.patient_id) {
    updatePayload.patient_id = formData.patient_id;
  }

  // Clean undefined
  Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

  const { error: updateError } = await supabase
    .from('treatments')
    .update(updatePayload)
    .eq('id', treatmentId)
    .eq('organization_id', membership.organization_id);

  if (updateError) {
    console.error('Failed to update treatment:', updateError);
    return { error: 'Database error: Could not update the treatment.' };
  }

  revalidatePath('/treatments');
  revalidatePath(`/treatments/${treatmentId}/edit`);
  return { success: true };
}

export async function deleteTreatment(treatmentId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { error: 'No active organization found for your account.' };
  }

  const { error: deleteError } = await supabase
    .from('treatments')
    .delete()
    .eq('id', treatmentId)
    .eq('organization_id', membership.organization_id);

  if (deleteError) {
    console.error('Failed to delete treatment:', deleteError);
    return { error: 'Database error: Could not delete the treatment.' };
  }

  revalidatePath('/treatments');
  return { success: true };
}
