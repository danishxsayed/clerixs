'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { updateUserPassword } from './actions';

const passwordSchema = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirm_password: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  function onSubmit(data: PasswordFormValues) {
    startTransition(async () => {
      const result = await updateUserPassword({ password: data.new_password });
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Password updated successfully');
      form.reset();
    });
  }

  return (
    <div className="mt-8 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6 border-b pb-4">
        <h3 className="font-semibold text-xl">Change Password</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ensure your account uses a strong, secure password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
