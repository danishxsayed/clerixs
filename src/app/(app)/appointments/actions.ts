'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSystemNotification } from '../notifications/actions';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  appointment_date: z.string().min(1, 'Date is required.'),
  start_time: z.string().min(1, 'Start time is required.'),
  treatment: z.string().optional(),
  provider_id: z.string().optional(),
});

export async function createAppointment(formData: z.infer<typeof appointmentSchema>, branchIdOverride?: string) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Fetch the active membership to get BOTH organization_id and the default branch_id
  // We query the branch_memberships via the organization_memberships
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

  // Supabase returns joined tables as arrays (even with !inner and single())
  // The actual type structure looks like: branch_memberships: [{ branch_id: 'uuid' }]
  const branchMemberships = membershipData.branch_memberships as any;
  const derivedBranchId = Array.isArray(branchMemberships) 
    ? branchMemberships[0]?.branch_id 
    : branchMemberships?.branch_id;

  const branchId = branchIdOverride || derivedBranchId;

  if (!branchId) {
     console.error("Failed to extract branch_id from:", branchMemberships);
     return { error: 'Please select a branch to schedule the appointment in.' };
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

  // 3. Check for Time Slot Conflicts
  let conflictQuery = supabase
    .from('appointments')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('appointment_date', formData.appointment_date)
    .eq('start_time', formData.start_time)
    .neq('status', 'cancelled');

  if (formData.provider_id) {
      conflictQuery = conflictQuery.eq('doctor_membership_id', formData.provider_id);
  }

  const { data: conflicts } = await conflictQuery.limit(1);

  if (conflicts && conflicts.length > 0) {
    return { error: 'This time slot is already booked. Please select a different time.' };
  }

  // 4. Insert the new appointment securely linked to the tenant
  const { error: insertError } = await supabase
    .from('appointments')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: formData.patient_id,
      appointment_date: formData.appointment_date,
      start_time: formData.start_time,
      chief_complaint: formData.treatment || 'Consultation',
      notes: null, // previously stored provider text here, no longer needed
      doctor_membership_id: formData.provider_id || null,
      status: 'scheduled',
      created_by_membership_id: membershipId,
    });

  if (insertError) {
    console.error('Failed to create appointment:', insertError);
    return { error: 'Database error: Could not schedule the appointment.' };
  }

  // 4. Trigger the Notification automatically
  await createSystemNotification({
    organization_id: organizationId,
    title: 'New Appointment Scheduled',
    message: `A new appointment was scheduled on ${formData.appointment_date} at ${formData.start_time}.`,
    type: 'appointment',
  });

  // 5. Revalidate cache to reflect new data on the dashboard
  revalidatePath('/appointments');
  
  return { success: true };
}

export async function deleteAppointment(appointmentId: string) {
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
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('organization_id', membership.organization_id);

  if (deleteError) {
    console.error('Failed to delete appointment:', deleteError);
    return { error: 'Database error: Could not delete the appointment.' };
  }

  revalidatePath('/appointments');
  return { success: true };
}

