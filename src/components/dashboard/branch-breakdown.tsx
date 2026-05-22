import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export async function BranchBreakdown({ orgId, startDate }: { orgId: string, startDate: Date | null }) {
  const supabase = await createClient();

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('organization_id', orgId);

  if (!branches || branches.length === 0) return null;

  const branchData = await Promise.all(
    branches.map(async (branch) => {
      let patientsQuery = supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('branch_id', branch.id)
        .eq('is_active', true);
      if (startDate) patientsQuery = patientsQuery.gte('created_at', startDate.toISOString());
      
      let cashflowQuery = supabase
        .from('payments')
        .select('amount')
        .eq('organization_id', orgId)
        .eq('branch_id', branch.id);
      if (startDate) cashflowQuery = cashflowQuery.gte('payment_date', startDate.toISOString().split('T')[0]);

      const [{ count: patientsCount }, { data: payments }] = await Promise.all([
        patientsQuery,
        cashflowQuery
      ]);

      const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        id: branch.id,
        name: branch.name,
        patientsCount: patientsCount || 0,
        revenue
      };
    })
  );

  return (
    <Card className="rounded-2xl border-none shadow-sm col-span-full mt-6">
      <CardHeader>
        <CardTitle>Branch Breakdown</CardTitle>
        <CardDescription>Overview across all branches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branchData.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div>
                <h4 className="font-semibold text-lg">{branch.name}</h4>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1 text-orange-500" />
                    {branch.patientsCount} patients
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4 mr-1 text-blue-500" />
                    {branch.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
