'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const walkInSchema = z.object({
  doctor_membership_id: z.string().uuid(),
  patient_name: z.string().min(2, 'Name is required'),
  patient_id: z.string().uuid().optional(),
  create_profile: z.boolean().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  age: z.string().optional(),
  date_of_birth: z.string().optional(),
  blood_group: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergency_contact: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.string().optional(),
});

export async function addToQueue(formData: z.infer<typeof walkInSchema>) {
  const supabase = await createClient();

  // 1. Auth & Org
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.default_organization_id) return { error: 'No organization found' };

  let patientId = formData.patient_id;

  // 2. Create Patient Profile if requested
  if (formData.create_profile && !patientId) {
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.default_organization_id);
    
    const codeNumber = 1000 + (count || 0) + 1;
    const patientCode = `PT-${codeNumber}`;

    const { data: newPatient, error: pError } = await supabase
      .from('patients')
      .insert({
        organization_id: profile.default_organization_id,
        patient_code: patientCode,
        full_name: formData.patient_name,
        phone: formData.phone || null,
        email: formData.email || null,
        age: formData.age || '0',
        date_of_birth: formData.date_of_birth || null,
        blood_group: formData.blood_group || null,
        gender: formData.gender || 'prefer_not_to_say',
        emergency_contact: formData.emergency_contact || null,
        address: formData.address || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (pError) {
      console.error('Patient Create Error:', pError);
      return { error: 'Failed to create patient profile' };
    }
    patientId = newPatient.id;
  }

  // 3. Get next position
  const { data: maxPos } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('organization_id', profile.default_organization_id)
    .eq('doctor_membership_id', formData.doctor_membership_id)
    .gte('created_at', new Date().toISOString().split('T')[0])
    .order('queue_position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos = (maxPos?.queue_position || 0) + 1;

  // 4. Insert Queue Entry
  const { error } = await supabase
    .from('queue_entries')
    .insert({
      organization_id: profile.default_organization_id,
      doctor_membership_id: formData.doctor_membership_id,
      patient_id: patientId || null,
      patient_name: formData.patient_name,
      status: 'waiting',
      queue_position: nextPos,
      is_walkin: !patientId,
      checked_in_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Queue Insert Error:', error);
    return { error: 'Failed to add to queue' };
  }

  revalidatePath('/queue');
  return { success: true };
}

export async function checkInToQueue(appointmentId: string) {
  const supabase = await createClient();

  // 1. Fetch appointment details
  const { data: appt, error: apptError } = await supabase
    .from('appointments')
    .select('organization_id, doctor_membership_id, patient_id, patients(full_name)')
    .eq('id', appointmentId)
    .single();

  if (apptError || !appt) return { error: 'Appointment not found' };

  // 2. Update appointment status to 'checked_in'
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'checked_in' })
    .eq('id', appointmentId);

  if (updateError) return { error: 'Failed to update appointment status' };

  // 3. Add to queue
  const { data: maxPos } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('organization_id', appt.organization_id)
    .eq('doctor_membership_id', appt.doctor_membership_id)
    .gte('created_at', new Date().toISOString().split('T')[0])
    .order('queue_position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPos = (maxPos?.queue_position || 0) + 1;

  const { error: queueError } = await supabase
    .from('queue_entries')
    .insert({
      organization_id: appt.organization_id,
      doctor_membership_id: appt.doctor_membership_id,
      patient_id: appt.patient_id,
      patient_name: (appt.patients as any)?.full_name || 'Checked-in Patient',
      appointment_id: appointmentId,
      status: 'waiting',
      queue_position: nextPos,
      is_walkin: false,
      checked_in_at: new Date().toISOString(),
    });

  if (queueError) {
    console.error('Queue Insert Error:', queueError);
    return { error: 'Failed to add to queue' };
  }

  revalidatePath('/appointments');
  revalidatePath('/queue');
  return { success: true };
}

export async function updateQueueStatus(id: string, status: 'waiting' | 'in_consultation' | 'completed' | 'skipped') {
  const supabase = await createClient();

  const updateData: any = { status };
  if (status === 'in_consultation') updateData.called_at = new Date().toISOString();
  if (status === 'completed') updateData.completed_at = new Date().toISOString();

  const { data: entry, error: fetchError } = await supabase
    .from('queue_entries')
    .select('appointment_id')
    .eq('id', id)
    .single();

  if (fetchError) return { error: 'Entry not found' };

  const { error } = await supabase
    .from('queue_entries')
    .update(updateData)
    .eq('id', id);

  if (error) return { error: 'Failed to update status' };

  // Sync with appointment status if linked
  if (entry.appointment_id) {
    let apptStatus = 'checked_in';
    if (status === 'in_consultation') apptStatus = 'in_progress';
    if (status === 'completed') apptStatus = 'completed';

    await supabase
      .from('appointments')
      .update({ status: apptStatus as any })
      .eq('id', entry.appointment_id);
  }

  revalidatePath('/queue');
  return { success: true };
}

export async function reorderQueue(id: string, direction: 'up' | 'down') {
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (!entry) return { error: 'Entry not found' };

  const { data: otherEntry } = await supabase
    .from('queue_entries')
    .select('id, queue_position')
    .eq('organization_id', entry.organization_id)
    .eq('doctor_membership_id', entry.doctor_membership_id)
    .eq('status', 'waiting')
    .filter('queue_position', direction === 'up' ? 'lt' : 'gt', entry.queue_position)
    .order('queue_position', { ascending: direction === 'down' })
    .limit(1)
    .maybeSingle();

  if (!otherEntry) return { success: true }; // Already at end

  // Swap positions
  await Promise.all([
    supabase.from('queue_entries').update({ queue_position: otherEntry.queue_position }).eq('id', id),
    supabase.from('queue_entries').update({ queue_position: entry.queue_position }).eq('id', otherEntry.id)
  ]);

  revalidatePath('/queue');
  return { success: true };
}

export async function removeFromQueue(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('queue_entries')
    .delete()
    .eq('id', id);

  if (error) return { error: 'Failed to remove from queue' };

  revalidatePath('/queue');
  return { success: true };
}
