'use server';

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export type SearchResult = {
  id: string;
  type: 'patient' | 'appointment';
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

    // 2. Search Patients (match name, phone, or patient_code using OR syntax)
    // Supabase OR syntax requires: column.operator.value,column2.operator.value
    // Because we are searching against text, we use `ilike`
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, full_name, patient_code, phone')
      .eq('organization_id', orgId)
      .or(`full_name.ilike.${searchTerm},patient_code.ilike.${searchTerm},phone.ilike.${searchTerm}`)
      .limit(5);

    if (!patientsError && patients) {
      patients.forEach(p => {
        results.push({
          id: p.id,
          type: 'patient',
          title: p.full_name,
          subtitle: `${p.patient_code} ${p.phone ? `• ${p.phone}` : ''}`,
          url: `/patients/${p.id}`,
        });
      });
    }

    // 3. Search Appointments 
    // We will search by appointment title, notes, or patient name natively by joining the patients table
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select(`
        id, 
        title, 
        start_time,
        patients (
          full_name,
          patient_code
        )
      `)
      .eq('organization_id', orgId)
      // Since inner joins are complex with `.or()` in Supabase RPC, 
      // we'll primarily search the appointment title natively here
      .ilike('title', searchTerm)
      .limit(5);

    if (!aptError && appointments) {
      appointments.forEach(apt => {
        const p = apt.patients as any;
        const pName = p && !Array.isArray(p) ? p.full_name : 'Unknown Patient';
        results.push({
          id: apt.id,
          type: 'appointment',
          title: apt.title,
          subtitle: `${format(new Date(apt.start_time), 'PPp')} • ${pName}`,
          url: `/appointments`, // Simplified, could push to a specific appointment ID if we had an edit view
        });
      });
    }

    return { data: results };

  } catch (err: any) {
    console.error("Global search failed:", err);
    return { error: err.message || 'An unexpected error occurred during search.' };
  }
}
