import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPatientDashboard } from '../actions';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Calendar, FileText, Phone, Mail, User, MapPin, Droplet, Contact, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrescriptionList } from '@/components/prescriptions/prescription-list';
import { PastAppointmentsTable } from './past-appointments-table';
import { ClinicalNotesView } from './clinical-notes-view';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PatientDashboardProps {
  id: string;
}

export async function PatientDashboard({ id }: PatientDashboardProps) {
  const result = await getPatientDashboard(id);

  if (result.error || !result.data) {
    return notFound();
  }

  const { patient, appointments, invoices, prescriptions, labOrders, clinicalNotes, role } = result.data;

  // Compute initials
  const initials = patient.full_name
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'PT';

  const now = new Date();
  
  const upcomingAppointments = appointments.filter((a: any) => {
    if (a.status === 'cancelled') return false;
    const aptDateTime = new Date(`${a.appointment_date}T${a.start_time}`);
    return !isNaN(aptDateTime.getTime()) ? aptDateTime >= now : false;
  });

  const pastAppointments = appointments.filter((a: any) => {
    if (a.status === 'cancelled') return true;
    const aptDateTime = new Date(`${a.appointment_date}T${a.start_time}`);
    return !isNaN(aptDateTime.getTime()) ? aptDateTime < now : true;
  });

  return (
    <div className="flex-1 space-y-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/patients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{patient.full_name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Badge variant="secondary" className="font-mono text-xs">{patient.patient_code}</Badge>
                {patient.gender && <span className="capitalize px-1 text-sm border-l">{patient.gender.replace(/_/g, ' ')}</span>}
              </div>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/patients/${patient.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Demographics & Info */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">Phone</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">Email</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">Date of Birth</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMMM d, yyyy') : 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">Age</p>
                    <p className="text-sm text-muted-foreground mt-1">{patient.age ? `${patient.age} years` : 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Droplet className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">Blood Group</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.blood_group || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Contact className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">Emergency Contact</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.emergency_contact || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">Address</p>
                  <p className="text-sm text-muted-foreground mt-1">{patient.address || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ClinicalNotesView patientId={patient.id} initialNotes={clinicalNotes || []} patientName={patient.full_name} />
        </div>

        {/* Right Column: Appointments & Billing */}
        <div className="md:col-span-2 space-y-6">
          
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="mb-4 flex-wrap bg-muted/50 p-1 border">
              <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions ({prescriptions?.length || 0})</TabsTrigger>
              <TabsTrigger value="lab">Lab & Docs ({labOrders?.length || 0})</TabsTrigger>
              <TabsTrigger value="invoices">Billing & Invoices ({invoices.length})</TabsTrigger>
            </TabsList>
            
            {/* Appointments Tab Content */}
            <TabsContent value="appointments" className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
                  <div className="space-y-1">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Scheduled visits for this patient</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/appointments/new?patient_id=${patient.id}`}>
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Follow-up
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {upcomingAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground text-sm">No upcoming appointments scheduled.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingAppointments.map((apt: any) => (
                          <TableRow key={apt.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {format(new Date(`${apt.appointment_date}T${apt.start_time}`), 'PPp')}
                            </TableCell>
                            <TableCell>{apt.title || 'Consultation'}</TableCell>
                            <TableCell>
                              <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'} className="capitalize">
                                {apt.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/appointments/${apt.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader className="bg-muted/5">
                  <CardTitle className="text-base text-muted-foreground">Past History (Count: {pastAppointments.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {pastAppointments.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No past appointments identified by the filter.</div>
                  ) : (
                    <PastAppointmentsTable appointments={pastAppointments} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              <PrescriptionList 
                patientId={patient.id} 
                prescriptions={prescriptions || []} 
                userRole={role} 
                patientName={patient.full_name}
                patientPhone={patient.phone}
              />
            </TabsContent>

            {/* Lab Tab Content */}
            <TabsContent value="lab" className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
                  <div className="space-y-1">
                    <CardTitle>Lab & Diagnostics</CardTitle>
                    <CardDescription>Lab test orders and reports</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/patients/${patient.id}/lab/external`}>
                        Upload External
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/patients/${patient.id}/lab/new`}>
                        <FlaskConical className="mr-2 h-4 w-4" /> Order Lab Test
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {!labOrders || labOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                      <FlaskConical className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground text-sm">No lab orders have been created for this patient.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Date</TableHead>
                          <TableHead>Tests</TableHead>
                          <TableHead>Ordered By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {labOrders.map((order: any) => {
                          const itemNames = order.lab_order_items?.map((item: any) => item.lab_tests?.name || (item.lab_packages?.name ? `${item.lab_packages.name} (Package)` : null)).filter(Boolean).join(', ') || 'Various Items';
                          return (
                            <TableRow key={order.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                {format(new Date(order.order_date), 'MMM d, yyyy')}
                                {order.is_external && <Badge variant="secondary" className="ml-2 text-[10px]">EXTERNAL</Badge>}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate" title={order.is_external ? order.notes : itemNames}>
                                {order.is_external ? order.notes : itemNames}
                              </TableCell>
                              <TableCell>
                                {order.doctor_membership_id?.profiles?.full_name || 'Clinic Staff'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="capitalize">
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {order.is_external && order.external_report_url ? (
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={order.external_report_url} target="_blank" rel="noopener noreferrer">View Doc</Link>
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/lab/${order.id}`}>View In-House</Link>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab Content */}
            <TabsContent value="invoices" className="space-y-4">
              <Card className="border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
                    <div className="space-y-1">
                      <CardTitle>Invoices</CardTitle>
                      <CardDescription>Billing history for this patient</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/billing/new?patient_id=${patient.id}`}>
                        <FileText className="mr-2 h-4 w-4" /> Create Invoice
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {invoices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                        <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground text-sm">No invoices have been generated for this patient.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.map((invoice: any) => (
                            <TableRow key={invoice.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                {invoice.invoice_number}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="font-semibold text-primary">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.total_amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'sent' ? 'outline' : 'secondary'} className="capitalize">
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/billing/${invoice.id}`}>View</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}
