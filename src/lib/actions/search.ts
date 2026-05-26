'use server';

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export type SearchResult = {
  id: string;
  type: 'patient' | 'appointment' | 'invoice';
  title: string;
  subtitle: string;
  url: string;
};

export async function globalSearch(query: string): Promise<{ data?: SearchResult[], error?: string }> {
  if (!query || query.length < 2) return { data: [] };

  try {
    const supabase = await createClient();
    
    // 1. Authenticate user and get default organization
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.default_organization_id) return { error: 'No active organization found' };
    const orgId = profile.default_organization_id;

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    // 2. Search Patients concurrently/sequentially (match name, phone, or email)
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, full_name, patient_code, phone, email')
      .eq('organization_id', orgId)
      .or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(5);

    if (patientsError) {
      console.error("Patients search query failed:", patientsError);
    }

    if (!patientsError && patients) {
      patients.forEach(p => {
        results.push({
          id: p.id,
          type: 'patient',
          title: p.full_name,
          subtitle: `${p.patient_code}${p.phone ? ` • ${p.phone}` : ''}${p.email ? ` • ${p.email}` : ''}`,
          url: `/patients/${p.id}`,
        });
      });
    }

    const matchedPatientIds = patients?.map(p => p.id) || [];

    // 3. Search Appointments simultaneously (by patient name, treatment)
    let appointmentQuery = supabase
      .from('appointments')
      .select(`
        id, 
        chief_complaint, 
        appointment_date,
        start_time,
        patients (
          full_name,
          patient_code
        )
      `)
      .eq('organization_id', orgId);

    if (matchedPatientIds.length > 0) {
      appointmentQuery = appointmentQuery.or(`chief_complaint.ilike.${searchTerm},patient_id.in.(${matchedPatientIds.join(',')})`);
    } else {
      appointmentQuery = appointmentQuery.ilike('chief_complaint', searchTerm);
    }

    const { data: appointments, error: aptError } = await appointmentQuery.limit(5);

    if (aptError) {
      console.error("Appointments search query failed:", aptError);
    }

    if (!aptError && appointments) {
      appointments.forEach(apt => {
        const p = apt.patients as any;
        const pName = p && !Array.isArray(p) ? p.full_name : 'Unknown Patient';
        const pCode = p && !Array.isArray(p) ? p.patient_code : '';
        results.push({
          id: apt.id,
          type: 'appointment',
          title: apt.chief_complaint || 'Consultation',
          subtitle: `${pName}${pCode ? ` (${pCode})` : ''} • ${apt.appointment_date} ${apt.start_time?.slice(0, 5) || ''}`,
          url: `/appointments/${apt.id}`,
        });
      });
    }

    // 4. Search Invoices simultaneously (by invoice number, patient name)
    let invoiceQuery = supabase
      .from('invoices')
      .select(`
        id, 
        invoice_number, 
        total_amount,
        issue_date,
        patients (
          full_name,
          patient_code
        )
      `)
      .eq('organization_id', orgId);

    if (matchedPatientIds.length > 0) {
      invoiceQuery = invoiceQuery.or(`invoice_number.ilike.${searchTerm},patient_id.in.(${matchedPatientIds.join(',')})`);
    } else {
      invoiceQuery = invoiceQuery.ilike('invoice_number', searchTerm);
    }

    const { data: invoices, error: invError } = await invoiceQuery.limit(5);

    if (invError) {
      console.error("Invoices search query failed:", invError);
    }

    if (!invError && invoices) {
      invoices.forEach(inv => {
        const p = inv.patients as any;
        const pName = p && !Array.isArray(p) ? p.full_name : 'Unknown Patient';
        results.push({
          id: inv.id,
          type: 'invoice',
          title: `Invoice #${inv.invoice_number}`,
          subtitle: `${pName} • INR ${inv.total_amount} • Issued ${inv.issue_date}`,
          url: `/billing/${inv.id}`,
        });
      });
    }

    return { data: results };

  } catch (err: any) {
    console.error("Global search failed:", err);
    return { error: err.message || 'An unexpected error occurred during search.' };
  }
}
