'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from './actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const SPECIALTIES = [
  'General Physician',
  'Dentist',
  'Dermatologist / Skin Doctor',
  'Hair Transplant Surgeon',
  'Plastic Surgeon',
  'Cosmetic Surgeon',
  'Orthopedic Doctor',
  'Gynecologist / Obstetrician',
  'Pediatrician',
  'Cardiologist',
  'ENT Specialist',
  'Ophthalmologist / Eye Specialist',
  'Neurologist',
  'Endocrinologist / Diabetologist',
  'Psychiatrist',
  'Urologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Nephrologist',
  'Oncologist',
  'Rheumatologist',
  'Other'
];

const profileSchema = z.object({
  full_name: z.string().refine((val) => val.trim().length > 0, {
    message: 'Name cannot be blank.',
  }),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
  specialty: z.string().min(1, 'Specialty is required.'),
  otherSpecialty: z.string().optional(),
});

export function ProfileForm({ profile }: { profile: any }) {
  const [isPending, startTransition] = React.useTransition();
  const [specialtySearch, setSpecialtySearch] = React.useState('');

  const isCustomSpecialty = profile.specialty && !SPECIALTIES.includes(profile.specialty);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: (profile.full_name || '').trim(),
      phone: profile.phone || '',
      avatar_url: profile.avatar_url || '',
      specialty: isCustomSpecialty ? 'Other' : (profile.specialty || ''),
      otherSpecialty: isCustomSpecialty ? profile.specialty : '',
    },
  });

  const selectedSpecialty = form.watch('specialty');

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarUpload = (url: string) => {
    form.setValue('avatar_url', url, { shouldDirty: true });
    // Auto-save the profile when standard photo is uploaded
    onSubmit(form.getValues());
  };

  function onSubmit(values: z.infer<typeof profileSchema>) {
    startTransition(async () => {
      const trimmedValues = {
        ...values,
        full_name: values.full_name.trim(),
      };
      const result = await updateProfile(trimmedValues);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Profile updated successfully');
      window.location.reload();
    });
  }

  const filteredSpecialties = SPECIALTIES.filter(s =>
    s.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  return (
    <div className="space-y-12 max-w-xl pb-16">
      
      <div className="space-y-4 border-b pb-8">
        <h3 className="text-lg font-medium">Profile Picture</h3>
        <AvatarUpload 
          userId={profile.id}
          initials={getInitials(profile.full_name)}
          initialUrl={profile.avatar_url}
          onUploadComplete={handleAvatarUpload}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed to your clinic staff and patients.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. +91 9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor&apos;s Specialty <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 border-b flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input 
                      placeholder="Search specialties..." 
                      value={specialtySearch} 
                      onChange={(e) => setSpecialtySearch(e.target.value)} 
                      className="h-8 text-xs bg-slate-50 border-none shadow-none focus-visible:ring-0" 
                    />
                  </div>
                  {filteredSpecialties.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedSpecialty === 'Other' && (
          <FormField
            control={form.control}
            name="otherSpecialty"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                <FormLabel>Specify Specialty <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter your medical specialty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Update Profile'}
          </Button>
        </div>
        </form>
      </Form>
    </div>
  );
}
