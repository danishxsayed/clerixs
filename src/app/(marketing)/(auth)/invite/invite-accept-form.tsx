'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { acceptInvite } from '../actions';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function InviteAcceptForm({ token, initialEmail }: { token: string; initialEmail: string }) {
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

  // Since acceptInvite has redirects, form will navigate away on success.
  // We handle error states using query strings in reality, but this provides a fallback UI.
  return (
    <form action={acceptInvite} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input 
            id="email" 
            name="email" 
            type="email" 
            defaultValue={initialEmail} 
            readOnly 
            className="bg-muted/50 text-muted-foreground pointer-events-none"
        />
        <p className="text-xs text-muted-foreground">This email is locked to the invitation securely.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
            id="fullName" 
            name="fullName" 
            type="text" 
            placeholder="Dr. John Doe"
            required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Create Password</Label>
        <PasswordInput 
            id="password" 
            name="password" 
            placeholder="••••••••"
            required
            minLength={6}
        />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? 'Joining...' : 'Accept Invite & Join'}
    </Button>
  );
}