export async function updateAppointment(appointmentId: string, formData: Partial<z.infer<typeof appointmentSchema>> & { status?: string }) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in.' };
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

  // Check for Time Slot Conflicts
  if (formData.appointment_date && formData.start_time) {
    let conflictQuery = supabase
      .from('appointments')
      .select('id')
      .eq('organization_id', membership.organization_id)
      .eq('appointment_date', formData.appointment_date)
      .eq('start_time', formData.start_time)
      .neq('status', 'cancelled')
      .neq('id', appointmentId);

    if (formData.provider_id) {
        conflictQuery = conflictQuery.eq('doctor_membership_id', formData.provider_id);
    }

    const { data: conflicts } = await conflictQuery.limit(1);

    if (conflicts && conflicts.length > 0) {
      return { error: 'This time slot is already booked. Please select a different time.' };
    }
  }

  const { error: updateError } = await supabase
    .from('appointments')
     .update({
       patient_id: formData.patient_id,
       appointment_date: formData.appointment_date,
       start_time: formData.start_time,
       chief_complaint: formData.treatment,
       notes: (formData as any).notes,
       doctor_membership_id: formData.provider_id || null,
       status: formData.status !== undefined ? formData.status : undefined,
     })
    .eq('id', appointmentId)
    .eq('organization_id', membership.organization_id);

  if (updateError) {
    console.error('Failed to update appointment:', updateError);
    return { error: 'Database error: Could not update the appointment.' };
  }

  // QUEUE SYNC
  if (formData.status === 'completed' || formData.status === 'checked_in') {
    try {
      const { data: queueEntry } = await supabase
        .from('queue_entries')
        .select('id')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (queueEntry) {
        const queueStatus = formData.status === 'completed' ? 'completed' : 'waiting';
        await supabase
          .from('queue_entries')
          .update({ 
            status: queueStatus,
            completed_at: formData.status === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', queueEntry.id);
      }
    } catch (err) {
      console.error('Queue Status Sync Error:', err);
    }
  }

  revalidatePath('/appointments');
  revalidatePath('/queue');
  revalidatePath(`/appointments/${appointmentId}/edit`);
  
  return { success: true };
}

export async function getAppointmentDetails(appointmentId: string) {
  const supabase = await createClient();

  // 1. Authenticate Request
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Validate Tenant Access
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

  try {
    // 3. Fetch Appointment with relations
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *, 
        patients(id, full_name, phone, patient_code, email, gender),
        organization_memberships!doctor_membership_id(
          profiles(full_name)
        )
      `)
      .eq('id', appointmentId)
      .eq('organization_id', membership.organization_id)
      .single();

    if (appointmentError || !appointment) throw new Error('Appointment not found');

    // 4. Discover connected invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, total_amount, issue_date')
      .eq('appointment_id', appointmentId);

    if (invoicesError) console.error("Failed fetching invoices:", invoicesError);

    return {
      success: true,
      data: {
        appointment,
        invoices: invoices || []
      }
    };
  } catch (error: any) {
    console.error('Failed to get appointment details:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function getVisitSummaryData(appointmentId: string) {
  const supabase = await createClient();

  // 1. Authenticate Request
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'You must be logged in to perform this action.' };

  // 2. Validate Tenant Access
  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) return { error: 'No active organization found.' };

  try {
    // 3. Fetch Core Appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *, 
        patients(*),
        organization_memberships!doctor_membership_id(
          profiles(full_name, phone)
        )
      `)
      .eq('id', appointmentId)
      .eq('organization_id', membership.organization_id)
      .single();

    if (appointmentError || !appointment) throw new Error('Appointment not found');

    // 4. Fetch Clinic & Branch Details (for Letterhead and Signature)
    const { data: orgData } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', membership.organization_id)
      .single();

    const { data: branchData } = await supabase
      .from('branches')
      .select('*')
      .eq('id', appointment.branch_id || '')
      .single();

    // 5. Fetch Lab Orders
    const { data: labOrders } = await supabase
      .from('lab_orders')
      .select(`
        *,
        lab_order_items(
          lab_tests(name, lab_test_parameters(*)),
          lab_packages(name, lab_package_tests(lab_tests(name, lab_test_parameters(*))))
        ),
        lab_results(*)
      `)
      .eq('appointment_id', appointmentId);

    // 6. Fetch Invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items(*)
      `)
      .eq('appointment_id', appointmentId);

    // 7. Fetch Prescriptions created on the same date for the same patient
    const appointmentDateStr = appointment.appointment_date; // YYYY-MM-DD
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select(`
        *,
        prescription_items(*),
        organization_memberships(profiles(full_name))
      `)
      .eq('patient_id', appointment.patient_id)
      .eq('organization_id', membership.organization_id)
      // Check if created_at (which is strict timestamp) falls on this day
      .gte('created_at', `${appointmentDateStr}T00:00:00Z`)
      .lt('created_at', `${appointmentDateStr}T23:59:59Z`)
      .order('created_at', { ascending: false })
      .limit(1);

    // 8. Fetch Next Scheduled Appointment
    const { data: nextAppointment } = await supabase
      .from('appointments')
      .select('appointment_date, start_time')
      .eq('patient_id', appointment.patient_id)
      .eq('organization_id', membership.organization_id)
      .in('status', ['scheduled', 'confirmed'])
      .gt('appointment_date', appointmentDateStr)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(1)
      .single();

    return {
      success: true,
      data: {
        appointment,
        orgData,
        branchData: branchData || null,
        labOrders: labOrders || [],
        invoices: invoices || [],
        prescription: prescriptions?.[0] || null,
        nextAppointment: nextAppointment || null,
      }
    };

  } catch (error: any) {
    console.error('Failed to get visit summary data:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}


