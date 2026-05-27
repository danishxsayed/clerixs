import * as React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ArrowLeft, FlaskConical, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PrintButton } from '@/components/prescriptions/print-button';
import { Badge } from '@/components/ui/badge';

interface PrintPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function LabReportPrintPage({ params }: PrintPageProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams.orderId;
  const supabase = await createClient();

  // 1. Fetch lab order with deeply nested joins
  const { data: order, error } = await supabase
    .from('lab_orders')
    .select(`
      *,
      organization_memberships(profiles(full_name, phone, default_organization_id)),
      patients(full_name, patient_code, age_snapshot, gender, phone, email, address, date_of_birth),
      organizations(*),
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
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Print Lab Report error:', error);
    return notFound();
  }

  // 2. Fetch the specific Branch for the letterhead address details
  const { data: branch } = await supabase
    .from('branches')
    .select('*')
    .eq('organization_id', order.organization_id)
    .eq('is_active', true)
    .limit(1)
    .single();

  const doctor = order.organization_memberships?.profiles;
  const patient = order.patients;
  const clinic = order.organizations;
  const sample = order.lab_samples?.[0];

  // Helper map for fast result lookup
  const resultsMap: Record<string, any> = {};
  if (order.lab_results && order.lab_results.length > 0) {
    order.lab_results.forEach((r: any) => {
      resultsMap[r.lab_test_parameter_id] = r;
    });
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

  // Combine and deduplicate tests
  const allTestsRaw = [...directTests, ...packageTests];
  const uniqueIds = new Set();
  const tests = allTestsRaw.filter(t => {
    if (!t || uniqueIds.has(t.id)) return false;
    uniqueIds.add(t.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white text-slate-900 pb-20">
      
      {/* Hide controls on print */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm p-4 flex items-center justify-between max-w-4xl mx-auto mt-0 lg:mt-8 rounded-t-xl">
        <Button variant="ghost" asChild>
          <Link href={`/lab/${order.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lab Order
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {order.status !== 'completed' && (
            <Badge variant="destructive" className="mr-2">Draft Mode - Report Not Finalized</Badge>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Actual Printable Document */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 print:p-0 print:shadow-none shadow-sm min-h-[1056px] border print:border-none relative">
        
        {clinic?.letterhead_url ? (
          <div className="mb-8 border-b-2 border-primary/20 pb-4 w-full h-[200px] overflow-hidden relative pointer-events-none select-none print-letterhead-container">
            {clinic.letterhead_url.toLowerCase().includes('.pdf') ? (
              <iframe 
                src={`${clinic.letterhead_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                className="absolute top-0 left-0 w-full h-full border-none pointer-events-none select-none" 
                title="Clinic Letterhead" 
                scrolling="no"
              />
            ) : (
              <img 
                src={clinic.letterhead_url} 
                alt="Clinic Letterhead" 
                className="w-full object-contain max-h-48 print:max-h-64 object-top print-letterhead pointer-events-none select-none" 
                draggable="false" 
              />
            )}
          </div>
        ) : (
          <div className="flex justify-between items-start border-b-2 border-primary/20 pb-6 mb-8 mt-6">
            <div className="flex items-center gap-4">
              <img src="/assets/logo.jpg" alt="Clinic Logo" className="h-16 w-auto max-w-[150px] object-contain rounded-lg" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">
                  {clinic?.name || 'Medical Clinic'}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">
                  {branch?.address_line1} {branch?.address_line2 ? `, ${branch.address_line2}` : ''}
                </p>
                <p className="text-muted-foreground text-sm font-medium">
                  {branch?.city}, {branch?.state} {branch?.pincode}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <p><strong>Phone:</strong> {branch?.phone || 'Not available'}</p>
              <p><strong>Email:</strong> {branch?.email || 'Not available'}</p>
              <p><strong>GSTIN:</strong> {branch?.gstin || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight uppercase">Laboratory Report</h2>
        </div>

        {/* Patient Metadata */}
        <div className="grid grid-cols-2 gap-8 mb-8 border border-muted/50 rounded-xl p-6 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Patient Details</h3>
            <p className="text-lg font-bold">{patient?.full_name}</p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">ID: </span>{patient?.patient_code}
            </p>
            <p className="text-sm mt-0.5">
              <span className="text-muted-foreground">Age/Sex: </span>
              {patient?.date_of_birth ? `${Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / 31557600000)} Y` : 'N/A'} / {patient?.gender ? patient.gender.charAt(0).toUpperCase() : 'N/A'}
            </p>
            <p className="text-sm mt-0.5">
              <span className="text-muted-foreground">Contact: </span>{patient?.phone || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Details</h3>
            <p className="text-lg font-bold text-primary">SID: {sample?.barcode || order.id.split('-')[0].toUpperCase()}</p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Collected: </span>{sample?.collected_at ? format(new Date(sample.collected_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}
            </p>
            <p className="text-sm mt-0.5">
              <span className="text-muted-foreground">Reported: </span>{order.status === 'completed' ? format(new Date(order.updated_at), 'dd MMM yyyy, hh:mm a') : 'Pending'}
            </p>
            <p className="text-sm mt-0.5">
              <span className="text-muted-foreground">Referred By: </span>{doctor?.full_name || 'Self'}
            </p>
          </div>
        </div>

        {/* Lab Results Table */}
        <div className="mb-8 min-h-[400px]">
          {tests.map((test: any, testIdx: number) => {
            const params = test.lab_test_parameters?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
            if (params.length === 0) return null;

            return (
              <div key={test.id} className="mb-8">
                <h3 className="text-lg font-bold border-b-2 border-slate-200 pb-2 mb-4 text-slate-800 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary" /> {test.name}
                </h3>
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 font-semibold border-b">
                    <tr>
                      <th className="px-2 py-2">Test Parameter</th>
                      <th className="px-2 py-2">Result</th>
                      <th className="px-2 py-2">Unit</th>
                      <th className="px-2 py-2">Reference Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((param: any) => {
                      const res = resultsMap[param.id];
                      const val = res?.result_value || '-';
                      const isAbnormal = res?.is_abnormal || false;

                      let refInterval = '-';
                      if (param.reference_range_min || param.reference_range_max) {
                        refInterval = `${param.reference_range_min || ''} - ${param.reference_range_max || ''}`;
                      } else if (param.expected_string_value) {
                        refInterval = param.expected_string_value;
                      }

                      return (
                        <tr key={param.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-2 py-3 font-medium text-slate-700">{param.name}</td>
                          <td className={`px-2 py-3 font-bold ${isAbnormal ? 'text-red-600' : 'text-slate-900'}`}>
                            {val} {isAbnormal && <AlertTriangle className="inline w-3 h-3 ml-1 mb-1 text-red-500" />}
                          </td>
                          <td className="px-2 py-3 text-slate-600">{param.unit || '-'}</td>
                          <td className="px-2 py-3 text-slate-600">{refInterval}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Footer & Signature block */}
        <div className="mt-20 pt-8 flex justify-between items-end">
           <div className="text-sm text-muted-foreground w-2/3">
             {order.doctor_comments && (
               <div className="mb-4">
                 <p className="font-bold text-slate-800">Medical Interpretation:</p>
                 <p className="mt-1 text-slate-700 italic">"{order.doctor_comments}"</p>
               </div>
             )}
             <p className="font-semibold text-slate-700">{order.doctor_comments ? 'Technician Notes:' : 'Comments / Notes:'}</p>
             <p className="mt-1">{order.notes || 'End of Report'}</p>
             <p className="mt-6 text-xs italic">
               * This report has been electronically validated by {doctor?.full_name || 'the department head'}. Test results belong to the submitted specimen only.
             </p>
           </div>
           <div className="text-center flex flex-col items-center">
             <div className="border-b-2 border-slate-300 w-48 mb-2 pb-2 h-20 flex items-end justify-center relative">
               {clinic?.signature_url ? (
                 <img 
                   src={clinic.signature_url} 
                   alt="Authorized Signature" 
                   className="absolute bottom-0 max-h-16 max-w-[180px] object-contain mix-blend-multiply" 
                 />
               ) : (
                 <span className="text-muted-foreground/30 text-xs italic pb-2">Val. Electronically</span>
               )}
             </div>
             <p className="font-bold">Laboratory Pathologist</p>
             <p className="text-sm text-muted-foreground">Authorized Signature</p>
           </div>
        </div>

      </div>
    </div>
  );
}
