'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createAppointment } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBranch } from '@/contexts/BranchContext';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  appointment_date: z.string().min(1, 'Date is required.'),
  start_time: z.string().min(1, 'Start time is required.'),
  treatment: z.string().optional(),
  provider_id: z.string().optional(),
  branch_id: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = React.useTransition();
  const [patients, setPatients] = React.useState<{ id: string; full_name: string }[]>([]);
  const [doctors, setDoctors] = React.useState<{ id: string; full_name: string }[]>([]);
  const [catalogItems, setCatalogItems] = React.useState<{ name: string; category: string }[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = React.useState(true);
  const { currentBranch, isAllBranches, branches } = useBranch();

  // Fetch patients and doctors for the dropdown on mount
  React.useEffect(() => {
    async function fetchData() {
      // 1. Fetch Patients
      const { data: pData, error: pError } = await supabase
        .from('patients')
        .select('id, full_name')
        .order('full_name');
        
      if (!pError && pData) {
        setPatients(pData);
      }

      // 2. Fetch Active Doctors
      const { data: dData, error: dError } = await supabase
        .from('organization_memberships')
        .select('id, profiles!inner(full_name)')
        .eq('role', 'doctor')
        .eq('status', 'active');
        
      if (!dError && dData) {
        const parsedDoctors = dData.map((d: any) => ({
          id: d.id,
          full_name: d.profiles?.full_name || 'Unknown Doctor'
        }));
        setDoctors(parsedDoctors.sort((a, b) => a.full_name.localeCompare(b.full_name)));
      }

      // 3. Fetch Active Price Catalog Items
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: membership } = await supabase
          .from('organization_memberships')
          .select('organization_id')
          .eq('profile_id', user.id)
          .eq('status', 'active')
          .single();

        if (membership) {
          const { data: cData } = await supabase
            .from('price_catalog')
            .select('name, category')
            .eq('organization_id', membership.organization_id)
            .eq('is_active', true)
            .order('name');
          
          if (cData) {
            setCatalogItems(cData);
          }
        }
      }

      setIsLoadingPatients(false);
    }
    fetchData();
  }, [supabase]);

  const [treatmentOpen, setTreatmentOpen] = React.useState(false);
  const [treatmentSearch, setTreatmentSearch] = React.useState('');

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      appointment_date: '',
      start_time: '09:00',
      treatment: 'Consultation',
      provider_id: '',
      branch_id: '',
    },
  });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('patient_id');
    // Important: Only set the value after the patients list has successfully loaded,
    // otherwise the native <select> might ignore the value because the <option> doesn't exist yet!
    if (pid && !isLoadingPatients && patients.some(p => p.id === pid)) {
      setValue('patient_id', pid, { shouldValidate: true });
    }
  }, [setValue, isLoadingPatients, patients]);

  const onSubmit = (data: AppointmentFormValues) => {
    startTransition(async () => {
      try {
         // Append seconds to satisfy Postgres TIME type strictness if needed
        const formattedData = {
          ...data,
          start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
        };

        const result = await createAppointment(formattedData, data.branch_id || currentBranch?.id || undefined);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Appointment scheduled successfully!');
          router.push('/appointments');
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Schedule Appointment</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
        <p className="text-muted-foreground mb-6">Select a patient and set a time for their visit.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            {isAllBranches && (
              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch <span className="text-destructive">*</span></Label>
                <select 
                  id="branch_id" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('branch_id', { required: isAllBranches ? "Branch is required" : false })}
                >
                  <option value="">Select a branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.branch_id && <p className="text-xs text-destructive">{errors.branch_id.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient <span className="text-destructive">*</span></Label>
              <select 
                id="patient_id" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('patient_id')}
                disabled={isLoadingPatients}
              >
                <option value="">{isLoadingPatients ? 'Loading patients...' : 'Select a patient'}</option>
                {patients.map(p => (
                   <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
              {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
              {patients.length === 0 && !isLoadingPatients && (
                <p className="text-xs text-muted-foreground mt-1">
                  Don't see your patient? <Link href="/patients/new" className="text-primary hover:underline">Add them first</Link>.
                </p>
              )}
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
                            setValue('treatment', treatmentSearch, { shouldValidate: true });
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
                                setValue('treatment', currentValue, { shouldValidate: true });
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
                {/* Hidden input to ensure react-hook-form correctly captures custom inputs too */}
                <input type="hidden" {...register('treatment')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_id">Provider</Label>
                <select 
                  id="provider_id" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('provider_id')}
                  disabled={isLoadingPatients}
                >
                  <option value="">{isLoadingPatients ? 'Loading providers...' : 'Select a provider (Optional)'}</option>
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
              disabled={isPending || isLoadingPatients} 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
            >
              {isPending ? 'Scheduling...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
