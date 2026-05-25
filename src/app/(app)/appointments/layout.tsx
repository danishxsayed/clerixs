import { requireAuthAndRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  const { authorized } = await requireAuthAndRole(['org_owner', 'doctor', 'receptionist', 'branch_manager']);
  if (!authorized) redirect('/dashboard');
  
  return <>{children}</>;
}
