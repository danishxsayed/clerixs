import { requireAuthAndRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { authorized } = await requireAuthAndRole(['org_owner', 'doctor', 'receptionist']);
  if (!authorized) redirect('/dashboard');
  
  return <>{children}</>;
}
