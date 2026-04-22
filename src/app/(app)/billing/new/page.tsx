import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { InvoiceCreateForm } from './invoice-create-form';
import { getCatalogItems } from '@/app/(app)/settings/price-catalog-actions';

export default async function NewInvoicePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ patient_id?: string, appointment_id?: string }> 
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const initialPatientId = resolvedSearchParams.patient_id;
  const initialAppointmentId = resolvedSearchParams.appointment_id;

  // Fetch all patients for selection
  const { data: patients, error: patientError } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name');

  // We could also fetch recent treatments to auto-fill an invoice, but we'll stick to a simple patient selection for now.
  if (patientError) {
    console.error('Failed to fetch patients for invoice form:', patientError);
  }

  let initialDoctorName = null;
  if (initialAppointmentId) {
    const { data: appt } = await supabase
      .from('appointments')
      .select(`
        organization_memberships!doctor_membership_id(
          profiles(full_name)
        )
      `)
      .eq('id', initialAppointmentId)
      .single();

    const orgMemObj = appt?.organization_memberships ? (Array.isArray(appt.organization_memberships) ? appt.organization_memberships[0] : appt.organization_memberships) : null;
    const profObj = orgMemObj?.profiles ? (Array.isArray(orgMemObj.profiles) ? orgMemObj.profiles[0] : orgMemObj.profiles) : null;

    if (profObj?.full_name) {
      initialDoctorName = `Dr. ${profObj.full_name}`;
    }
  }

  const { items: catalogItems } = await getCatalogItems();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Create New Invoice</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <InvoiceCreateForm 
          patients={patients || []} 
          catalogItems={catalogItems || []}
          initialPatientId={initialPatientId}
          initialAppointmentId={initialAppointmentId}
          initialDoctorName={initialDoctorName}
        />
      </div>
    </div>
  );
}
