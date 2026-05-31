import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TreatmentDetail } from './treatment-detail';

interface DetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TreatmentDetailPage({ params, searchParams }: DetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const treatmentId = resolvedParams.id;
  const addSessionTrigger = resolvedSearchParams?.add_session === 'true';

  const supabase = await createClient();

  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // 2. Fetch profile & active membership
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  const orgId = profile?.default_organization_id;
  if (!orgId) {
    redirect('/onboarding');
  }

  // 3. Fetch Treatment details
  const { data: treatment, error: treatmentErr } = await supabase
    .from('treatments')
    .select(`
      *,
      patients (*)
    `)
    .eq('id', treatmentId)
    .eq('organization_id', orgId)
    .single();

  if (treatmentErr || !treatment) {
    console.error('Treatment loading error:', treatmentErr);
    return notFound();
  }

  // 4. Fetch Sessions for the treatment
  const { data: sessions, error: sessionsErr } = await supabase
    .from('treatment_sessions')
    .select(`
      *,
      doctor:organization_memberships!doctor_membership_id (
        profiles ( full_name )
      )
    `)
    .eq('treatment_id', treatmentId)
    .order('session_date', { ascending: true })
    .order('session_time', { ascending: true });

  // 5. Fetch Active Doctors for selection dropdowns
  const { data: doctorsData } = await supabase
    .from('organization_memberships')
    .select('id, profiles!inner(full_name)')
    .eq('status', 'active')
    .in('role', ['doctor', 'org_owner']);

  const doctors = doctorsData?.map((d: any) => ({
    id: d.id,
    full_name: d.profiles?.full_name || 'Unknown Doctor'
  })).sort((a, b) => a.full_name.localeCompare(b.full_name)) || [];

  // 6. Fetch linked invoices for cost overview
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total_amount, amount_paid')
    .eq('treatment_id', treatmentId);

  // 7. Fetch documents/attachments from patient_files
  const { data: attachments } = await supabase
    .from('patient_files')
    .select('*, uploader:profiles!uploaded_by(full_name)')
    .eq('treatment_id', treatmentId)
    .order('created_at', { ascending: false });

  return (
    <TreatmentDetail
      treatment={treatment}
      sessions={sessions || []}
      doctors={doctors}
      invoices={invoices || []}
      attachments={attachments || []}
      addSessionTrigger={addSessionTrigger}
      currentUserId={user.id}
    />
  );
}
