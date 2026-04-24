'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPrescription(data: {
  patientId: string;
  treatmentId?: string;
  diagnosis: string;
  instructions?: string;
  medicines: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
    notes?: string;
  }>;
}) {
  const supabase = await createClient();

  // 1. Get current user and organization
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', userData.user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) return { error: 'No organization found' };

  // STORAGE QUOTA CHECK
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, orgId);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  // 2. Identify doctor membership for RLS and tracking
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('id, role')
    .eq('organization_id', orgId)
    .eq('profile_id', userData.user.id)
    .in('role', ['doctor', 'org_owner'])
    .single();

  if (!membership) return { error: 'Only doctors and clinic owners can create prescriptions' };

  // 3. Create master prescription record
  const { data: prescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert({
      organization_id: orgId,
      patient_id: data.patientId,
      treatment_id: data.treatmentId || null,
      doctor_membership_id: membership.id,
      diagnosis: data.diagnosis,
      instructions: data.instructions || null
    })
    .select()
    .single();

  if (prescriptionError) {
    console.error('Master Rx Error:', prescriptionError);
    return { error: 'Failed to create prescription record.' };
  }

  // 4. Create all dynamic medicine entries simultaneously
  if (data.medicines && data.medicines.length > 0) {
    const rxItems = data.medicines.map(med => ({
      prescription_id: prescription.id,
      medicine_name: med.medicine_name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration_days: med.duration_days,
      notes: med.notes || null
    }));

    const { error: itemsError } = await supabase
      .from('prescription_items')
      .insert(rxItems);

    if (itemsError) {
      console.error('Rx Items Error:', itemsError);
      return { error: 'Failed to save medications.' };
    }
  }

  // 5. QUEUE SYNC: Automatically mark patient as completed in queue
  try {
    const { data: queueEntry } = await supabase
      .from('queue_entries')
      .select('id')
      .eq('organization_id', orgId)
      .eq('patient_id', data.patientId)
      .eq('status', 'in_consultation')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (queueEntry) {
      await supabase
        .from('queue_entries')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', queueEntry.id);
    }
  } catch (err) {
    console.error('Queue Sync Error:', err);
  }

  // Clear dashboard caches
  revalidatePath(`/patients/${data.patientId}`);
  revalidatePath('/queue');
  return { success: true, prescriptionId: prescription.id };
}

export async function updatePrescription(
  prescriptionId: string,
  data: {
    patientId: string;
    diagnosis: string;
    instructions?: string;
    medicines: Array<{
      medicine_name: string;
      dosage: string;
      frequency: string;
      duration_days: number;
      notes?: string;
    }>;
  }
) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: 'Not authenticated' };

  // Update main prescription conditionally based on permissions...
  const { error: rxError } = await supabase
    .from('prescriptions')
    .update({
      diagnosis: data.diagnosis,
      instructions: data.instructions || null,
    })
    .eq('id', prescriptionId)
    .eq('patient_id', data.patientId);

  if (rxError) {
    console.error('Update Master Rx Error:', rxError);
    return { error: 'Failed to update prescription details.' };
  }

  // Delete existing prescription items
  const { error: deleteError } = await supabase
    .from('prescription_items')
    .delete()
    .eq('prescription_id', prescriptionId);

  if (deleteError) {
    console.error('Delete old medicines error:', deleteError);
    return { error: 'Failed to update medicine list.' };
  }

  if (data.medicines && data.medicines.length > 0) {
    const rxItems = data.medicines.map(med => ({
      prescription_id: prescriptionId,
      medicine_name: med.medicine_name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration_days: med.duration_days,
      notes: med.notes || null
    }));

    const { error: itemsError } = await supabase
      .from('prescription_items')
      .insert(rxItems);

    if (itemsError) {
      console.error('Insert new Rx Items Error:', itemsError);
      return { error: 'Failed to save updated medications.' };
    }
  }

  revalidatePath(`/patients/${data.patientId}`);
  return { success: true };
}
