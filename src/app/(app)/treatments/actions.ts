'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSystemNotification } from '../notifications/actions';

const treatmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  title: z.string().min(2, 'Title is required.'),
  diagnosis: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
  treatment_type: z.enum(['single', 'multi']).default('single'),
  estimated_sessions: z.coerce.number().optional().nullable(),
  estimated_cost: z.coerce.number().optional().nullable(),
  expected_end_date: z.string().optional().nullable(),
  doctor_membership_id: z.string().optional().nullable(),
  appointment_id: z.string().optional().nullable(),
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
  const { data: newTreatment, error: insertError } = await supabase
    .from('treatments')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: formData.patient_id,
      doctor_membership_id: formData.doctor_membership_id || membershipId,
      appointment_id: formData.appointment_id || null,
      title: formData.title,
      diagnosis: formData.diagnosis || null,
      notes: formData.notes || null,
      status: formData.status || 'planned',
      treatment_type: formData.treatment_type,
      estimated_sessions: formData.treatment_type === 'multi' ? (formData.estimated_sessions || null) : 1,
      completed_sessions: 0,
      estimated_cost: formData.estimated_cost || 0,
      collected_amount: 0,
      expected_end_date: formData.expected_end_date || null,
      started_at: ['in_progress', 'completed'].includes(formData.status || '') ? new Date().toISOString() : null,
      completed_at: formData.status === 'completed' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (insertError || !newTreatment) {
    console.error('Failed to create treatment:', insertError);
    return { error: 'Database error: Could not save the treatment.' };
  }

  revalidatePath('/treatments');
  return { success: true, treatmentId: newTreatment.id };
}

