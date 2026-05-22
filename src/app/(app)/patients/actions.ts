'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  age: z.string().min(1, 'Age is required.'),
  blood_group: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergency_contact: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.string().optional(),
});

export async function createPatient(formData: z.infer<typeof patientSchema>, branchIdOverride?: string) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Derive the organization_id from their active membership
  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id, branch_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { error: 'No active organization found for your account.' };
  }

  const organizationId = membership.organization_id;
  const branchId = branchIdOverride || membership.branch_id;
  
  if (!branchId) {
    return { error: 'Please select a branch to create the patient in.' };
  }
  // 3. STORAGE QUOTA CHECK (Hard Blocking)
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId);
  } catch (error: any) {
    if (error.message?.includes('STORAGE_QUOTA_EXCEEDED')) {
      return { error: error.message };
    }
    // Log other unexpected errors but allow proceeding if it's just a calculation bug
    console.warn('Quota check error:', error);
  }

  // 4. Generate a patient_code (e.g., PT-100X)
  const { count } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);
    
  // Format to 4 digits (e.g., PT-1001, PT-1002)
  const codeNumber = 1000 + (count || 0) + 1;
  const patientCode = `PT-${codeNumber}`;

  // 4. Insert the new patient
  const { error: insertError } = await supabase
    .from('patients')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_code: patientCode,
      full_name: formData.full_name,
      phone: formData.phone || null,
      email: formData.email || null,
      date_of_birth: formData.date_of_birth || null,
      age: formData.age,
      blood_group: formData.blood_group || null,
      emergency_contact: formData.emergency_contact || null,
      gender: formData.gender || null,
      address: formData.address || null,
      created_by: user.id,
      is_active: true,
    });

  if (insertError) {
    console.error('Failed to create patient:', insertError);
    return { error: 'Database error: Could not create the patient.' };
  }

  // 5. Revalidate cache to reflect new data on the dashboard
  revalidatePath('/patients');
  
  return { success: true };
}

export async function deletePatient(patientId: string) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Derive the organization_id from their active membership
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

  const organizationId = membership.organization_id;

  // 3. Delete the patient
  const { error: deleteError } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId)
    .eq('organization_id', organizationId);

  if (deleteError) {
    console.error('Failed to delete patient:', deleteError);
    return { error: 'Database error: Could not delete the patient. Make sure they have no active appointments.' };
  }

  // 4. Revalidate cache
  revalidatePath('/patients');
  
  return { success: true };
}

export async function updatePatient(patientId: string, formData: Partial<z.infer<typeof patientSchema>>) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Derive the organization_id from their active membership
  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id, branch_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { error: 'No active organization found for your account.' };
  }

  const organizationId = membership.organization_id;

  // 3. Update the patient
  const { error: updateError } = await supabase
    .from('patients')
    .update({
      full_name: formData.full_name,
      phone: formData.phone || null,
      email: formData.email || null,
      date_of_birth: formData.date_of_birth || null,
      age: formData.age,
      blood_group: formData.blood_group || null,
      emergency_contact: formData.emergency_contact || null,
      gender: formData.gender || null,
      address: formData.address || null,
      branch_id: membership.branch_id,
    })
    .eq('id', patientId)
    .eq('organization_id', organizationId)
    .eq('branch_id', membership.branch_id);

  if (updateError) {
    console.error('Failed to update patient:', updateError);
    return { error: 'Database error: Could not update the patient.' };
  }

  // 4. Revalidate cache
  revalidatePath('/patients');
  revalidatePath(`/patients/${patientId}/edit`);
  
  return { success: true };
}

export async function getPatientDashboard(patientId: string) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Derive the organization_id from their active membership
  const { data: membership, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id, role, branch_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membership) {
    return { error: 'No active organization found for your account.' };
  }

  const organizationId = membership.organization_id;
  const role = membership.role;

  try {
    // 3. Fetch Patient Details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .eq('organization_id', organizationId)
      .eq('branch_id', membership.branch_id)
      .single();

    if (patientError || !patient) throw new Error('Patient not found');

    // 4. Fetch Patient Appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('branch_id', membership.branch_id)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (appointmentsError) throw new Error('Failed to fetch appointments');

    // 5. Fetch Patient Invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*, payments(*)')
      .eq('patient_id', patientId)
      .eq('branch_id', membership.branch_id)
      .order('issue_date', { ascending: false });

    // 6. Fetch Patient Prescriptions
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('*, prescription_items(*), doctor_membership_id(profiles(full_name))')
      .eq('patient_id', patientId)
      .eq('branch_id', membership.branch_id)
      .order('created_at', { ascending: false });

    if (prescriptionsError) throw new Error('Failed to fetch prescriptions');
    
     // 7. Fetch Lab Orders
     const { data: labOrders, error: labOrdersError } = await supabase
       .from('lab_orders')
       .select('*, lab_order_items(lab_test_id, lab_tests(name), lab_package_id, lab_packages(name)), doctor_membership_id(profiles(full_name))')
       .eq('patient_id', patientId)
       .eq('branch_id', membership.branch_id)
       .order('order_date', { ascending: false });
 
     // 8. Fetch Clinical Notes
     const { data: clinicalNotes, error: clinicalNotesError } = await supabase
       .from('clinical_notes')
       .select('*, author_membership_id(profile_id(full_name, avatar_url))')
       .eq('patient_id', patientId)
       .eq('branch_id', membership.branch_id)
       .order('created_at', { ascending: false });
 
     return {
       success: true,
       data: {
         patient,
         appointments: appointments || [],
         invoices: invoices || [],
         prescriptions: prescriptions || [],
         labOrders: labOrders || [],
         clinicalNotes: clinicalNotes || [],
         role
       }
     };
   } catch (error: any) {
     console.error('Failed to get patient dashboard:', error);
     return { error: error.message || 'An unexpected error occurred.' };
   }
 }
 
 export async function addClinicalNote(patientId: string, content: string, noteType: string = 'general') {
   const supabase = await createClient();
 
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return { error: 'Authentication required' };
 
   const { data: membership, error: membershipError } = await supabase
     .from('organization_memberships')
     .select('id, organization_id')
     .eq('profile_id', user.id)
     .eq('status', 'active')
     .single();
 
   if (membershipError || !membership) {
     return { error: `Membership error: ${membershipError?.message || 'No active membership found'}` };
   }
 
   const { error } = await supabase
     .from('clinical_notes')
     .insert({
       organization_id: membership.organization_id,
       patient_id: patientId,
       author_membership_id: membership.id,
       content,
       note_type: noteType
     });
 
   if (error) {
     console.error('Clinical note insert error:', error);
     return { error: `Database error: ${error.message} (Code: ${error.code})` };
   }
 
   revalidatePath(`/patients/${patientId}`);
   return { success: true };
 }
 
 export async function deleteClinicalNote(noteId: string, patientId: string) {
   const supabase = await createClient();
   const { error } = await supabase
     .from('clinical_notes')
     .delete()
     .eq('id', noteId);
 
   if (error) return { error: error.message };
 
   revalidatePath(`/patients/${patientId}`);
   return { success: true };
 }

