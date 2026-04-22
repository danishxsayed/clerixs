'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSystemNotification } from '../notifications/actions';

// We define a robust schema here, though the form will control its shape
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1),
  unit_price: z.number().min(0),
});

const invoiceSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  treatment_id: z.string().optional().nullable(),
  appointment_id: z.string().optional().nullable(),
  issue_date: z.string().min(1, 'Issue date is required.'),
  due_date: z.string().optional().nullable(),
  status: z.enum(['draft', 'issued', 'partially_paid', 'paid', 'void']).default('draft'),
  notes: z.string().optional(),
  amount_paid: z.coerce.number().min(0).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

// Helper for generating invoice numbers like INV-YYYYMMDD-XXXX
async function generateInvoiceNumber(supabase: any, orgId: string) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // To keep it simple, we just query how many exist today and append an increment
  // This is a naive generator. In high concurrency, a Postgres sequence is better.
  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .ilike('invoice_number', `INV-${dateStr}-%`);
    
  const sequence = ((count || 0) + 1).toString().padStart(4, '0');
  return `INV-${dateStr}-${sequence}`;
}

export async function createInvoice(formData: z.infer<typeof invoiceSchema>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'You must be logged in.' };

  const { data: membershipData, error: membershipError } = await supabase
    .from('organization_memberships')
    .select(`
      id,
      organization_id,
      branch_memberships!inner ( branch_id )
    `)
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membershipData) return { error: 'No active branch membership found.' };

  const branchMemberships = membershipData.branch_memberships as any;
  const branchId = Array.isArray(branchMemberships) ? branchMemberships[0]?.branch_id : branchMemberships?.branch_id;
  if (!branchId) return { error: 'Could not resolve branch assignment.' };

  const organizationId = membershipData.organization_id;

  // STORAGE QUOTA CHECK (Hard Blocking)
  try {
    const { ensureStorageQuota } = await import('@/lib/quota');
    await ensureStorageQuota(supabase, organizationId);
  } catch (err: any) {
    if (err.message?.includes('STORAGE_QUOTA_EXCEEDED')) return { error: err.message };
  }

  // 1. Calculate totals
  let subtotal = 0;

  const itemsDetails = formData.items.map(item => {
    const lineTotalBase = item.quantity * item.unit_price;
    subtotal += lineTotalBase;

    return {
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: 5, // Representing total 5% GST on the items
      discount_amount: 0, 
      line_total: lineTotalBase + (lineTotalBase * 0.05)
    };
  });

  const invoiceDiscount = formData.discount_amount || 0;
  const taxableAmount = Math.max(0, subtotal - invoiceDiscount);
  const totalTax = taxableAmount * 0.05; // 2.5% SGST + 2.5% CGST
  const totalAmount = taxableAmount + totalTax;

  let initialAmountPaid = formData.amount_paid || 0;
  let computedStatus = formData.status;
  
  if (computedStatus === 'paid') {
      initialAmountPaid = totalAmount;
  }
  
  const balanceDue = Math.max(0, totalAmount - initialAmountPaid);
  
  if (balanceDue === 0 && computedStatus !== 'void') {
      computedStatus = 'paid';
  } else if (initialAmountPaid > 0 && balanceDue > 0 && computedStatus !== 'void') {
      computedStatus = 'partially_paid';
  }

  // 2. Insert Invoice Master Record
  const invoiceNumber = await generateInvoiceNumber(supabase, organizationId);
  
  const { data: invoiceResult, error: insertError } = await supabase
    .from('invoices')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: formData.patient_id,
      treatment_id: formData.treatment_id || null,
      appointment_id: formData.appointment_id || null,
      invoice_number: invoiceNumber,
      status: computedStatus,
      issue_date: formData.issue_date,
      due_date: formData.due_date || null,
      subtotal: subtotal,
      discount_amount: invoiceDiscount,
      tax_amount: totalTax,
      total_amount: totalAmount,
      amount_paid: initialAmountPaid,
      balance_due: balanceDue,
      notes: formData.notes || null,
      created_by: user.id
    })
    .select('id')
    .single();

  if (insertError || !invoiceResult) {
    console.error('Failed to create invoice:', insertError);
    return { error: 'Database error: Could not save the invoice.' };
  }

  // 3. Insert Invoice Items
  const itemsToInsert = itemsDetails.map(item => ({
    ...item,
    organization_id: organizationId,
    invoice_id: invoiceResult.id
  }));

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Failed to create invoice items:', itemsError);
    // Ideally we would rollback the invoice record here using a Stored Procedure or Saga, 
    // but for MVP, we simply log the partial failure. 
    return { error: 'Invoice created, but items failed to save.' };
  }

  // 3.5. Insert into payments if amount_paid > 0
  if (initialAmountPaid > 0) {
      const { error: paymentError } = await supabase.from('payments').insert({
          organization_id: organizationId,
          branch_id: branchId,
          patient_id: formData.patient_id,
          invoice_id: invoiceResult.id,
          amount: initialAmountPaid,
          payment_method: 'other', // Defaulting since we didn't ask 
          payment_date: formData.issue_date,
          reference_number: `AUTO-${invoiceNumber}`,
          notes: 'Initial payment from invoice creation',
          received_by: user.id
      });
      if (paymentError) console.error('Failed to log initial payment:', paymentError);
  }

  // 4. Trigger the Notification automatically
  const formatCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format;
  
  await createSystemNotification({
    organization_id: organizationId,
    title: 'New Invoice Generated',
    message: `Invoice ${invoiceNumber} was generated for ${formatCurrency(totalAmount)}.`,
    type: 'billing',
    link_url: `/billing/${invoiceResult.id}`
  });

  revalidatePath('/billing');
  return { success: true, invoiceId: invoiceResult.id };
}