export async function updateTreatment(treatmentId: string, formData: Partial<z.infer<typeof treatmentSchema>> & { collected_amount?: number }) {
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
    treatment_type: formData.treatment_type,
    estimated_sessions: formData.estimated_sessions,
    estimated_cost: formData.estimated_cost,
    collected_amount: formData.collected_amount,
    expected_end_date: formData.expected_end_date,
    doctor_membership_id: formData.doctor_membership_id,
    appointment_id: formData.appointment_id,
  };

  if (formData.status) {
    updatePayload.status = formData.status;
    if (formData.status === 'in_progress') updatePayload.started_at = new Date().toISOString();
    if (formData.status === 'completed') updatePayload.completed_at = new Date().toISOString();
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
  revalidatePath(`/treatments/${treatmentId}`);
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

// ==========================================
// TREATMENT SESSIONS ACTIONS
// ==========================================

const sessionSchema = z.object({
  session_date: z.string().min(1, 'Date is required.'),
  session_time: z.string().min(1, 'Time is required.'),
  doctor_membership_id: z.string().min(1, 'Doctor is required.'),
  notes: z.string().optional().nullable(),
  cost: z.coerce.number().min(0, 'Cost must be positive.'),
  status: z.enum(['completed', 'scheduled', 'cancelled']).default('completed'),
  next_session_recommended: z.boolean().default(false),
  next_session_date: z.string().optional().nullable(),
});

export async function addTreatmentSession(treatmentId: string, data: z.infer<typeof sessionSchema>) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Authentication required.' };

  // 2. Fetch active membership
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

  if (membershipError || !membershipData) return { error: 'No active membership found.' };
  const organizationId = membershipData.organization_id;
  const branchMemberships = membershipData.branch_memberships as any;
  const branchId = Array.isArray(branchMemberships) ? branchMemberships[0]?.branch_id : branchMemberships?.branch_id;

  if (!branchId) return { error: 'Branch assignment unresolved.' };

  // Fetch Treatment detail
  const { data: treatment, error: treatmentError } = await supabase
    .from('treatments')
    .select('patient_id, status, title')
    .eq('id', treatmentId)
    .single();

  if (treatmentError || !treatment) return { error: 'Treatment record not found.' };

  // 3. Determine next session number
  const { count: sessionCount } = await supabase
    .from('treatment_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('treatment_id', treatmentId);
  const sessionNumber = (sessionCount || 0) + 1;

  // 4. Insert session
  const { error: insertError } = await supabase
    .from('treatment_sessions')
    .insert({
      treatment_id: treatmentId,
      organization_id: organizationId,
      branch_id: branchId,
      session_number: sessionNumber,
      session_date: data.session_date,
      session_time: data.session_time.length === 5 ? `${data.session_time}:00` : data.session_time,
      doctor_membership_id: data.doctor_membership_id,
      notes: data.notes || null,
      cost: data.cost,
      status: data.status,
      next_session_date: data.next_session_recommended ? (data.next_session_date || null) : null,
      created_by: user.id,
    });

  if (insertError) {
    console.error('Failed to create session:', insertError);
    return { error: 'Database error: Could not log session.' };
  }

  // 5. Update completed sessions and active state
  await updateTreatmentSessionCounters(treatmentId);

  // If status was planned, automatically update to in_progress
  if (treatment.status === 'planned') {
    await supabase
      .from('treatments')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', treatmentId);
  }

  // 6. Next session automation -> create a Scheduled appointment
  if (data.next_session_recommended && data.next_session_date) {
    const { error: apptError } = await supabase
      .from('appointments')
      .insert({
        organization_id: organizationId,
        branch_id: branchId,
        patient_id: treatment.patient_id,
        appointment_date: data.next_session_date,
        start_time: '10:00:00', // Default recommended morning slot
        chief_complaint: `Recommended session for: ${treatment.title}`,
        doctor_membership_id: data.doctor_membership_id,
        status: 'scheduled',
        created_by_membership_id: membershipData.id,
      });

    if (apptError) {
      console.error('Auto appointment creation failed:', apptError);
    }
  }

  revalidatePath('/treatments');
  revalidatePath(`/treatments/${treatmentId}`);
  revalidatePath(`/patients/${treatment.patient_id}`);
  return { success: true };
}

export async function updateTreatmentSession(sessionId: string, data: Partial<z.infer<typeof sessionSchema>>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Authentication required.' };

  const { data: session } = await supabase
    .from('treatment_sessions')
    .select('treatment_id')
    .eq('id', sessionId)
    .single();

  if (!session) return { error: 'Session not found.' };

  const updatePayload: any = {
    session_date: data.session_date,
    session_time: data.session_time ? (data.session_time.length === 5 ? `${data.session_time}:00` : data.session_time) : undefined,
    doctor_membership_id: data.doctor_membership_id,
    notes: data.notes,
    cost: data.cost,
    status: data.status,
    next_session_date: data.next_session_recommended === false ? null : data.next_session_date,
  };

  Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

  const { error: updateError } = await supabase
    .from('treatment_sessions')
    .update(updatePayload)
    .eq('id', sessionId);

  if (updateError) {
    console.error('Failed to update session:', updateError);
    return { error: 'Failed to update session.' };
  }

  await updateTreatmentSessionCounters(session.treatment_id);

  revalidatePath(`/treatments/${session.treatment_id}`);
  return { success: true };
}

export async function deleteTreatmentSession(sessionId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Authentication required.' };

  const { data: session } = await supabase
    .from('treatment_sessions')
    .select('treatment_id')
    .eq('id', sessionId)
    .single();

  if (!session) return { error: 'Session not found.' };

  const { error: deleteError } = await supabase
    .from('treatment_sessions')
    .delete()
    .eq('id', sessionId);

  if (deleteError) {
    console.error('Failed to delete session:', deleteError);
    return { error: 'Failed to delete session.' };
  }

  await updateTreatmentSessionCounters(session.treatment_id);

  revalidatePath(`/treatments/${session.treatment_id}`);
  return { success: true };
}

// Helper to recalculate completed sessions in database
async function updateTreatmentSessionCounters(treatmentId: string) {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from('treatment_sessions')
    .select('cost, status')
    .eq('treatment_id', treatmentId);

  if (!sessions) return;

  const completedCount = sessions.filter(s => s.status === 'completed').length;
  
  await supabase
    .from('treatments')
    .update({ completed_sessions: completedCount })
    .eq('id', treatmentId);
}

// ==========================================
// INVOICING TRIGGER ACTION
// ==========================================

export async function generateTreatmentInvoice(treatmentId: string) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Authentication required.' };

  // 2. Fetch membership
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

  if (membershipError || !membershipData) return { error: 'No active membership found.' };
  const organizationId = membershipData.organization_id;
  const branchMemberships = membershipData.branch_memberships as any;
  const branchId = Array.isArray(branchMemberships) ? branchMemberships[0]?.branch_id : branchMemberships?.branch_id;

  if (!branchId) return { error: 'Branch assignment unresolved.' };

  // 3. Fetch Treatment and Sessions
  const { data: treatment, error: treatmentErr } = await supabase
    .from('treatments')
    .select(`
      *,
      patients(full_name),
      treatment_sessions(*)
    `)
    .eq('id', treatmentId)
    .single();

  if (treatmentErr || !treatment) return { error: 'Treatment record not found.' };

  // Determine items to insert into the invoice
  let invoiceItems: { description: string; quantity: number; unit_price: number }[] = [];
  const treatmentCost = Number(treatment.final_cost) || Number(treatment.estimated_cost) || 0;

  if (treatment.treatment_type === 'single') {
    invoiceItems.push({
      description: `Treatment Procedure: ${treatment.title}`,
      quantity: 1,
      unit_price: treatmentCost,
    });
  } else {
    // Multi session -> invoice completed but uninvoiced sessions or all completed sessions
    const completedSessions = (treatment.treatment_sessions || []).filter((s: any) => s.status === 'completed');
    if (completedSessions.length > 0) {
      completedSessions.forEach((s: any) => {
        invoiceItems.push({
          description: `Session ${s.session_number}: ${treatment.title} logged on ${s.session_date}`,
          quantity: 1,
          unit_price: Number(s.cost) || 0,
        });
      });
    } else {
      // Fallback to estimated/final cost item if no sessions are logged yet
      invoiceItems.push({
        description: `Treatment Procedure Estimate: ${treatment.title}`,
        quantity: 1,
        unit_price: treatmentCost,
      });
    }
  }

  // Calculate totals
  let subtotal = 0;
  const itemsDetails = invoiceItems.map(item => {
    const lineTotalBase = item.quantity * item.unit_price;
    subtotal += lineTotalBase;
    return {
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: 5.0,
      discount_amount: 0,
      line_total: lineTotalBase + (lineTotalBase * 0.05)
    };
  });

  const totalTax = subtotal * 0.05;
  const totalAmount = subtotal + totalTax;
  const balanceDue = totalAmount;

  // Generate invoice number INV-YYYYMMDD-XXXX
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .ilike('invoice_number', `INV-${dateStr}-%`);
  const sequence = ((count || 0) + 1).toString().padStart(4, '0');
  const invoiceNumber = `INV-${dateStr}-${sequence}`;

  // Insert Invoice Record
  const { data: invoiceResult, error: insertError } = await supabase
    .from('invoices')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: treatment.patient_id,
      treatment_id: treatmentId,
      invoice_number: invoiceNumber,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      subtotal: subtotal,
      discount_amount: 0,
      tax_amount: totalTax,
      total_amount: totalAmount,
      amount_paid: 0,
      balance_due: balanceDue,
      notes: `Automatically generated invoice for treatment "${treatment.title}"`,
      created_by: user.id
    })
    .select('id')
    .single();

  if (insertError || !invoiceResult) {
    console.error('Failed to create invoice:', insertError);
    return { error: 'Database error: Could not create invoice.' };
  }

  // Insert Invoice Items
  const itemsToInsert = itemsDetails.map(item => ({
    ...item,
    organization_id: organizationId,
    invoice_id: invoiceResult.id
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Invoice items save failed:', itemsError);
  }

  // Send Notification
  await createSystemNotification({
    organization_id: organizationId,
    title: 'New Treatment Invoice Generated',
    message: `Invoice ${invoiceNumber} created for treatment "${treatment.title}".`,
    type: 'billing',
    link_url: `/billing/${invoiceResult.id}`
  });

  revalidatePath('/treatments');
  revalidatePath(`/treatments/${treatmentId}`);
  revalidatePath(`/billing`);
  
  return { success: true, invoiceId: invoiceResult.id };
}

// ==========================================
// FILE UPLOADS ACTIONS
// ==========================================

export async function uploadTreatmentFile(data: {
  treatmentId: string;
  patientId: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id, branch_memberships!inner ( branch_id )')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'No active organization found.' };
  const branchMemberships = membership.branch_memberships as any;
  const branchId = Array.isArray(branchMemberships) ? branchMemberships[0]?.branch_id : branchMemberships?.branch_id;

  const { error: insertError } = await supabase
    .from('patient_files')
    .insert({
      organization_id: membership.organization_id,
      branch_id: branchId || null,
      patient_id: data.patientId,
      treatment_id: data.treatmentId,
      storage_bucket: 'treatments',
      storage_path: data.storagePath,
      file_name: data.fileName,
      file_type: data.fileType,
      file_size_bytes: data.fileSize,
      category: 'other',
      uploaded_by: user.id,
    });

  if (insertError) {
    console.error('Failed to save file in DB:', insertError);
    return { error: 'Failed to record file in database' };
  }

  revalidatePath(`/treatments/${data.treatmentId}`);
  return { success: true };
}

export async function deleteTreatmentFile(fileId: string, treatmentId: string, storagePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required.' };

  // 1. Delete from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('treatments')
    .remove([storagePath]);

  if (storageError) {
    console.error('Failed to delete storage object:', storageError);
  }

  // 2. Delete from DB
  const { error: dbError } = await supabase
    .from('patient_files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    console.error('Failed to delete file from DB:', dbError);
    return { error: 'Failed to delete record from database' };
  }

  revalidatePath(`/treatments/${treatmentId}`);
  return { success: true };
}
