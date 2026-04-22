import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FlaskConical } from 'lucide-react';

interface LabOrderListProps {
  orgId: string;
}

export async function LabOrderList({ orgId }: LabOrderListProps) {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('lab_orders')
    .select('*, patients(full_name, patient_code), lab_samples(status, sample_type), lab_order_items(lab_test_id, lab_tests(name))')
    .eq('organization_id', orgId)
    .order('order_date', { ascending: false });

  const { data: labOrders, error } = await dbQuery;

  if (error) {
    return <div className="p-6 text-red-500 text-sm">Error loading orders: {error.message}</div>;
  }

  if (!labOrders || labOrders.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center bg-card rounded-xl border border-dashed">
        <FlaskConical className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
        <p className="text-muted-foreground">No lab orders found for this status.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden whitespace-nowrap overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted bg-opacity-50 text-muted-foreground">
          <TableRow>
            <TableHead className="w-[100px] py-4">Order ID</TableHead>
            <TableHead className="py-4">Date</TableHead>
            <TableHead className="py-4">Patient</TableHead>
            <TableHead className="py-4">Tests</TableHead>
            <TableHead className="py-4">Sample Type</TableHead>
            <TableHead className="py-4">Status</TableHead>
            <TableHead className="text-right py-4 shadow-[inset_1px_0_0_0_rgba(255,255,255,0.1)]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {labOrders.map(order => {
            const tests = order.lab_order_items?.map((item: any) => item.lab_tests?.name).filter(Boolean).join(', ') || '-';
            const samples = order.lab_samples;
            const sampleType = samples?.length > 0 ? samples[0].sample_type : '-';
            
            return (
              <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs">{order.id.split('-')[0].toUpperCase()}</TableCell>
                <TableCell>{format(new Date(order.order_date), 'MMM d, h:mm a')}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{order.patients?.full_name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{order.patients?.patient_code}</div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={tests}>
                  {order.is_external ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      External Report
                    </Badge>
                  ) : tests}
                </TableCell>
                <TableCell>{order.is_external ? 'Uploaded Document' : sampleType}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'ordered' ? 'outline' : order.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.is_external ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={order.external_report_url} target="_blank" rel="noopener noreferrer">View Report</a>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/lab/${order.id}`}>Manage Details</Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
