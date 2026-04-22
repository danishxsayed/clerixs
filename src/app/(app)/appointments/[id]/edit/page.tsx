import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppointmentEditForm } from './appointment-edit-form';

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch the appointment. RLS ensures they can only fetch it if it belongs to their org.
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('*, patients!inner(full_name)')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !appointment) {
    console.error('Failed to fetch appointment for editing:', error);
    notFound();
  }

  // Also fetch all patients so they can change the patient if needed
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name');

  // Fetch all active doctors for this organization
  const { data: dData, error: dError } = await supabase
    .from('organization_memberships')
    .select('id, profiles!inner(full_name)')
    .eq('role', 'doctor')
    .eq('status', 'active');
  const doctors = dData ? dData.map((d: any) => ({
    id: d.id,
    full_name: d.profiles?.full_name || 'Unknown Doctor'
  })).sort((a: any, b: any) => a.full_name.localeCompare(b.full_name)) : [];

  // Fetch active price catalog items
  const { data: catalogItems } = await supabase
    .from('price_catalog')
    .select('name, category')
    .eq('organization_id', appointment.organization_id)
    .eq('is_active', true)
    .order('name');

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Edit Appointment</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
        <p className="text-muted-foreground mb-6">Update scheduling details for this appointment.</p>
        
        <AppointmentEditForm 
          appointment={appointment} 
          patients={patients || []} 
          doctors={doctors}
          catalogItems={catalogItems || []} 
        />
      </div>
    </div>
  );
}
