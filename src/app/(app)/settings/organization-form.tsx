'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateOrganization } from './actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SignatureUpload } from '@/components/ui/signature-upload';
import { LetterheadUpload } from '@/components/ui/letterhead-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const organizationSchema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string(),
  currency: z.string(),
  signature_url: z.string().optional(),
  letterhead_url: z.string().optional(),
});

export function OrganizationForm({ organization, profileId }: { organization: any, profileId: string }) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name || '',
      phone: organization.phone || '',
      address: organization.address || '',
      timezone: organization.timezone || 'Asia/Kolkata',
      currency: organization.currency || 'INR',
      signature_url: organization.signature_url || '',
      letterhead_url: organization.letterhead_url || '',
    },
  });

  const handleSignatureUpload = (url: string) => {
    form.setValue('signature_url', url, { shouldDirty: true });
    onSubmit(form.getValues());
  };

  const handleLetterheadUpload = (url: string) => {
    form.setValue('letterhead_url', url, { shouldDirty: true });
    onSubmit(form.getValues());
  };

  function onSubmit(values: z.infer<typeof organizationSchema>) {
    startTransition(async () => {
      const result = await updateOrganization(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Clinic settings updated successfully');
      window.location.reload();
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b pb-8">
        <h3 className="text-lg font-medium">Digital Signature</h3>
        <p className="text-sm text-muted-foreground">
          This signature will be applied universally to all printed prescriptions for the clinic.
        </p>
        <SignatureUpload 
          userId={profileId} // using owner's profile id to satisfy the avatar bucket's RLS policy: folder name must equal auth.uid()
          initialUrl={organization.signature_url}
          onUploadComplete={handleSignatureUpload}
        />
      </div>

      <div className="space-y-4 border-b pb-8">
        <h3 className="text-lg font-medium">Clinic Letterhead</h3>
        <p className="text-sm text-muted-foreground">
          Upload an official letterhead banner to be used across all generated PDF invoices and prescriptions.
        </p>
        <LetterheadUpload 
          userId={profileId}
          initialUrl={organization.letterhead_url}
          onUploadComplete={handleLetterheadUpload}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic / Organization Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="E.g. DentalHQ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic Phone</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. +91 99999 99999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Address</FormLabel>
              <FormControl>
                <Input placeholder="Full postal address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Used for all invoices</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Timezone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="UTC">UTC Equivalent</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Used for appointments</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Update Clinic Settings'}
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
