import { requireAuthAndRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function FilesLayout({ children }: { children: React.ReactNode }) {
  const { authorized } = await requireAuthAndRole(['org_owner']);
  if (!authorized) redirect('/dashboard');
  
  return <>{children}</>;
}
