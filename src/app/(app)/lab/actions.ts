'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to get auth & org
async function getAuthAndOrg() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not logged in', supabase: null, user: null, organizationId: null, branchId: null };
  const { data: membershipData, error: membershipError } = await supabase
    .from('organization_memberships')
    .select(`
      id,
      organization_id,
      role,
      branch_memberships!inner (
        branch_id
      )
    `)
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();
  
  if (membershipError || !membershipData) {
    console.error("Lab Auth/Branch Error:", membershipError);
    return { error: 'No active organization or branch found.', supabase: null, user: null, organizationId: null, branchId: null };
  }

  const branchMemberships = membershipData.branch_memberships as any;
  const derivedBranchId = Array.isArray(branchMemberships) 
    ? branchMemberships[0]?.branch_id 
    : branchMemberships?.branch_id;

  return { 
    error: null, 
    supabase, 
    user, 
    organizationId: membershipData.organization_id, 
    role: membershipData.role,
    branchId: derivedBranchId
  };
}

// -------------------------------------------------------------------------------- //
// 1. Catalog Actions
// -------------------------------------------------------------------------------- //

export async function createLabTestCategory(data: any) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // STORAGE QUOTA CHECK
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId!);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  const { data: category, error: insertError } = await supabase
    .from('lab_test_categories')
    .insert({
      organization_id: organizationId,
      name: data.name,
      description: data.description || null,
    })
    .select()
    .single();

  if (insertError) return { error: 'Failed to create category' };
  
  revalidatePath('/settings/lab');
  return { success: true, id: category.id };
}

export async function createLabTest(data: any, parameters: any[]) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // STORAGE QUOTA CHECK
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId!);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  // Insert test
  const { data: test, error: testError } = await supabase
    .from('lab_tests')
    .insert({
      organization_id: organizationId,
      category_id: data.category_id || null,
      name: data.name,
      description: data.description || null,
      price: data.price || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
    })
    .select()
    .single();

  if (testError || !test) return { error: 'Failed to create lab test' };

  // Insert parameters
  if (parameters && parameters.length > 0) {
    const paramsToInsert = parameters.map((p, index) => ({
      lab_test_id: test.id,
      name: p.name,
      unit: p.unit || null,
      reference_range_min: p.reference_range_min || null,
      reference_range_max: p.reference_range_max || null,
      expected_string_value: p.expected_string_value || null,
      display_order: index,
    }));
    await supabase.from('lab_test_parameters').insert(paramsToInsert);
  }

  revalidatePath('/settings/lab');
  revalidatePath('/lab');
  return { success: true, id: test.id };
}

export async function updateLabTest(testId: string, data: any, parameters: any[]) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // Update test
  const { error: testError } = await supabase
    .from('lab_tests')
    .update({
      category_id: data.category_id || null,
      name: data.name,
      description: data.description || null,
      price: data.price || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
    })
    .eq('id', testId)
    .eq('organization_id', organizationId);

  if (testError) return { error: 'Failed to update lab test' };

  // Replace parameters (delete existing and insert new ones to avoid complex sync logic)
  await supabase.from('lab_test_parameters').delete().eq('lab_test_id', testId);

  if (parameters && parameters.length > 0) {
    const paramsToInsert = parameters.map((p, index) => ({
      lab_test_id: testId,
      name: p.name,
      unit: p.unit || null,
      reference_range_min: p.reference_range_min || null,
      reference_range_max: p.reference_range_max || null,
      expected_string_value: p.expected_string_value || null,
      display_order: index,
    }));
    await supabase.from('lab_test_parameters').insert(paramsToInsert);
  }

  revalidatePath('/settings/lab');
  return { success: true };
}

export async function deleteLabTest(testId: string) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  const { error: deleteError } = await supabase
    .from('lab_tests')
    .delete()
    .eq('id', testId)
    .eq('organization_id', organizationId);

  if (deleteError) return { error: 'Failed to delete lab test. It may be linked to existing orders.' };

  revalidatePath('/settings/lab');
  return { success: true };
}

export async function createLabPackage(data: any, testIds: string[]) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // STORAGE QUOTA CHECK
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId!);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  const { data: pkg, error: insertError } = await supabase
    .from('lab_packages')
    .insert({
      organization_id: organizationId,
      name: data.name,
      description: data.description || null,
      price: data.price || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
    })
    .select()
    .single();

  if (insertError || !pkg) return { error: 'Failed to create package' };

  if (testIds && testIds.length > 0) {
    const pkgTestsToInsert = testIds.map(id => ({
      package_id: pkg.id,
      lab_test_id: id
    }));
    await supabase.from('lab_package_tests').insert(pkgTestsToInsert);
  }

  revalidatePath('/settings/lab');
  revalidatePath('/lab');
  return { success: true, id: pkg.id };
}

