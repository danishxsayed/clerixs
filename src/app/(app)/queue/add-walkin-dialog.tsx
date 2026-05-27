'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { differenceInYears } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2, UserPlus, Search, Info } from 'lucide-react';
import { addToQueue } from './actions';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const walkInSchema = z.object({
  doctor_membership_id: z.string().min(1, 'Please select a doctor'),
  patient_name: z.string().min(2, 'Patient name is required'),
  patient_id: z.string().optional(),
  create_profile: z.boolean().default(false),
  phone: z.string().optional(),
  email: z.string().email('Invalid email.').optional().or(z.literal('')),
  age: z.string().optional(),
  date_of_birth: z.string().optional(),
  blood_group: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergency_contact: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).default('prefer_not_to_say'),
  address: z.string().optional(),
});

export function AddWalkinDialog({ 
  open, 
  onOpenChange, 
  doctors,
  onAddEntry
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  doctors: any[],
  onAddEntry?: (entry: any) => void
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [patients, setPatients] = React.useState<{ id: string; full_name: string; phone?: string; age?: string; gender?: string }[]>([]);
  const [patientOpen, setPatientOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const supabase = createClient();

  const form = useForm<z.infer<typeof walkInSchema>>({
    resolver: zodResolver(walkInSchema) as any,
    defaultValues: {
      doctor_membership_id: '',
      patient_name: '',
      patient_id: '',
      create_profile: false,
      phone: '',
      email: '',
      age: '',
      date_of_birth: '',
      blood_group: '',
      emergency_contact: '',
      gender: 'prefer_not_to_say',
      address: '',
    }
  });

  const createProfile = useWatch({ control: form.control, name: 'create_profile' });
  const dob = useWatch({ control: form.control, name: 'date_of_birth' });

  // Age calculation logic
  React.useEffect(() => {
    if (dob) {
      const calculatedAge = differenceInYears(new Date(), new Date(dob));
      if (!isNaN(calculatedAge)) {
        form.setValue('age', calculatedAge.toString(), { shouldValidate: true });
      }
    }
  }, [dob, form]);

  React.useEffect(() => {
    async function fetchPatients() {
      let query = supabase
        .from('patients')
        .select('id, full_name, phone, age, gender')
        .order('full_name')
        .limit(10); // Limit for search preview

      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }

      const { data } = await query;
      if (data) setPatients(data);
    }
    if (open) {
      fetchPatients();
    } else {
      setSearchTerm('');
    }
  }, [open, searchTerm, supabase]);

  async function onSubmit(values: z.infer<typeof walkInSchema>) {
    setIsSubmitting(true);
    try {
      const result = await addToQueue(values);
      setIsSubmitting(false);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Patient added to queue successfully.');
        
        if (onAddEntry && result.entry) {
          onAddEntry(result.entry);
        }

        onOpenChange(false);
        form.reset();
      }
    } catch (error: any) {
      setIsSubmitting(false);
      toast.error(error.message || 'Failed to add patient to queue');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Add Walk-in Patient
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              
              {/* Patient Search / Name */}
              <FormField
                control={form.control}
                name="patient_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Patient Search / Name</FormLabel>
                    <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                      <PopoverTrigger render={
                        <button
                          type="button"
                          role="combobox"
                          aria-expanded={patientOpen}
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">{field.value || "Search patient or type name..."}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>
                      } />
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Search patients..." 
                            onValueChange={(val) => {
                              setSearchTerm(val);
                              form.setValue('patient_name', val);
                              form.setValue('patient_id', ''); // Clear ID if typing
                            }}
                          />
                          <CommandList>
                            <CommandEmpty className="p-2 text-xs text-muted-foreground text-center">
                              No matching profiles. Typing "{form.getValues('patient_name')}" as 1-time walk-in.
                            </CommandEmpty>
                            <CommandGroup>
                              {patients.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={p.full_name}
                                  onSelect={() => {
                                    form.setValue('patient_name', p.full_name);
                                    form.setValue('patient_id', p.id);
                                    form.setValue('create_profile', false);
                                    setPatientOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.watch('patient_id') === p.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{p.full_name}</span>
                                    <span className="text-[10px] text-muted-foreground">{p.phone || 'No phone'}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Create Profile Toggle */}
              {!form.watch('patient_id') && (
                <FormField
                  control={form.control}
                  name="create_profile"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-slate-50/50">
                      <div className="space-y-0.5">
                        <FormLabel>Create Patient Profile</FormLabel>
                        <FormDescription className="text-[10px]">
                          Save all details to the permanent patient list.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Full Fields for Profile Creation */}
              {createProfile && !form.watch('patient_id') && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border p-4 rounded-lg bg-slate-50/30">
                   <div className="grid grid-cols-2 gap-3">
                     <FormField
                       control={form.control}
                       name="phone"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[11px] font-bold uppercase">Phone</FormLabel>
                           <FormControl>
                             <Input placeholder="9999999999" {...field} className="h-8 text-xs bg-white" />
                           </FormControl>
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="email"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[11px] font-bold uppercase">Email</FormLabel>
                           <FormControl>
                             <Input type="email" placeholder="email@example.com" {...field} className="h-8 text-xs bg-white" />
                           </FormControl>
                         </FormItem>
                       )}
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <FormField
                       control={form.control}
                       name="date_of_birth"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[11px] font-bold uppercase">DOB</FormLabel>
                           <FormControl>
                             <Input type="date" {...field} className="h-8 text-xs bg-white" />
                           </FormControl>
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="age"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[11px] font-bold uppercase">Age</FormLabel>
                           <FormControl>
                             <Input type="number" placeholder="30" {...field} className="h-8 text-xs bg-white" />
                           </FormControl>
                         </FormItem>
                       )}
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <FormField
                       control={form.control}
                       name="gender"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[11px] font-bold uppercase">Gender</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                               <SelectTrigger className="h-8 text-xs bg-white">
                                 <SelectValue />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               <SelectItem value="male">Male</SelectItem>
                               <SelectItem value="female">Female</SelectItem>
                               <SelectItem value="other">Other</SelectItem>
                               <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                             </SelectContent>
                           </Select>
                         </FormItem>
                       )}
                     />
                     <FormField
                       control={form.control}
                       name="blood_group"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-[11px] font-bold uppercase">Blood</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value}>
                             <FormControl>
                               <SelectTrigger className="h-8 text-xs bg-white">
                                 <SelectValue placeholder="Select" />
                               </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                               {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                 <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </FormItem>
                       )}
                     />
                   </div>

                   <FormField
                     control={form.control}
                     name="emergency_contact"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-[11px] font-bold uppercase">Emergency Contact</FormLabel>
                         <FormControl>
                           <Input placeholder="Emergency phone" {...field} className="h-8 text-xs bg-white" />
                         </FormControl>
                       </FormItem>
                     )}
                   />

                   <FormField
                     control={form.control}
                     name="address"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-[11px] font-bold uppercase">Address</FormLabel>
                         <FormControl>
                           <Input placeholder="Home address" {...field} className="h-8 text-xs bg-white" />
                         </FormControl>
                       </FormItem>
                     )}
                   />
                 </div>
              )}

              <Separator />

              <FormField
                control={form.control}
                name="doctor_membership_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Doctor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor">
                            {() => {
                              const selectedDoctor = doctors.find((d) => d.id === field.value);
                              return selectedDoctor ? `Dr. ${selectedDoctor.profiles.full_name}` : undefined;
                            }}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.profiles.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? 'Adding...' : 'Confirm & Add to Queue'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Separator() {
  return <div className="h-px w-full bg-slate-200 my-4" />;
}