export async function updateInvoiceStatus(invoiceId: string, status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'void') {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'You must be logged in.' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'Not authorized.' };

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, total_amount, amount_paid, patient_id, branch_id')
    .eq('id', invoiceId)
    .eq('organization_id', membership.organization_id)
    .single();

  if (!invoice) return { error: 'Invoice not found.' };

  const updatePayload: any = { status };
  
  if (status === 'paid') {
     updatePayload.amount_paid = invoice.total_amount;
     updatePayload.balance_due = 0;
     
     // Log the implicit payment if it wasn't already fully paid
     const diff = invoice.total_amount - (invoice.amount_paid || 0);
     if (diff > 0) {
         await supabase.from('payments').insert({
             organization_id: membership.organization_id,
             branch_id: invoice.branch_id,
             patient_id: invoice.patient_id,
             invoice_id: invoice.id,
             amount: diff,
             payment_method: 'other',
             payment_date: new Date().toISOString().split('T')[0],
             reference_number: `STATUS-UPDATE`,
             notes: `Automatically generated from status change to Paid`,
             received_by: user.id
         });
     }
  } else if (status === 'void') {
     updatePayload.balance_due = 0;
  } else if (status === 'issued' || status === 'draft') {
     updatePayload.amount_paid = 0;
     updatePayload.balance_due = invoice.total_amount;
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update(updatePayload)
    .eq('id', invoiceId)
    .eq('organization_id', membership.organization_id);

  if (updateError) {
    console.error('Failed to update invoice:', updateError);
    return { error: 'Database error: Could not update the invoice.' };
  }

  revalidatePath('/billing');
  revalidatePath(`/billing/${invoiceId}`);
  return { success: true };
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'You must be logged in.' };

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return { error: 'Not authorized.' };

  const { error: deleteError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('organization_id', membership.organization_id);

  if (deleteError) {
    console.error('Failed to delete invoice:', deleteError);
    return { error: 'Database error: Could not delete the invoice.' };
  }

  revalidatePath('/billing');
  return { success: true };
}

