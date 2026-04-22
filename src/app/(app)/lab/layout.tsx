import { requireAuthAndRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const { authorized } = await requireAuthAndRole(['org_owner', 'doctor', 'laboratory']);
  if (!authorized) redirect('/dashboard');
  
  return <>{children}</>;
}
