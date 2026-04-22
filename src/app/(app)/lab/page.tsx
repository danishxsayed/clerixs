import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, TestTube, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';
import { LabOrderList } from './lab-order-list';
import { LabSkeleton } from './skeleton';

export default async function LabDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  // Get Org ID and Role
  const { data: membership } = await supabase
    .from('organization_memberships')
    .select('organization_id, role')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership || membership.role === 'receptionist') return notFound();

  // Fetch Summary Stats (Always fast, can stay in page)
  const { data: labOrders } = await supabase
    .from('lab_orders')
    .select('status')
    .eq('organization_id', membership.organization_id);

  const pendingCollection = labOrders?.filter(o => o.status === 'ordered')?.length || 0;
  const processing = labOrders?.filter(o => o.status === 'sample_collected' || o.status === 'processing')?.length || 0;
  const completed = labOrders?.filter(o => o.status === 'completed')?.length || 0;

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lab Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage sample collections and enter test results.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -z-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Collection</CardTitle>
            <TestTube className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCollection}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting sample draw</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Processing</CardTitle>
            <FlaskConical className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{processing}</div>
            <p className="text-xs text-muted-foreground mt-1">Samples collected & analyzing</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -z-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Results finalized</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent Lab Orders</h3>

        <Suspense fallback={<LabSkeleton />}>
          <LabOrderList 
            orgId={membership.organization_id} 
          />
        </Suspense>
      </div>
    </div>
  );
}
