'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateAppointment } from '../../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  appointment_date: z.string().min(1, 'Date is required.'),
  start_time: z.string().min(1, 'Start time is required.'),
  treatment: z.string().optional(),
  provider_id: z.string().optional(),
  status: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export function AppointmentEditForm({ 
  appointment, 
  patients, 
  doctors,
  catalogItems = []
}: { 
  appointment: any, 
  patients: {id: string, full_name: string}[], 
  doctors: {id: string, full_name: string}[],
  catalogItems?: {name: string, category: string}[]
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [treatmentOpen, setTreatmentOpen] = React.useState(false);
  const [treatmentSearch, setTreatmentSearch] = React.useState('');

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: appointment.patient_id || '',
      appointment_date: appointment.appointment_date || '',
      start_time: appointment.start_time?.substring(0, 5) || '09:00',
      treatment: appointment.chief_complaint || '',
      provider_id: appointment.doctor_membership_id || '',
      status: appointment.status || 'scheduled',
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    startTransition(async () => {
      try {
        const formattedData = {
          ...data,
          start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
        };

        const result = await updateAppointment(appointment.id, formattedData);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Appointment updated successfully!');
          router.push('/appointments');
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
            <Label htmlFor="status">Status</Label>
            <select 
              id="status" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('status')}
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Date <span className="text-destructive">*</span></Label>
            <Input id="appointment_date" type="date" {...register('appointment_date')} />
            {errors.appointment_date && <p className="text-xs text-destructive">{errors.appointment_date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time <span className="text-destructive">*</span></Label>
            <Input id="start_time" type="time" {...register('start_time')} />
            {errors.start_time && <p className="text-xs text-destructive">{errors.start_time.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="treatment">Treatment / Reason</Label>
            <Popover open={treatmentOpen} onOpenChange={setTreatmentOpen}>
              <PopoverTrigger render={
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={treatmentOpen}
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !register('treatment').name && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {watch('treatment') || "Type or select treatment..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              } />
              <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search treatments..." 
                    value={treatmentSearch}
                    onValueChange={setTreatmentSearch}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setValue('treatment', treatmentSearch, { shouldValidate: true, shouldDirty: true });
                        setTreatmentOpen(false);
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty className="p-2 text-sm text-muted-foreground text-center">
                      No treatments found. Press Enter to use "{treatmentSearch}".
                    </CommandEmpty>
                    <CommandGroup>
                      {catalogItems.map((item, idx) => (
                        <CommandItem
                          key={idx}
                          value={item.name}
                          onSelect={(currentValue) => {
                            setValue('treatment', currentValue, { shouldValidate: true, shouldDirty: true });
                            setTreatmentSearch(currentValue);
                            setTreatmentOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              watch('treatment') === item.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.category}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <input type="hidden" {...register('treatment')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider_id">Provider</Label>
            <select 
              id="provider_id" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('provider_id')}
            >
              <option value="">Select a provider (Optional)</option>
              {doctors.map(d => (
                 <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      <div className="mt-6 flex justify-end gap-4 border-t pt-6">
        <Link href="/appointments" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted h-10 px-4 py-2 border">
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={isPending || !isDirty} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
