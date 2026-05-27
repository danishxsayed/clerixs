'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInYears } from 'date-fns';
import { z } from 'zod';
import { toast } from 'sonner';
import { createPatient } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBranch } from '@/contexts/BranchContext';

const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits').optional().or(z.literal('')),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email address (e.g. doctor@clinic.com)').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  age: z.string().min(1, 'Age is required.'),
  blood_group: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergency_contact: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits').optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.string().optional(),
  branch_id: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const { currentBranch, isAllBranches, branches } = useBranch();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: 'onBlur',
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      date_of_birth: '',
      age: '',
      blood_group: '',
      emergency_contact: '',
      gender: 'prefer_not_to_say',
      address: '',
      branch_id: '',
    },
  });

  const dob = useWatch({ control, name: 'date_of_birth' });
  
  React.useEffect(() => {
    if (dob) {
      const calculatedAge = differenceInYears(new Date(), new Date(dob));
      if (!isNaN(calculatedAge)) {
        setValue('age', calculatedAge.toString(), { shouldValidate: true });
      }
    }
  }, [dob, setValue]);

  const onSubmit = (data: PatientFormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          phone: data.phone ? `+91${data.phone}` : '',
          emergency_contact: data.emergency_contact ? `+91${data.emergency_contact}` : '',
        };
        const result = await createPatient(payload, data.branch_id || currentBranch?.id || undefined);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Patient created successfully!');
          router.push('/patients');
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Add New Patient</h2>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
        <p className="text-muted-foreground mb-6">Enter the patient's details below to register them in the system.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                <Input id="full_name" placeholder="Alice Johnson" {...register('full_name')} />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="alice@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    +91
                  </div>
                  <Input 
                    id="phone" 
                    type="tel" 
                    maxLength={10}
                    className="pl-12 font-mono" 
                    placeholder="0000000000" 
                    {...register('phone')} 
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    +91
                  </div>
                  <Input 
                    id="emergency_contact" 
                    type="tel" 
                    maxLength={10}
                    className="pl-12 font-mono" 
                    placeholder="0000000000" 
                    {...register('emergency_contact')} 
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                    }}
                  />
                </div>
                {errors.emergency_contact && <p className="text-xs text-destructive">{errors.emergency_contact.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                {/* Fallback to native date picker for simplicity */}
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
                <Input id="age" type="number" min="0" placeholder="30" {...register('age')} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select 
                  id="gender" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('gender')}
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <select 
                  id="blood_group" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('blood_group')}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <Input id="address" placeholder="123 Main St, City, Country" {...register('address')} />
            </div>

          </div>

          <div className="mt-6 flex justify-end gap-4 border-t pt-6">
            <Link href="/patients" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted h-10 px-4 py-2 border">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isPending} 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
