import * as React from 'react';
import { notFound } from 'next/navigation';
import { getVisitSummaryData } from '@/app/(app)/appointments/actions';
import { format } from 'date-fns';
import { ArrowLeft, Stethoscope, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PrintButton } from '@/components/prescriptions/print-button';
import { Metadata } from 'next';

interface VisitSummaryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VisitSummaryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { success, data } = await getVisitSummaryData(resolvedParams.id);
  
  if (success && data?.appointment?.patients) {
    const patientName = data.appointment.patients.full_name.replace(/\s+/g, '-');
    const date = format(new Date(data.appointment.appointment_date), 'yyyy-MM-dd');
    return {
      title: `Visit-Summary-${patientName}-${date}`,
    };
  }
  
  return { title: 'Visit Summary' };
}

export default async function VisitSummaryPage({ params }: VisitSummaryPageProps) {
  const resolvedParams = await params;
  const appointmentId = resolvedParams.id;

  const { success, data, error } = await getVisitSummaryData(appointmentId);

  if (!success || error || !data || !data.appointment) {
    console.error('Visit Summary Fetch Error:', error);
    return notFound();
  }

  const {
    appointment,
    orgData,
    branchData,
    labOrders,
    invoices,
    prescription,
    nextAppointment
  } = data;

  const patient = appointment.patients;
  const doctor = appointment.organization_memberships?.profiles;

  // Invoice calculations
  let invoiceSubtotal = 0;
  let invoiceDiscount = 0;
  let invoiceTax = 0;
  let invoiceTotal = 0;
  let invoicePaid = 0;
  if (invoices && invoices.length > 0) {
    invoices.forEach((inv: any) => {
       invoiceSubtotal += inv.subtotal_amount || 0;
       invoiceDiscount += inv.discount_amount || 0;
       invoiceTax += inv.tax_amount || 0;
       invoiceTotal += inv.total_amount || 0;
       invoicePaid += inv.amount_paid || 0;
    });
  }
  const invoiceBalance = invoiceTotal - invoicePaid;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white text-slate-900 pb-20">
      
      {/* Controls */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm p-4 flex items-center justify-between max-w-4xl mx-auto mt-0 lg:mt-8 rounded-t-xl">
        <Button variant="ghost" asChild>
          <Link href={`/appointments/${appointmentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointment
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <PrintButton />
        </div>
      </div>

      {/* A4 Print Document (approx 210x297mm proportions) */}
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 print:p-0 print:shadow-none shadow-sm min-h-[1056px] border print:border-none relative">
        
        {/* HEADER: Letterhead */}
        {orgData?.letterhead_url ? (
          <div className="mb-8 border-b-2 border-primary/20 pb-4 w-full aspect-[10/1] overflow-hidden relative pointer-events-none select-none print-letterhead-container">
            {orgData.letterhead_url.toLowerCase().includes('.pdf') ? (
              <iframe 
                src={`${orgData.letterhead_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                className="absolute top-0 left-0 w-full h-full border-none pointer-events-none select-none" 
                title="Clinic Letterhead" 
                scrolling="no"
              />
            ) : (
              <img 
                src={orgData.letterhead_url} 
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
                  {orgData?.name || 'Medical Clinic'}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">
                  {branchData?.address_line1} {branchData?.address_line2 ? `, ${branchData.address_line2}` : ''}
                </p>
                <p className="text-muted-foreground text-sm font-medium">
                  {branchData?.city}, {branchData?.state} {branchData?.pincode}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <p><strong>Phone:</strong> {branchData?.phone || 'Not available'}</p>
              <p><strong>Email:</strong> {branchData?.email || 'Not available'}</p>
              <p><strong>GSTIN:</strong> {branchData?.gstin || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 inline-block">Patient Visit Summary</h2>
        </div>

        {/* Patient & Visit Information */}
        <div className="grid grid-cols-2 gap-8 mb-8 border border-muted/50 rounded-xl p-6 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Patient Details</h3>
            <p className="text-lg font-bold">{patient?.full_name}</p>
            <p className="text-sm text-muted-foreground mt-1">ID: {patient?.patient_code}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {patient?.age_snapshot ? `${patient.age_snapshot} yrs` : 'Age N/A'} • {patient?.gender ? patient.gender.replace('_', ' ') : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{patient?.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Visit Information</h3>
            <p className="text-lg font-bold text-primary">Date: {format(new Date(appointment.appointment_date), 'PPP')}</p>
            <p className="text-sm font-medium mt-1">Time: {appointment.start_time}</p>
            <p className="text-sm font-medium mt-0.5">Consulting Doctor: {doctor?.full_name || 'N/A'}</p>
          </div>
        </div>

        {/* CLINICAL NOTES */}
        <div className="mb-8 p-4 py-2 border-l-4 border-primary bg-primary/5 rounded-r-lg">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Clinical Notes & Diagnosis</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Chief Complaint / Reason</p>
              <p className="text-sm font-medium">{appointment.chief_complaint || 'N/A'}</p>
            </div>
            {(appointment.notes || prescription?.diagnosis) && (
              <div className="pt-2 border-t border-primary/10">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Physician Notes / Diagnosis</p>
                {prescription?.diagnosis && <p className="text-sm mb-1"><span className="font-medium text-slate-700">Diagnosis:</span> {prescription.diagnosis}</p>}
                {appointment.notes && <p className="text-sm text-slate-700 whitespace-pre-wrap">{appointment.notes}</p>}
              </div>
            )}
          </div>
        </div>

        {/* PRESCRIPTION SECTION */}
        {prescription && prescription.prescription_items?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 flex items-center">
              <span className="text-primary mr-2">⚕</span> Medication Rx
            </h3>
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b">Medicine Name</th>
                    <th className="px-4 py-3 border-b">Dosage</th>
                    <th className="px-4 py-3 border-b">Frequency</th>
                    <th className="px-4 py-3 border-b">Duration</th>
                    <th className="px-4 py-3 border-b">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.prescription_items.map((item: any, idx: number) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                      <td className="px-4 py-3 border-b font-medium text-slate-800">{item.medicine_name}</td>
                      <td className="px-4 py-3 border-b">{item.dosage}</td>
                      <td className="px-4 py-3 border-b">{item.frequency}</td>
                      <td className="px-4 py-3 border-b">{item.duration_days} Days</td>
                      <td className="px-4 py-3 border-b text-muted-foreground">{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {prescription.instructions && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg text-sm text-amber-900 border border-amber-100">
                <span className="font-bold block mb-1">General Advice / Next Steps:</span>
                <span className="whitespace-pre-wrap">{prescription.instructions}</span>
              </div>
            )}
          </div>
        )}

        {/* LAB REPORTS SECTION */}
        {labOrders && labOrders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Laboratory Orders & Results</h3>
            <div className="space-y-6">
              {labOrders.map((order: any, idx: number) => {
                const resultsMap = order.lab_results?.reduce((acc: any, res: any) => ({ ...acc, [res.lab_test_parameter_id]: res }), {}) || {};
                
                // Flatten tests for display
                const allTests: any[] = [];
                order.lab_order_items?.forEach((item: any) => {
                  if (item.lab_tests) allTests.push(item.lab_tests);
                  if (item.lab_packages?.lab_package_tests) {
                    item.lab_packages.lab_package_tests.forEach((pkgTest: any) => {
                      if (pkgTest.lab_tests) allTests.push({ ...pkgTest.lab_tests, fromPackage: item.lab_packages.name });
                    });
                  }
                });

                return (
                  <div key={order.id} className="border rounded-xl p-0 overflow-hidden break-inside-avoid">
                    <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center text-sm">
                      <span className="font-bold">Order #{order.id.split('-')[0].toUpperCase()}</span>
                      <span className="text-muted-foreground px-2 py-0.5 bg-slate-200 rounded text-xs font-semibold capitalize">{order.status}</span>
                    </div>
                    {allTests.map((test, tIdx) => (
                      <div key={tIdx} className={tIdx > 0 ? 'border-t' : ''}>
                        <div className="px-4 py-2 bg-slate-50/50 font-semibold text-sm text-slate-700">
                          {test.name} {test.fromPackage && <span className="font-normal text-xs text-muted-foreground ml-2">(from {test.fromPackage})</span>}
                        </div>
                        {(!test.lab_test_parameters || test.lab_test_parameters.length === 0) ? (
                            <div className="px-4 py-3 text-xs text-muted-foreground italic">No parameters measured.</div>
                        ) : (
                          <div className="px-4 py-2 text-sm grid grid-cols-12 gap-4 text-slate-500 font-semibold border-b last:border-0 border-slate-100 uppercase tracking-wider text-[10px]">
                            <div className="col-span-4">Parameter</div>
                            <div className="col-span-4">Result</div>
                            <div className="col-span-4">Ref Range</div>
                          </div>
                        )}
                        <div className="divide-y divide-slate-50">
                          {test.lab_test_parameters?.sort((a: any, b: any) => a.display_order - b.display_order).map((param: any) => {
                             const res = resultsMap[param.id];
                             return (
                               <div key={param.id} className={`px-4 py-2 text-sm grid grid-cols-12 gap-4 items-center ${res?.is_abnormal ? 'bg-red-50 text-red-900' : ''}`}>
                                  <div className="col-span-4 font-medium flex items-center gap-1">
                                    {param.name} {res?.is_abnormal && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                  </div>
                                  <div className="col-span-4 font-bold">
                                    {res?.result_value ? `${res.result_value} ${param.unit || ''}` : <span className="text-muted-foreground italic font-normal">Pending</span>}
                                  </div>
                                  <div className="col-span-4 text-xs text-muted-foreground">
                                    {param.reference_range_min || param.reference_range_max
                                      ? `${param.reference_range_min || ''} - ${param.reference_range_max || ''} ${param.unit || ''}`
                                      : param.expected_string_value ? `Expected: ${param.expected_string_value}` : '-'
                                    }
                                  </div>
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BILLING SECTION */}
        {invoices && invoices.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Billing Statement</h3>
            
            <div className="border rounded-lg overflow-hidden break-inside-avoid">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50">
                  <tr className="text-slate-500 uppercase text-xs font-semibold tracking-wider">
                    <th className="px-4 py-3 border-b">Item Details</th>
                    <th className="px-4 py-3 border-b text-center">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv: any) => (
                    inv.invoice_items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 flex flex-col">
                          <span className="font-medium">{item.item_name}</span>
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-center align-top whitespace-nowrap pt-4">₹{(item.unit_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))
                  ))}
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-3 text-right font-semibold text-slate-600">Subtotal</td>
                    <td className="px-4 py-3 text-center font-medium">₹{invoiceSubtotal.toFixed(2)}</td>
                  </tr>
                  {invoiceDiscount > 0 && (
                    <tr className="bg-slate-50/50 text-green-700">
                      <td className="px-4 py-3 text-right font-semibold">Discount</td>
                      <td className="px-4 py-3 text-center font-medium">- ₹{invoiceDiscount.toFixed(2)}</td>
                    </tr>
                  )}
                  {invoiceTax > 0 && (
                    <tr className="bg-slate-50/50">
                      <td className="px-4 py-3 text-right font-semibold text-slate-600">Tax</td>
                      <td className="px-4 py-3 text-center font-medium">₹{invoiceTax.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-100">
                    <td className="px-4 py-4 text-right font-bold text-slate-900 uppercase">Grand Total</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900 text-base border-l border-white">₹{invoiceTotal.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-50/80">
                    <td className="px-4 py-3 text-right font-medium text-slate-600">Amount Paid</td>
                    <td className="px-4 py-3 text-center font-medium text-green-600 border-l border-white">₹{invoicePaid.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-3 text-right font-bold text-slate-800 uppercase tracking-widest text-xs">Balance Due</td>
                    <td className={`px-4 py-3 text-center font-bold text-base border-l border-white ${invoiceBalance > 0 ? 'text-red-600' : 'text-slate-500'}`}>₹{invoiceBalance.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        )}

        {/* FOOTER: Signature & Next Appointment */}
        <div className="mt-16 pt-8 break-inside-avoid">
           <div className="grid grid-cols-2 gap-8 items-end">
              <div>
                {nextAppointment ? (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg inline-block">
                    <p className="text-xs uppercase tracking-wider font-bold text-blue-800 mb-1">Follow-up Appointment</p>
                    <p className="font-semibold text-slate-800">{format(new Date(nextAppointment.appointment_date), 'PPP')} at {nextAppointment.start_time}</p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic mb-4 mt-8">
                    Thank you for visiting {orgData?.name || 'our clinic'}. 
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-6 space-y-1">
                  <p>Generated on: {format(new Date(), 'PPp')}</p>
                  <p>This is a computer-generated summary.</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="border-b-2 border-slate-300 w-48 mb-2 pb-2 h-20 flex items-end justify-center relative">
                  {orgData?.signature_url ? (
                    <img 
                      src={orgData.signature_url} 
                      alt="Clinic Signature" 
                      className="absolute bottom-0 right-0 max-h-16 max-w-[180px] object-contain mix-blend-multiply" 
                    />
                  ) : (
                    <span className="text-muted-foreground/30 text-xs italic pb-2 text-center w-full">Digitally Signed</span>
                  )}
                </div>
                <p className="font-bold">{doctor?.full_name}</p>
                <p className="text-sm text-muted-foreground">Authorized Signature</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