export async function bulkImportPatients(rows: any[]) {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'You must be logged in to perform this action.' };
  }

  // 2. Derive the organization_id from their active membership
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

  const organizationId = membership.organization_id;

  // 3. STORAGE QUOTA CHECK (Hard Blocking)
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId);
  } catch (error: any) {
    if (error.message?.includes('STORAGE_QUOTA_EXCEEDED')) {
      return { error: error.message };
    }
    console.warn('Quota check error during bulk import:', error);
  }

  try {
    // 3. Fetch existing phones for duplicates check
    const { data: existingPatients, error: phoneError } = await supabase
      .from('patients')
      .select('phone')
      .eq('organization_id', organizationId)
      .not('phone', 'is', null);

    if (phoneError) throw new Error('Error fetching patient records for duplicate check.');

    const existingPhoneSet = new Set((existingPatients || []).map(p => p.phone?.trim().replace(/\s+/g, '')));

    // 4. Fetch the current count for patient_code generation
    const { count } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const baseCodeNumber = 1000 + (count || 0);

    const results = {
      added: 0,
      skipped: 0,
      errors: 0,
      errorLog: [] as { row: number, name: string, reason: string }[]
    };

    const inserts = [];
    let validCount = 0;

    // 5. Process Rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +1 for 0-index, +1 for header

      // Basic required field check
      if (!row.full_name?.trim()) {
        results.errors++;
        results.errorLog.push({ row: rowNum, name: 'Unknown', reason: 'Missing required field: full_name' });
        continue;
      }

      if (!row.age?.toString().trim()) {
        results.errors++;
        results.errorLog.push({ row: rowNum, name: row.full_name, reason: 'Missing required field: age' });
        continue;
      }

      // Duplicate Check
      if (row.phone?.trim()) {
        const cleanPhone = row.phone.trim().replace(/\s+/g, '');
        if (existingPhoneSet.has(cleanPhone)) {
          results.skipped++;
          results.errorLog.push({ row: rowNum, name: row.full_name, reason: `Duplicate phone number: ${row.phone}` });
          continue;
        }
        // Add to Set to prevent duplicates within the same CSV
        existingPhoneSet.add(cleanPhone);
      }

      validCount++;
      const patientCode = `PT-${baseCodeNumber + validCount}`;

      // Enums & Optionals mapping safely
      const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
      const rawGender = row.gender?.toLowerCase()?.trim();
      const mappedGender = validGenders.includes(rawGender) ? rawGender : null;

      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const rawBg = row.blood_group?.trim().toUpperCase();
      const mappedBg = validBloodGroups.includes(rawBg) ? rawBg : null;

      let dateOfBirth = row.date_of_birth?.trim() || null;
      if (dateOfBirth) {
        // Basic validation for YYYY-MM-DD to avoid crashing DB casting
        const d = new Date(dateOfBirth);
        if (isNaN(d.getTime())) {
          dateOfBirth = null;
        }
      }

      inserts.push({
        organization_id: organizationId,
        patient_code: patientCode,
        full_name: row.full_name.trim(),
        phone: row.phone?.trim() || null,
        email: row.email?.trim() || null,
        date_of_birth: dateOfBirth,
        age: row.age.toString().trim(),
        blood_group: mappedBg,
        emergency_contact: row.emergency_contact?.trim() || null,
        gender: mappedGender,
        address: row.address?.trim() || null,
        created_by: user.id,
        is_active: true,
      });
    }

    // 6. Bulk Insert
    if (inserts.length > 0) {
      const { error: insertError } = await supabase
        .from('patients')
        .insert(inserts);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }
      
      results.added = inserts.length;
    }

    revalidatePath('/patients');
    return { success: true, results };

  } catch (error: any) {
    console.error('Failed to bulk import patients:', error);
    return { error: error.message || 'An unexpected error occurred during import.' };
  }
}
