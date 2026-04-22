import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { InvoiceEditForm } from './invoice-edit-form';

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) return notFound();

  // Fetch the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', resolvedParams.id)
    .eq('organization_id', membership.organization_id)
    .single();

  if (invoiceError || !invoice) return notFound();

  // Fetch all patients for the patient dropdown
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('organization_id', membership.organization_id)
    .order('full_name');

  if (patientsError) return notFound();

  // Fetch price catalog for line item autocomplete
  const { data: catalogItems } = await supabase
    .from('price_catalog')
    .select('name, price')
    .eq('organization_id', membership.organization_id)
    .eq('is_active', true)
    .order('name');

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Invoice</h2>
        <p className="text-muted-foreground mt-2">Modify the details of invoice {invoice.invoice_number}</p>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <InvoiceEditForm 
          invoice={invoice} 
          patients={patients || []} 
          catalogItems={catalogItems || []} 
        />
      </div>
    </div>
  );
}
