import { createClient } from '@/lib/supabase/server';
import { QueueClient } from './queue-client';
import { redirect } from 'next/navigation';

export default async function QueuePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('default_organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.default_organization_id) redirect('/dashboard');

  // Fetch active doctors (staff with role 'doctor' or 'org_owner')
  const { data: doctors } = await supabase
    .from('organization_memberships')
    .select(`
      id,
      role,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', profile.default_organization_id)
    .eq('status', 'active')
    .in('role', ['doctor', 'org_owner']);

  // Fetch today's queue entries
  const today = new Date().toISOString().split('T')[0];
  const { data: initialEntries } = await supabase
    .from('queue_entries')
    .select(`
      *,
      patients (
        id,
        full_name,
        patient_code
      ),
      appointment_id
    `)
    .eq('organization_id', profile.default_organization_id)
    .gte('created_at', `${today}T00:00:00Z`)
    .order('queue_position', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Waiting Room</h1>
          <p className="text-muted-foreground">Manage real-time patient flow for all doctors.</p>
        </div>
      </div>

      <QueueClient 
        initialDoctors={doctors || []} 
        initialEntries={initialEntries || []} 
        organizationId={profile.default_organization_id}
      />
    </div>
  );
}
