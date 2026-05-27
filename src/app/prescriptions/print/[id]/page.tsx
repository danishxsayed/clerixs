import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PrintButton } from '@/components/prescriptions/print-button';

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionPrintPage({ params }: PrintPageProps) {
  const resolvedParams = await params;
  const prescriptionId = resolvedParams.id;
  const supabase = await createClient();

  // Validate Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // 1. Fetch prescription with extremely deep nested joins
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      organization_memberships(profiles(full_name, phone, default_organization_id)),
      patients(full_name, patient_code, age_snapshot, gender, phone, email, address),
      prescription_items(*),
      organizations(*)
    `)
    .eq('id', prescriptionId)
    .single();

  if (error || !prescription) {
    console.error('Print Rx error:', error);
    return notFound();
  }

  // 2. Fetch the specific Branch to put on the letterhead
  const { data: branch } = await supabase
    .from('branches')
    .select('*')
    .eq('organization_id', prescription.organization_id)
    .eq('is_active', true)
    .limit(1)
    .single();

  const doctor = prescription.organization_memberships?.profiles;
  const patient = prescription.patients;
  const clinic = prescription.organizations;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white text-slate-900 pb-20">
      {/* Inject custom print isolation styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything in the document by default */
          body * {
            visibility: hidden;
          }
          /* Show only the prescription container and its children */
          .print-prescription-container, .print-prescription-container * {
            visibility: visible;
          }
          /* Align container at the absolute top-left without borders or shadows */
          .print-prescription-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none !important;
            box-shadow: none !important;
          }
          /* Fix browser print engine scaling bug for letterhead image */
          .print-letterhead {
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            display: block !important;
          }
        }
      ` }} />
      
      {/* Hide controls on print */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm p-4 flex items-center justify-between max-w-4xl mx-auto mt-0 lg:mt-8 rounded-t-xl">
        <Button variant="ghost" asChild>
          <Link href={`/patients/${prescription.patient_id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patient
          </Link>
        </Button>
        <PrintButton />
      </div>

      {/* Actual Printable Document Container */}
      <div className="print-prescription-container max-w-4xl mx-auto bg-white p-8 md:p-12 print:p-0 print:shadow-none shadow-sm min-h-[1056px] border print:border-none relative">
        
        {clinic?.letterhead_url ? (
          <div className="mb-8 border-b-2 border-primary/20 pb-4">
            {clinic.letterhead_url.toLowerCase().includes('.pdf') ? (
              <iframe src={`${clinic.letterhead_url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-48 print:h-64 border-none" title="Clinic Letterhead" />
            ) : (
              <img 
                src={clinic.letterhead_url} 
                alt="Clinic Letterhead" 
                className="w-full h-auto max-h-[100px] object-contain object-top print-letterhead" 
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

        {/* Prescription Metadata */}
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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Prescription Details</h3>
            <p className="text-lg font-bold text-primary">Rx-{prescription.id.split('-')[0].toUpperCase()}</p>
            <p className="text-sm font-medium mt-1">Date: {format(new Date(prescription.created_at), 'PPP')}</p>
            <p className="text-sm font-medium mt-0.5">Doctor: {doctor?.full_name}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold border-b pb-2 mb-4 flex items-center">
            <span className="text-primary mr-2">⚕</span> Clinical Diagnosis
          </h2>
          <p className="text-slate-700 whitespace-pre-wrap">{prescription.diagnosis || 'No specific diagnosis recorded.'}</p>
        </div>

        {/* Medicines Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Medications Rx</h2>
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 border-b">Medicine Name</th>
                  <th className="px-4 py-3 border-b">Dosage</th>
                  <th className="px-4 py-3 border-b">Frequency</th>
                  <th className="px-4 py-3 border-b">Duration</th>
                  <th className="px-4 py-3 border-b">Notes</th>
                </tr>
              </thead>
              <tbody>
                {prescription.prescription_items?.map((item: any, idx: number) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    <td className="px-4 py-3 border-b font-medium">{item.medicine_name}</td>
                    <td className="px-4 py-3 border-b">{item.dosage}</td>
                    <td className="px-4 py-3 border-b">{item.frequency}</td>
                    <td className="px-4 py-3 border-b">{item.duration_days} Days</td>
                    <td className="px-4 py-3 border-b text-muted-foreground">{item.notes || '-'}</td>
                  </tr>
                ))}
                {(!prescription.prescription_items || prescription.prescription_items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic border-b">
                      No medications prescribed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Instructions */}
        {prescription.instructions && (
          <div className="mb-12">
            <h2 className="text-lg font-bold border-b pb-2 mb-4">General Advice / Next Steps</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{prescription.instructions}</p>
          </div>
        )}

        {/* Footer & Signature block */}
        <div className="mt-20 pt-8 flex justify-between items-end">
          <div className="text-sm text-muted-foreground">
            <p>This is a computer-generated document and does not require a physical stamp inside Clerixs networks.</p>
            <p className="mt-1">Generated: {format(new Date(), 'PPp')}</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="border-b-2 border-slate-300 w-48 mb-2 pb-2 h-20 flex items-end justify-center relative">
              {clinic?.signature_url ? (
                <img 
                  src={clinic.signature_url} 
                  alt="Clinic Signature" 
                  className="absolute bottom-0 max-h-16 max-w-[180px] object-contain mix-blend-multiply" 
                />
              ) : (
                <span className="text-muted-foreground/30 text-xs italic pb-2">Not Electronically Signed</span>
              )}
            </div>
            <p className="font-bold">{doctor?.full_name}</p>
            <p className="text-sm text-muted-foreground">Authorized Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
}
