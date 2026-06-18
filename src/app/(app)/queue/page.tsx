import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Queue',
};
import { createClient, getSessionUser, getSessionProfile } from '@/lib/supabase/server';
import { QueueClient } from './queue-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function QueuePage() {
  // Cached — deduplicated with layout
  const [user, profile] = await Promise.all([getSessionUser(), getSessionProfile()]);
  if (!user) redirect('/auth/login');
  if (!profile?.default_organization_id) redirect('/dashboard');

  const orgId = profile.default_organization_id;

  // Fetch doctors and queue entries in parallel — only real extra data this page needs
  const today = new Date().toISOString().split('T')[0];
  const cookieStore = await cookies();
  const selectedBranchId = cookieStore.get('clerixs_selected_branch')?.value;

  const supabase = await createClient();

  let queueQuery = supabase
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
    .eq('organization_id', orgId)
    .gte('created_at', `${today}T00:00:00Z`)
    .order('queue_position', { ascending: true });

  if (selectedBranchId && selectedBranchId !== 'all') {
    queueQuery = queueQuery.eq('branch_id', selectedBranchId);
  }

  const [{ data: doctors }, { data: initialEntries }] = await Promise.all([
    supabase
      .from('organization_memberships')
      .select(`id, role, profiles (id, full_name, avatar_url)`)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .in('role', ['doctor', 'org_owner']),
    queueQuery,
  ]);

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
        organizationId={orgId}
      />
    </div>
  );
}