export async function updateLabPackage(packageId: string, data: any, testIds: string[]) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  const { error: updateError } = await supabase
    .from('lab_packages')
    .update({
      name: data.name,
      description: data.description || null,
      price: data.price || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
    })
    .eq('id', packageId)
    .eq('organization_id', organizationId);

  if (updateError) return { error: 'Failed to update package' };

  await supabase.from('lab_package_tests').delete().eq('package_id', packageId);

  if (testIds && testIds.length > 0) {
    const pkgTestsToInsert = testIds.map(id => ({
      package_id: packageId,
      lab_test_id: id
    }));
    await supabase.from('lab_package_tests').insert(pkgTestsToInsert);
  }

  revalidatePath('/settings/lab');
  revalidatePath('/lab');
  return { success: true };
}

export async function deleteLabPackage(packageId: string) {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  const { error: deleteError } = await supabase
    .from('lab_packages')
    .delete()
    .eq('id', packageId)
    .eq('organization_id', organizationId);

  if (deleteError) return { error: 'Failed to delete package. It may be linked to existing orders.' };

  revalidatePath('/settings/lab');
  revalidatePath('/lab');
  return { success: true };
}

export async function getLabCatalog() {
  const { error, supabase, organizationId } = await getAuthAndOrg();
  if (error || !supabase) return { error, categories: [], tests: [], packages: [] };

  const [categoriesRes, testsRes, packagesRes] = await Promise.all([
    supabase.from('lab_test_categories').select('*').eq('organization_id', organizationId).order('name'),
    supabase.from('lab_tests').select('*, lab_test_parameters(*)').eq('organization_id', organizationId).order('name'),
    supabase.from('lab_packages').select('*, lab_package_tests(lab_tests(*, lab_test_parameters(*)))').eq('organization_id', organizationId).order('name')
  ]);

  return { 
    success: true, 
    categories: categoriesRes.data || [], 
    tests: testsRes.data || [],
    packages: packagesRes.data || []
  };
}

// -------------------------------------------------------------------------------- //
// 2. Orders & Workflows Actions
// -------------------------------------------------------------------------------- //
import { createInvoice } from '../billing/actions';

export async function createLabOrder(data: any) {
  const { error, supabase, organizationId, user, branchId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // STORAGE QUOTA CHECK
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId!);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  // 0. Auto-generate Invoice
  const invoiceItems = data.items.map((item: any) => ({
    description: `Lab Test: ${item.name || 'Test'}`,
    quantity: 1,
    unit_price: item.price
  }));

  const invoiceData: any = {
    patient_id: data.patient_id,
    issue_date: new Date().toISOString().split('T')[0],
    status: 'issued',
    discount_amount: data.discount_amount || 0,
    items: invoiceItems,
    notes: `Invoice for Lab Order. ${data.notes || ''}`
  };

  const invoiceRes = await createInvoice(invoiceData);
  const invoiceId = invoiceRes.success ? invoiceRes.invoiceId : null;

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('lab_orders')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: data.patient_id,
      appointment_id: data.appointment_id || null,
      doctor_membership_id: data.doctor_membership_id || null,
      invoice_id: invoiceId,
      total_amount: data.total_amount || 0,
      discount_amount: data.discount_amount || 0,
      notes: data.notes || null,
      created_by_profile_id: user?.id,
      status: 'ordered'
    })
    .select()
    .single();

  if (orderError || !order) return { error: 'Failed to create lab order' };

  // Insert Items (Individual Tests or Packages)
  if (data.items && data.items.length > 0) {
    const itemsToInsert = data.items.map((item: any) => ({
      lab_order_id: order.id,
      lab_test_id: item.lab_test_id || null,
      lab_package_id: item.lab_package_id || null,
      price: item.price || 0
    }));
    await supabase.from('lab_order_items').insert(itemsToInsert);
  }

  // Auto-create Sample record pending collection
  await supabase.from('lab_samples').insert({
    lab_order_id: order.id,
    sample_type: data.sample_type || 'Blood',
    status: 'pending'
  });

  revalidatePath(`/patients/${data.patient_id}`);
  revalidatePath('/lab');
  return { success: true, id: order.id };
}

