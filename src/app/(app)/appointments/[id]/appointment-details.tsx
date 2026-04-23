import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAppointmentDetails } from '../actions';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { AppointmentActionButtons } from '../appointment-action-buttons';
import { Clock, Calendar, User, FileText, Stethoscope, Activity, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FeatureLock } from '@/components/subscription/FeatureLock';
import { ClinicalNotesEditor } from './clinical-notes-editor';

interface AppointmentDetailsProps {
  id: string;
}

export async function AppointmentDetails({ id }: AppointmentDetailsProps) {
  const result = await getAppointmentDetails(id);

  if (result.error || !result.data) {
    return notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('default_organization_id').eq('id', user.id).single();
  const { data: membership } = await supabase.from('organization_memberships').select('role').eq('organization_id', profile?.default_organization_id).eq('profile_id', user.id).single();
  const role = membership?.role;

  const { appointment, invoices } = result.data;
  const patient = appointment.patients;

  const isActive = appointment.status !== 'completed' && appointment.status !== 'cancelled';
  const hasInvoice = invoices && invoices.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Left Column: Patient & Provider Info */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-medium text-lg">{patient.full_name}</p>
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <Link href={`/patients/${patient.id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-mono text-sm mt-1">{patient.patient_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="capitalize text-sm mt-1">{patient.gender?.replace(/_/g, ' ') || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="text-sm mt-1">{patient.phone || 'No phone provided'}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{patient.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial/Billing Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-600" /> Billing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {hasInvoice ? (
                <div className="space-y-3">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                       <div>
                         <p className="font-medium">{inv.invoice_number}</p>
                         <p className="text-sm font-semibold text-primary mt-1">
                           {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(inv.total_amount)}
                         </p>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'sent' ? 'outline' : 'secondary'} className="capitalize">{inv.status}</Badge>
                         <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                            <Link href={`/billing/${inv.id}`}>View Invoice</Link>
                         </Button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 space-y-3 border border-dashed rounded-lg bg-muted/10">
                  <p className="text-sm text-muted-foreground text-center px-4">No invoices generated for this visit yet.</p>
                  <Button variant="outline" size="sm" className="w-[calc(100%-2rem)] mx-auto block" asChild>
                     <Link href={`/billing/new?patient_id=${patient.id}&appointment_id=${appointment.id}`}>
                       <FileText className="mr-2 h-4 w-4 inline" /> Generate Invoice
                     </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clinical Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full border border-border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-6 w-6 text-blue-500" /> Clinical Notes
                </CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Assigned Provider</p>
                  <p className="font-medium flex items-center gap-1">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    {appointment.organization_memberships?.profiles?.full_name ? `Dr. ${appointment.organization_memberships.profiles.full_name}` : 'Unassigned'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col flex-1">
              <ClinicalNotesEditor 
                appointmentId={appointment.id}
                initialChiefComplaint={appointment.chief_complaint}
                initialNotes={appointment.notes}
                isActive={isActive}
              />
            </CardContent>
            {isActive && (
              <CardFooter className="bg-muted/10 border-t pt-4">
                 <p className="text-xs text-muted-foreground mx-auto flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Clinical records should be updated during the consultation.
                 </p>
              </CardFooter>
            )}
          </Card>
        </div>

    </div>
  );
}
