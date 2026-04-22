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

const treatmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  title: z.string().min(2, 'Title is required.'),
  diagnosis: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

export function TreatmentCreateForm({ patients }: { patients: {id: string, full_name: string}[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      patient_id: '',
      title: '',
      diagnosis: '',
      status: 'planned',
      notes: '',
    },
  });

  const onSubmit = (data: TreatmentFormValues) => {
    startTransition(async () => {
      try {
        const result = await createTreatment(data);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Treatment recorded successfully!');
          router.push('/treatments');
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient <span className="text-destructive">*</span></Label>
            <select 
              id="patient_id" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <Label htmlFor="status">Initial Status</Label>
            <select 
              id="status" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('status')}
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Treatment/Procedure Title <span className="text-destructive">*</span></Label>
            <Input id="title" placeholder="e.g. Root Canal Therapy" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="e.g. Irreversible Pulpitis" {...register('diagnosis')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Clinical Notes</Label>
          <textarea 
            id="notes" 
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Add detailed clinical notes or observations..." 
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
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Treatment'}
        </button>
      </div>
    </form>
  );
}
