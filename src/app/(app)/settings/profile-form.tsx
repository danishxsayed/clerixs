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

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
});

export function ProfileForm({ profile }: { profile: any }) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      avatar_url: profile.avatar_url || '',
    },
  });

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarUpload = (url: string) => {
    form.setValue('avatar_url', url, { shouldDirty: true });
    // Auto-save the profile when standard photo is uploaded
    onSubmit(form.getValues());
  };

  function onSubmit(values: z.infer<typeof profileSchema>) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Profile updated successfully');
    });
  }

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
