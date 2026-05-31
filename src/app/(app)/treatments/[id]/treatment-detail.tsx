'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { 
  updateTreatment, 
  addTreatmentSession, 
  updateTreatmentSession, 
  deleteTreatmentSession,
  generateTreatmentInvoice,
  uploadTreatmentFile,
  deleteTreatmentFile
} from '../actions';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Briefcase, 
  DollarSign, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit2, 
  Trash2, 
  FileText, 
  Upload, 
  Loader2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TreatmentDetailProps {
  treatment: any;
  sessions: any[];
  doctors: any[];
  invoices: any[];
  attachments: any[];
  addSessionTrigger: boolean;
  currentUserId: string;
}

const sessionSchema = z.object({
  session_date: z.string().min(1, 'Date is required.'),
  session_time: z.string().min(1, 'Time is required.'),
  doctor_membership_id: z.string().min(1, 'Doctor is required.'),
  notes: z.string().optional().or(z.literal('')),
  cost: z.coerce.number().min(0, 'Cost must be positive.'),
  status: z.enum(['completed', 'scheduled', 'cancelled']).default('completed'),
  next_session_recommended: z.boolean().default(false),
  next_session_date: z.string().optional().or(z.literal('')),
});

export function TreatmentDetail({
  treatment,
  sessions,
  doctors,
  invoices,
  attachments,
  addSessionTrigger,
  currentUserId
}: TreatmentDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [showAddForm, setShowAddForm] = React.useState(addSessionTrigger);
  const [editingSession, setEditingSession] = React.useState<any | null>(null);
  const [notesValue, setNotesValue] = React.useState(treatment.notes || '');
  const [notesSaving, setNotesSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const patient = treatment.patients;
  const initials = patient?.full_name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'PT';

  // Calculate overall financial state based on related invoices
  const totalAmountPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const balanceRemaining = Math.max(0, (treatment.estimated_cost || 0) - totalAmountPaid);

  let paymentStatus = 'Pending';
  if (totalAmountPaid >= (treatment.estimated_cost || 0) && treatment.estimated_cost > 0) {
    paymentStatus = 'Paid';
  } else if (totalAmountPaid > 0) {
    paymentStatus = 'Partially Paid';
  }

  // React Hook Form for logging sessions
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      session_date: new Date().toISOString().split('T')[0],
      session_time: new Date().toTimeString().slice(0, 5),
      doctor_membership_id: treatment.doctor_membership_id || '',
      notes: '',
      cost: treatment.treatment_type === 'single' ? treatment.estimated_cost : Math.round((treatment.estimated_cost || 0) / (treatment.estimated_sessions || 1)),
      status: 'completed',
      next_session_recommended: false,
      next_session_date: '',
    }
  });

  const nextSessionRecommended = watch('next_session_recommended');

  const onSaveSession = (data: any) => {
    startTransition(async () => {
      try {
        let result;
        if (editingSession) {
          result = await updateTreatmentSession(editingSession.id, data);
        } else {
          result = await addTreatmentSession(treatment.id, data);
        }

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(editingSession ? 'Session updated successfully!' : 'Session logged successfully!');
          setShowAddForm(false);
          setEditingSession(null);
          reset();
          router.refresh();
        }
      } catch (err) {
        toast.error('Failed to log treatment session.');
      }
    });
  };

  const handleEditSession = (sess: any) => {
    setEditingSession(sess);
    setValue('session_date', sess.session_date);
    setValue('session_time', sess.session_time.slice(0, 5));
    setValue('doctor_membership_id', sess.doctor_membership_id || '');
    setValue('notes', sess.notes || '');
    setValue('cost', sess.cost || 0);
    setValue('status', sess.status);
    setValue('next_session_recommended', !!sess.next_session_date);
    setValue('next_session_date', sess.next_session_date || '');
    setShowAddForm(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      startTransition(async () => {
        const res = await deleteTreatmentSession(sessionId);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success('Session deleted.');
          router.refresh();
        }
      });
    }
  };

  const onSaveClinicalNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await updateTreatment(treatment.id, { notes: notesValue });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Clinical notes saved!');
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to save notes.');
    } finally {
      setNotesSaving(false);
    }
  };

  const handleGenerateInvoice = () => {
    startTransition(async () => {
      try {
        const res = await generateTreatmentInvoice(treatment.id);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success('Draft Invoice generated successfully!');
          router.push(`/billing/${res.invoiceId}`);
        }
      } catch (err) {
        toast.error('Failed to generate invoice.');
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const file = files[0];
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${treatment.id}/${Date.now()}_${cleanFileName}`;
    
    try {
      const supabase = createClient();
      
      // Upload to storage bucket
      const { data, error: uploadErr } = await supabase.storage
        .from('treatments')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadErr) {
        throw uploadErr;
      }

      // Record in patient_files
      const res = await uploadTreatmentFile({
        treatmentId: treatment.id,
        patientId: patient.id,
        fileName: file.name,
        storagePath: storagePath,
        fileSize: file.size,
        fileType: file.type
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('File uploaded successfully!');
        router.refresh();
      }
    } catch (err: any) {
      console.error('File upload failure:', err);
      toast.error(err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      try {
        const res = await deleteTreatmentFile(fileId, treatment.id, storagePath);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success('File deleted.');
          router.refresh();
        }
      } catch (err) {
        toast.error('Failed to delete file.');
      }
    }
  };

  // Status badge style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link 
          href="/treatments" 
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Treatment Details</span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">{treatment.title}</h2>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ==================================================== */}
        {/* SECTION 1 - TREATMENT OVERVIEW (LEFT 2 COLUMNS) */}
        {/* ==================================================== */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="bg-muted/15 border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Clinical Overview</CardTitle>
                <CardDescription>Comprehensive patient & procedure diagnostics</CardDescription>
              </div>
              <Badge variant="outline" className={`uppercase py-0.5 px-3 font-semibold ${getStatusBadgeClass(treatment.status)}`}>
                {treatment.status.replace('_', ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Patient Demographics Panel */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/60 gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/patients/${patient?.id}`} className="font-bold text-foreground hover:underline hover:text-primary transition-all">
                      {patient?.full_name || 'Unknown Patient'}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                      <span>ID: {patient?.patient_code}</span>
                      <span>·</span>
                      <span>{patient?.age ? `${patient.age} Yrs` : 'Age N/A'}</span>
                      <span>·</span>
                      <span className="text-rose-500 font-bold uppercase">{patient?.blood_group || 'Blood N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                  <span className="text-xs text-muted-foreground font-semibold">Change Status:</span>
                  <select
                    value={treatment.status}
                    onChange={(e) => updateTreatment(treatment.id, { status: e.target.value as any }).then(() => { toast.success('Status updated!'); router.refresh(); })}
                    className="mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Core Diagnosis Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Assigned Doctor</span>
                  <p className="text-sm font-semibold text-foreground">
                    {doctors.find(d => d.id === treatment.doctor_membership_id)?.full_name ? `Dr. ${doctors.find(d => d.id === treatment.doctor_membership_id)?.full_name}` : 'No Doctor Assigned'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Diagnosis</span>
                  <p className="text-sm font-semibold text-foreground truncate">{treatment.diagnosis || 'No diagnosis logged'}</p>
                </div>
                <div className="space-y-1 pt-3">
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Expected Timeline</span>
                  <p className="text-xs font-semibold text-foreground">
                    Start: {new Date(treatment.created_at).toLocaleDateString()} {treatment.expected_end_date ? `· End: ${new Date(treatment.expected_end_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="space-y-1 pt-3">
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Session Type</span>
                  <p className="text-xs font-bold text-foreground">
                    {treatment.treatment_type === 'multi' ? `Multi-Session (Est. ${treatment.estimated_sessions} sessions)` : 'Single Session'}
                  </p>
                </div>
              </div>

              {/* Rich Clinical Notes Editor */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="clinical-notes" className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Clinical Notes (Doctor & Specialist Notes)</Label>
                <textarea
                  id="clinical-notes"
                  rows={4}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="flex w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Type comprehensive clinical findings, patient complaint notes, medicines required, etc..."
                />
                <div className="flex justify-end pt-1">
                  <button
                    onClick={onSaveClinicalNotes}
                    disabled={notesSaving}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 text-xs font-semibold hover:bg-primary/95 shadow-sm transition-all disabled:opacity-50 cursor-pointer gap-1.5"
                  >
                    {notesSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Save Clinical Notes
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* ==================================================== */}
          {/* SECTION 2 - TREATMENT TIMELINE (VERTICAL SESSIONS) */}
          {/* ==================================================== */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="bg-muted/15 border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Treatment Progress</CardTitle>
                <CardDescription>Chronological log of clinical sessions</CardDescription>
              </div>
              
              {/* Add Next Session Trigger */}
              {(treatment.status === 'planned' || treatment.status === 'in_progress') && (
                <button
                  onClick={() => { setShowAddForm(true); setEditingSession(null); reset(); }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground px-3.5 text-xs font-semibold hover:bg-primary/95 shadow-sm transition-all gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Next Session</span>
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-6">

              {/* Automation Banner */}
              {treatment.treatment_type === 'multi' && 
               treatment.completed_sessions >= (treatment.estimated_sessions || 1) && 
               treatment.status !== 'completed' && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-800 mb-6 animate-pulse">
                  <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold">All scheduled sessions have been logged!</p>
                    <p className="text-muted-foreground mt-0.5">Would you like to finalize this treatment and mark it as completed?</p>
                  </div>
                  <button
                    onClick={() => updateTreatment(treatment.id, { status: 'completed' }).then(() => { toast.success('Treatment finalized!'); router.refresh(); })}
                    className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    Mark as Complete
                  </button>
                </div>
              )}

              {/* Session Timeline */}
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 border border-dashed rounded-xl">
                  <Clock className="h-10 w-10 text-muted-foreground opacity-40 mb-3" />
                  <p className="font-semibold text-muted-foreground">No sessions logged yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Select "+ Add Next Session" above to log the first session.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-border pl-6 ml-4 space-y-6">
                  {sessions.map((sess: any) => {
                    const docProfile = sess.doctor?.profiles;
                    
                    return (
                      <div key={sess.id} className="relative group">
                        
                        {/* Bullet point indicator */}
                        <div className={`absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-300
                          ${sess.status === 'completed' ? 'border-emerald-500 bg-emerald-500 text-white' : ''}
                          ${sess.status === 'scheduled' ? 'border-blue-500 bg-blue-500 text-white' : ''}
                          ${sess.status === 'cancelled' ? 'border-rose-500 bg-rose-500 text-white' : ''}
                        `}>
                          {sess.status === 'completed' && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
                        </div>

                        {/* Session Card */}
                        <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap items-center justify-between border-b pb-2 mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">Session {sess.session_number}</span>
                              <Badge variant={sess.status === 'completed' ? 'default' : sess.status === 'scheduled' ? 'secondary' : 'destructive'} className="text-[10px] uppercase font-bold py-0">
                                {sess.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                              <span>{new Date(sess.session_date).toLocaleDateString()} @ {sess.session_time.slice(0,5)}</span>
                              <span>·</span>
                              <span className="text-foreground">{formatCurrency(sess.cost)}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-1.5 flex-1">
                              <p className="text-xs font-semibold text-muted-foreground">Clinical Progress & Procedures Done:</p>
                              <p className="text-sm text-foreground leading-relaxed bg-muted/10 p-2.5 rounded-lg border border-border/30 whitespace-pre-wrap">{sess.notes || 'No clinical notes logged for this session.'}</p>
                              {sess.next_session_date && (
                                <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> Next appointment scheduled for: {new Date(sess.next_session_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {/* Session Quick Controls (Doctor and specialist edit) */}
                            <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-auto border-t sm:border-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                              <span className="text-[10px] text-muted-foreground font-semibold sm:text-right hidden sm:block">Performed by:<br/><span className="text-foreground text-xs font-bold">{docProfile?.full_name ? `Dr. ${docProfile.full_name}` : 'Staff'}</span></span>
                              <div className="flex gap-1.5 self-end mt-1">
                                <button
                                  onClick={() => handleEditSession(sess)}
                                  className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-blue-600"
                                  title="Edit Session Notes"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSession(sess.id)}
                                  className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-destructive"
                                  title="Delete Session"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 3 - ADD SESSION FORM (INLINE POPUP) */}
              {/* ==================================================== */}
              {showAddForm && (
                <div className="mt-8 p-5 border rounded-2xl bg-muted/20 border-dashed animate-fade-in space-y-4">
                  <h4 className="font-bold text-sm text-foreground border-b pb-2">{editingSession ? 'Edit Treatment Session' : 'Log Next Session'} Details</h4>
                  <form onSubmit={handleSubmit(onSaveSession)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="session_date">Session Date <span className="text-destructive">*</span></Label>
                        <Input id="session_date" type="date" {...register('session_date')} />
                        {errors.session_date && <p className="text-xs text-destructive">{errors.session_date.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="session_time">Session Time <span className="text-destructive">*</span></Label>
                        <Input id="session_time" type="time" {...register('session_time')} />
                        {errors.session_time && <p className="text-xs text-destructive">{errors.session_time.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctor_membership_id">Doctor Performed <span className="text-destructive">*</span></Label>
                        <select
                          id="doctor_membership_id"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...register('doctor_membership_id')}
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
                          ))}
                        </select>
                        {errors.doctor_membership_id && <p className="text-xs text-destructive">{errors.doctor_membership_id.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost">Session Cost (₹) <span className="text-destructive">*</span></Label>
                        <Input id="cost" type="number" placeholder="0" {...register('cost')} />
                        {errors.cost && <p className="text-xs text-destructive">{errors.cost.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Session Status</Label>
                      <select
                        id="status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                        {...register('status')}
                      >
                        <option value="completed">Completed ✅</option>
                        <option value="scheduled">Scheduled 📅</option>
                        <option value="cancelled">Cancelled ❌</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes / Procedures Performed this Session</Label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Detail specific orthodontic adjustments, medications applied, patient feedback..."
                        {...register('notes')}
                      />
                    </div>

                    {/* Auto-Appointment recommendation */}
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="next_session_recommended" className="font-semibold text-xs text-primary">Schedule next recommended session appointment?</Label>
                        <input
                          type="checkbox"
                          id="next_session_recommended"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          {...register('next_session_recommended')}
                        />
                      </div>
                      {nextSessionRecommended && (
                        <div className="space-y-1 mt-2">
                          <Label htmlFor="next_session_date" className="text-xs">Recommended Date</Label>
                          <Input id="next_session_date" type="date" {...register('next_session_date')} />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowAddForm(false); setEditingSession(null); }}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-xs font-semibold hover:bg-muted cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 text-xs font-semibold hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isPending ? 'Saving...' : 'Save Session'}
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </CardContent>
          </Card>

          {/* ==================================================== */}
          {/* SECTION 4 - DOCUMENTS & ATTACHMENTS */}
          {/* ==================================================== */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="bg-muted/15 border-b pb-4">
              <CardTitle className="text-lg">Documents & Attachments</CardTitle>
              <CardDescription>Clinical X-rays, consent forms, and diagnostic reports</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* Dropzone upload area */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/5 transition-colors relative">
                <input
                  type="file"
                  id="file-attachment"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <p className="font-semibold text-sm text-foreground mt-2">Uploading attachment...</p>
                      <p className="text-xs text-muted-foreground">Writing encrypted files to secure store</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground opacity-50" />
                      <p className="font-semibold text-sm text-foreground">Click to upload clinical files</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload X-rays, diagnostic reports, consent documents (Max 15MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Uploaded Files grid */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {attachments.map((file) => {
                    const cleanPath = file.storage_path;
                    const uploaderName = file.uploader?.full_name || 'Clinic Staff';
                    
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/10 transition-all justify-between group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate pr-2" title={file.file_name}>
                              {file.file_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              {new Date(file.created_at).toLocaleDateString()} · By {uploaderName}
                            </p>
                          </div>
                        </div>

                        {/* File Action Controls */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => {
                              const supabase = createClient();
                              const { data } = supabase.storage.from('treatments').getPublicUrl(cleanPath);
                              if (data?.publicUrl) window.open(data.publicUrl, '_blank');
                            }}
                            className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted text-primary cursor-pointer"
                            title="Download/View File"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, cleanPath)}
                            className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted text-destructive cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* ==================================================== */}
        {/* SECTION 1 - COST SUMMARY (RIGHT COLUMN - 1 COLUMN) */}
        {/* ==================================================== */}
        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-sm h-full bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Financial Summary</CardTitle>
              <CardDescription>Estimated metrics & billing operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Cost Metrics List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Estimated Cost</span>
                  <span className="font-bold text-foreground text-lg">{formatCurrency(treatment.estimated_cost || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Amount Collected</span>
                  <span className="font-bold text-emerald-600 text-lg">{formatCurrency(totalAmountPaid)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Balance Remaining</span>
                  <span className="font-bold text-rose-600 text-lg">{formatCurrency(balanceRemaining)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Payment Status</span>
                  <Badge className={`font-semibold tracking-wide uppercase px-3 py-0.5
                    ${paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
                    ${paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                    ${paymentStatus === 'Pending' ? 'bg-rose-100 text-rose-800 border border-rose-200' : ''}
                  `}>
                    {paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Connected Invoices Log */}
              {invoices.length > 0 && (
                <div className="space-y-3 pt-3 border-t">
                  <p className="text-xs font-bold text-foreground">Invoices Generated:</p>
                  <div className="space-y-2">
                    {invoices.map(inv => (
                      <Link 
                        key={inv.id} 
                        href={`/billing/${inv.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl border bg-card hover:bg-muted/10 transition-colors text-xs font-semibold"
                      >
                        <span className="text-primary font-mono">{inv.invoice_number}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{formatCurrency(inv.total_amount)}</span>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">
                            {inv.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoicing Operations Button */}
              <div className="space-y-3 pt-4 border-t">
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isPending}
                  className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-primary text-primary-foreground px-4 text-sm font-semibold hover:bg-primary/95 shadow-sm transition-all disabled:opacity-50 cursor-pointer gap-2"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4.5 w-4.5" />}
                  Generate Invoice
                </button>
                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  Generates a dynamic draft invoice prefilled with completed sessions or estimated total procedure costs, automatically linked to patient billing logs.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
