'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { inviteStaff } from './actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'doctor', 'receptionist', 'laboratory']),
});

export function StaffInviteForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'doctor',
    },
  });

  function onSubmit(values: z.infer<typeof inviteSchema>) {
    startTransition(async () => {
      const result = await inviteStaff(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.emailError) {
        toast.warning('Invitation created, but failed to send email.');
        setEmailError(result.emailError);
      } else {
        toast.success('Invitation sent successfully via email!');
        setEmailError(null);
      }

      if (result.token) {
        setInviteLink(`${window.location.origin}/invite?token=${result.token}`);
      }
      form.reset();
      router.refresh();
      // Do not call onSuccess yet, as we want to show the link copy screen
    });
  }

  const handleCopy = async () => {
    if (inviteLink) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(inviteLink);
        } else {
          // Fallback for non-https local dev
          const textArea = document.createElement("textarea");
          textArea.value = inviteLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
        }
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (inviteLink) {
    return (
      <div className="space-y-4 pt-2">
        <div className={cn(
          "rounded-md p-4 border",
          emailError 
            ? "bg-amber-50 border-amber-200 text-amber-800" 
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        )}>
          <h3 className="text-sm font-medium mb-1">
            {emailError ? 'Invitation Ready (Email Delivery Failed)' : 'Invitation Sent ✓'}
          </h3>
          <p className={cn(
            "text-sm",
            emailError ? "text-amber-600" : "text-emerald-600"
          )}>
            {emailError 
              ? `The invitation is created, but we couldn't send the invite email automatically: ${emailError}. Please copy the secure link below and send it directly.`
              : "We have sent a secure invitation email to your colleague. You can also copy the secure invite link below to send to them directly."}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Input value={inviteLink} readOnly className="bg-zinc-50 font-mono text-xs" />
           <Button type="button" size="icon" onClick={handleCopy} className="shrink-0">
             {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
           </Button>
        </div>
        <div className="pt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={() => { setInviteLink(null); if (onSuccess) onSuccess(); }}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="colleague@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrator / Owner</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="laboratory">Laboratory Technician</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
