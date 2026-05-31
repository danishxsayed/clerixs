'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createTreatment } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const treatmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  title: z.string().min(2, 'Title is required.'),
  diagnosis: z.string().optional().or(z.literal('')),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().optional().or(z.literal('')),
  treatment_type: z.enum(['single', 'multi']),
  estimated_sessions: z.coerce.number().optional().nullable(),
  estimated_cost: z.coerce.number().min(0, 'Estimated cost must be positive'),
  doctor_membership_id: z.string().min(1, 'Doctor is required.'),
  expected_end_date: z.string().optional().or(z.literal('')),
  appointment_id: z.string().optional().or(z.literal('')),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

interface TreatmentCreateFormProps {
  patients: { id: string; full_name: string }[];
  doctors: { id: string; full_name: string }[];
}

export function TreatmentCreateForm({ patients, doctors }: TreatmentCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [appointments, setAppointments] = React.useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      patient_id: '',
      title: '',
      diagnosis: '',
      status: 'planned',
      notes: '',
      treatment_type: 'single',
      estimated_sessions: 3,
      estimated_cost: 0,
      doctor_membership_id: '',
      expected_end_date: '',
      appointment_id: '',
    },
  });

  const selectedPatientId = watch('patient_id');
  const treatmentType = watch('treatment_type');

  // Prefill patient if parameter passed
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pId = params.get('patient_id');
      if (pId && patients.some(p => p.id === pId)) {
        setValue('patient_id', pId);
      }
    }
  }, [patients, setValue]);

  // Fetch patient appointments
  React.useEffect(() => {
    if (!selectedPatientId) {
      setAppointments([]);
      return;
    }
    const supabase = createClient();
    async function fetchPatientAppointments() {
      const { data } = await supabase
        .from('appointments')
        .select('id, appointment_date, start_time, chief_complaint')
        .eq('patient_id', selectedPatientId)
        .neq('status', 'cancelled')
        .order('appointment_date', { ascending: false });
      if (data) {
        setAppointments(data);
      }
    }
    fetchPatientAppointments();
  }, [selectedPatientId]);

  const onSubmit = (data: any) => {
    startTransition(async () => {
      try {
        const result = await createTreatment({
          ...data,
          estimated_sessions: data.treatment_type === 'single' ? 1 : data.estimated_sessions,
        });
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Treatment logged successfully!');
          if (result.treatmentId) {
            router.push(`/treatments/${result.treatmentId}`);
          } else {
            router.push('/treatments');
          }
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        
        {/* Patient & Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient <span className="text-destructive">*</span></Label>
            <select 
              id="patient_id" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('patient_id')}
            >
              <option value="">Select a patient</option>
              {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_membership_id">Assigned Doctor <span className="text-destructive">*</span></Label>
            <select 
              id="doctor_membership_id" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('doctor_membership_id')}
            >
              <option value="">Select a doctor</option>
              {doctors.map(d => (
                  <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
              ))}
            </select>
            {errors.doctor_membership_id && <p className="text-xs text-destructive">{errors.doctor_membership_id.message}</p>}
          </div>
        </div>

        {/* Title & Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Treatment/Procedure Title <span className="text-destructive">*</span></Label>
            <Input id="title" placeholder="e.g. Tooth Extraction, Orthodontics" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="e.g. Deep Dental Caries" {...register('diagnosis')} />
          </div>
        </div>

        {/* Type Toggle & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Treatment Type</Label>
            <div className="flex rounded-md border border-input p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setValue('treatment_type', 'single')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                  treatmentType === 'single' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                Single Session
              </button>
              <button
                type="button"
                onClick={() => setValue('treatment_type', 'multi')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer ${
                  treatmentType === 'multi' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                Multi-Session
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_cost">Estimated Total Cost (₹) <span className="text-destructive">*</span></Label>
            <Input id="estimated_cost" type="number" placeholder="0" {...register('estimated_cost')} />
            {errors.estimated_cost && <p className="text-xs text-destructive">{errors.estimated_cost.message}</p>}
          </div>
        </div>

        {/* Dynamic Multi-Session details */}
        {treatmentType === 'multi' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-dashed">
            <div className="space-y-2">
              <Label htmlFor="estimated_sessions">Estimated Sessions</Label>
              <Input id="estimated_sessions" type="number" placeholder="3" {...register('estimated_sessions')} />
              {errors.estimated_sessions && <p className="text-xs text-destructive">{errors.estimated_sessions.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_end_date">Expected Completion Date</Label>
              <Input id="expected_end_date" type="date" {...register('expected_end_date')} />
            </div>
          </div>
        )}

        {/* Initial Status & Appointment Connection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <select 
              id="status" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('status')}
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointment_id">Link to Appointment <span className="text-muted-foreground">(Optional)</span></Label>
            <select 
              id="appointment_id" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('appointment_id')}
              disabled={!selectedPatientId}
            >
              <option value="">Select an appointment</option>
              {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.appointment_date} @ {a.start_time.slice(0,5)} - {a.chief_complaint}
                  </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Clinical Notes</Label>
          <textarea 
            id="notes" 
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Initial clinical notes, history, or observations..." 
            {...register('notes')} 
          />
        </div>

      </div>

      <div className="mt-6 flex justify-end gap-4 border-t pt-6">
        <Link href="/treatments" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted h-10 px-4 py-2 border">
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={isPending} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Saving...' : 'Save Treatment'}
        </button>
      </div>
    </form>
  );
}
