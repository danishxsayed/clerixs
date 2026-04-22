import { requireAuthAndRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  const { authorized } = await requireAuthAndRole(['org_owner', 'receptionist', 'doctor']);
  if (!authorized) redirect('/dashboard');
  
  return <>{children}</>;
}