export async function updateSampleStatus(orderId: string, status: string, barcode?: string) {
  const { error, supabase, user } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  const { error: updateError } = await supabase
    .from('lab_samples')
    .update({
      status,
      barcode: barcode || null,
      collected_at: status === 'collected' ? new Date().toISOString() : null,
      collected_by_profile_id: status === 'collected' ? user?.id : null
    })
    .eq('lab_order_id', orderId);

  if (updateError) return { error: 'Failed to update sample status' };

  // Also update order status
  let orderStatus = 'ordered';
  if (status === 'collected') orderStatus = 'sample_collected';
  if (status === 'rejected') orderStatus = 'cancelled';

  await supabase.from('lab_orders').update({ status: orderStatus }).eq('id', orderId);

  revalidatePath(`/lab/${orderId}`);
  revalidatePath('/lab');
  return { success: true };
}

export async function submitLabResults(orderId: string, results: any[]) {
  const { error, supabase, user } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // Results should be array of { lab_test_id, lab_test_parameter_id, result_value, is_abnormal }
  const resultsToInsert = results.map(r => ({
    lab_order_id: orderId,
    lab_test_id: r.lab_test_id,
    lab_test_parameter_id: r.lab_test_parameter_id,
    result_value: r.result_value || '',
    is_abnormal: r.is_abnormal || false,
    entered_by_profile_id: user?.id,
    entered_at: new Date().toISOString()
  }));

  // Clean old results for this order if any
  await supabase.from('lab_results').delete().eq('lab_order_id', orderId);

  if (resultsToInsert.length > 0) {
    const { error: insertError } = await supabase.from('lab_results').insert(resultsToInsert);
    if (insertError) return { error: 'Failed to submit results' };
  }

  // Mark order as submitted for review
  await supabase.from('lab_orders').update({ status: 'submitted' }).eq('id', orderId);

  revalidatePath(`/lab/${orderId}`);
  revalidatePath('/lab');
  revalidatePath(`/lab/print/${orderId}`);
  return { success: true };
}

export async function uploadExternalLabReport(formData: FormData) {
  const { error, supabase, organizationId, user, branchId } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  // STORAGE QUOTA CHECK
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId!);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  const patient_id = formData.get('patient_id') as string;
  const lab_name = formData.get('lab_name') as string;
  const report_date = formData.get('report_date') as string;
  const notes = formData.get('notes') as string;
  const file = formData.get('file') as File;

  if (!file) return { error: 'No file provided' };

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `lab_reports/${organizationId}/${patient_id}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { error: 'Failed to upload document. Please ensure the "documents" storage bucket exists and allows uploads.' };
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;
    const combinedNotes = `External Lab: ${lab_name}\n${notes}`;

    // 1. Record in patient_files for storage tracking
    const { error: fileRecordError } = await supabase
      .from('patient_files')
      .insert({
        organization_id: organizationId,
        patient_id: patient_id,
        storage_bucket: 'documents',
        storage_path: fileName,
        file_name: file.name,
        file_type: file.type,
        file_size_bytes: file.size,
        category: 'report',
        uploaded_by: user?.id,
      });

    if (fileRecordError) {
      console.warn('Failed to record storage usage:', fileRecordError);
      // We don't fail the whole action if just tracking fails, but we log it
    }

    // 2. Create a lab_orders record
    const { data: order, error: orderError } = await supabase
      .from('lab_orders')
      .insert({
        organization_id: organizationId,
        branch_id: branchId,
        patient_id: patient_id,
        status: 'completed',
        is_external: true,
        order_date: new Date(report_date).toISOString(),
        notes: combinedNotes,
        external_report_url: fileUrl,
        created_by_profile_id: user?.id,
      })
      .select()
      .single();

    if (orderError) return { error: orderError.message };

    revalidatePath(`/patients/${patient_id}`);
    revalidatePath('/lab');
    return { success: true };
  } catch (err: any) {
    console.error('External report error:', err);
    return { error: err.message || 'Failed to save external report' };
  }
}

export async function requestLabRevision(orderId: string, comments: string) {
  const { error, supabase, user } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  const { error: updateError } = await supabase
    .from('lab_orders')
    .update({ 
      status: 'revision_requested',
      doctor_comments: comments
    })
    .eq('id', orderId);

  if (updateError) return { error: 'Failed to request revision' };

  revalidatePath(`/lab/${orderId}`);
  revalidatePath('/lab');
  return { success: true };
}

export async function approveLabReport(orderId: string, doctorComments?: string) {
  const { error, supabase, user } = await getAuthAndOrg();
  if (error || !supabase) return { error };

  const { error: updateError } = await supabase
    .from('lab_orders')
    .update({ 
      status: 'completed',
      doctor_comments: doctorComments || null,
      approved_at: new Date().toISOString(),
      approved_by_profile_id: user?.id
    })
    .eq('id', orderId);

  if (updateError) return { error: 'Failed to approve report' };

  revalidatePath(`/lab/${orderId}`);
  revalidatePath('/lab');
  revalidatePath(`/lab/print/${orderId}`);
  return { success: true };
}

