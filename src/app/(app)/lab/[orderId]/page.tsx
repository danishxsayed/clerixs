import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { OrderManagementView } from './order-management-view';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function LabOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  // Fetch Lab Order Deep
  const { data: order, error } = await supabase
    .from('lab_orders')
    .select(`
      *, 
      patients(full_name, patient_code, gender, date_of_birth),
      lab_samples(*),
      lab_results(*),
      lab_order_items(
        lab_test_id,
        lab_package_id,
        lab_tests(
          id, 
          name, 
          lab_test_parameters(*)
        ),
        lab_packages(
          id,
          name,
          lab_package_tests(
            lab_tests(
              id,
              name,
              lab_test_parameters(*)
            )
          )
        )
      )
    `)
    .eq('id', resolvedParams.orderId)
    .single();

  if (error || !order) {
    console.error('Failed to fetch order', error);
    return notFound();
  }

  // Flatten tests from order_items (Direct Tests)
  const directTests = order.lab_order_items
    ?.filter((item: any) => item.lab_tests)
    .map((item: any) => item.lab_tests) || [];

  // Flatten tests from order_items (Packages)
  const packageTests = order.lab_order_items
    ?.filter((item: any) => item.lab_packages)
    .flatMap((item: any) => 
      item.lab_packages.lab_package_tests?.map((pt: any) => pt.lab_tests) || []
    ) || [];

  // Combine and deduplicate tests (in case a test is ordered directly AND via a package, though unlikely)
  const allTestsRaw = [...directTests, ...packageTests];
  const uniqueIds = new Set();
  const tests = allTestsRaw.filter(t => {
    if (!t || uniqueIds.has(t.id)) return false;
    uniqueIds.add(t.id);
    return true;
  });

  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full pb-12">
      <div className="flex items-center gap-4 border-b pb-6">
        <Link href="/lab" className="p-2 rounded-md bg-white hover:bg-muted transition-colors border shadow-sm flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Lab Order</h2>
          <p className="text-muted-foreground mt-1">Sample tracking and precise entry of test parameters.</p>
        </div>
      </div>

      <OrderManagementView order={order} tests={tests} />
    </div>
  );
}