export async function updateInvoice(invoiceId: string, formData: z.infer<typeof invoiceSchema>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'You must be logged in.' };

  const { data: membershipData, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id, branch_memberships!inner ( branch_id )')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membershipData) return { error: 'No active branch membership found.' };
  const organizationId = membershipData.organization_id;

  // Verify invoice exists and is owned by org
  const { data: oldInvoice } = await supabase
    .from('invoices')
    .select('amount_paid, branch_id')
    .eq('id', invoiceId)
    .eq('organization_id', organizationId)
    .single();

  if (!oldInvoice) return { error: 'Invoice not found' };

  // Calculate totals matching the generic logic
  let subtotal = 0;
  const itemsDetails = formData.items.map(item => {
    const lineTotalBase = item.quantity * item.unit_price;
    subtotal += lineTotalBase;
    return {
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: 5,
      discount_amount: 0,
      line_total: lineTotalBase + (lineTotalBase * 0.05)
    };
  });

  const invoiceDiscount = formData.discount_amount || 0;
  const taxableAmount = Math.max(0, subtotal - invoiceDiscount);
  const totalTax = taxableAmount * 0.05;
  const totalAmount = taxableAmount + totalTax;

  // Dynamic balance calculation based on previously paid amounts and new total
  const newlyPaidAmount = formData.amount_paid || 0;
  const totalAmountPaidInfo = (oldInvoice.amount_paid || 0) + newlyPaidAmount;
  
  let newStatus = formData.status;
  
  if (newStatus === 'paid' && newlyPaidAmount === 0) {
      // If user marks "Paid" without manually typing amount, auto-fill it
      let diff = totalAmount - (oldInvoice.amount_paid || 0);
      if (diff > 0) {
          await supabase.from('payments').insert({
             organization_id: organizationId,
             branch_id: oldInvoice.branch_id,
             patient_id: formData.patient_id,
             invoice_id: invoiceId,
             amount: diff,
             payment_method: 'other',
             payment_date: formData.issue_date,
             reference_number: `EDIT-UPDATE`,
             notes: `Automatically generated from Edit to Paid`,
             received_by: user.id
          });
      }
  } else if (newlyPaidAmount > 0) {
       await supabase.from('payments').insert({
             organization_id: organizationId,
             branch_id: oldInvoice.branch_id,
             patient_id: formData.patient_id,
             invoice_id: invoiceId,
             amount: newlyPaidAmount,
             payment_method: 'other',
             payment_date: formData.issue_date,
             reference_number: `EDIT-UPDATE`,
             notes: `Incremental payment from Edit mode`,
             received_by: user.id
       });
  }

  // Reload the total amount paid directly from DB to be safe, or just compute statically
  const finalAmountPaid = (oldInvoice.amount_paid || 0) + (newStatus === 'paid' && newlyPaidAmount === 0 ? (totalAmount - (oldInvoice.amount_paid || 0)) : newlyPaidAmount);
  let balanceDue = totalAmount - finalAmountPaid;
  
  // Apply logic override to normalize data
  if (balanceDue <= 0 && newStatus !== 'void') {
    balanceDue = 0;
    newStatus = 'paid';
  } else if (finalAmountPaid > 0 && finalAmountPaid < totalAmount && newStatus !== 'void') {
    newStatus = 'partially_paid';
  } else if (newStatus === 'void') {
    balanceDue = 0;
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      patient_id: formData.patient_id,
      treatment_id: formData.treatment_id || null,
      appointment_id: formData.appointment_id || null,
      status: newStatus,
      issue_date: formData.issue_date,
      due_date: formData.due_date || null,
      subtotal: subtotal,
      discount_amount: invoiceDiscount,
      tax_amount: totalTax,
      total_amount: totalAmount,
      amount_paid: finalAmountPaid,
      balance_due: balanceDue,
      notes: formData.notes || null,
    })
    .eq('id', invoiceId)
    .eq('organization_id', organizationId);

  if (updateError) {
    console.error('Failed to update invoice master:', updateError);
    return { error: 'Failed to update invoice master record' };
  }

  // Delete old items and insert new ones
  await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
  
  const itemsToInsert = itemsDetails.map(item => ({
    ...item,
    organization_id: organizationId,
    invoice_id: invoiceId
  }));

  const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);

  if (itemsError) {
    console.error('Failed to replace invoice items:', itemsError);
    return { error: 'Failed to save updated line items.' };
  }

  revalidatePath('/billing');
  revalidatePath(`/billing/${invoiceId}`);
  return { success: true };
}

export async function recordPayment(invoiceId: string, paymentData: { amount: number, payment_method: string, payment_date: string, reference_number?: string, notes?: string }) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'You must be logged in.' };

  const { data: membershipData, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('organization_id, branch_memberships!inner ( branch_id )')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (membershipError || !membershipData) return { error: 'No active branch membership found.' };
  const organizationId = membershipData.organization_id;
  const branchMemberships = membershipData.branch_memberships as any;
  const branchId = Array.isArray(branchMemberships) ? branchMemberships[0]?.branch_id : branchMemberships?.branch_id;

  // 1. Get the current invoice state
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, patient_id, total_amount, balance_due, amount_paid, status')
    .eq('id', invoiceId)
    .eq('organization_id', organizationId)
    .single();

  if (!invoice) return { error: 'Invoice not found.' };

  if (paymentData.amount <= 0) return { error: 'Payment amount must be greater than zero.' };
  if (paymentData.amount > invoice.balance_due) return { error: 'Payment amount exceeds balance due.' };

  // 2. Insert into payments table
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      organization_id: organizationId,
      branch_id: branchId,
      patient_id: invoice.patient_id,
      invoice_id: invoiceId,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_date: paymentData.payment_date,
      reference_number: paymentData.reference_number || null,
      notes: paymentData.notes || null,
      received_by: user.id
    });

  if (paymentError) {
    console.error('Failed to log payment:', paymentError);
    return { error: 'Failed to record the payment transaction.' };
  }

  // 3. Update the invoice balances
  const newAmountPaid = Number(invoice.amount_paid) + paymentData.amount;
  const newBalanceDue = invoice.total_amount - newAmountPaid;
  
  let newStatus = invoice.status;
  if (newBalanceDue <= 0) {
    newStatus = 'paid';
  } else if (newAmountPaid > 0) {
    newStatus = 'partially_paid';
  }

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
      status: newStatus
    })
    .eq('id', invoiceId);

  if (updateError) {
    console.error('Failed to update invoice balances after payment:', updateError);
    // Note: Logging failed, invoice state desynced. Realistically we would use a transaction setup.
    return { error: 'Payment recorded, but failed to update invoice balance natively.' };
  }

  revalidatePath('/billing');
  revalidatePath(`/billing/${invoiceId}`);
  return { success: true };
}
