import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { InviteAcceptForm } from './invite-accept-form';
import { AlertCircle, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string, message?: string }>;
}) {
  const { token, message } = await searchParams;

  if (!token) {
    return redirect('/login');
  }

  const supabase = await createClient();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: invite, error: inviteErr } = await supabase
    .from('staff_invites')
    .select('email, expires_at, role')
    .eq('invite_token_hash', tokenHash)
    .is('accepted_at', null)
    .maybeSingle();

  const isInvalid = !invite;
  const isExpired = invite && new Date(invite.expires_at) < new Date();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm border">
        
        <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
               <Stethoscope className="h-6 w-6" />
            </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Join Clinic</h2>
          <p className="text-sm text-muted-foreground">
            {isInvalid || isExpired 
                ? 'This invitation is no longer valid' 
                : 'Complete your profile to access Clerixs'}
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-destructive/15 p-3 flex items-start text-sm text-destructive border border-destructive/20 mt-4">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
        
        {inviteErr && (
          <div className="rounded-md bg-orange-100 p-3 text-sm text-orange-800 mt-4">
            <b>Database Error:</b> {inviteErr.message} <br/>
            <b>Details:</b> {inviteErr.details} <br/>
            <b>Hint:</b> {inviteErr.hint}
          </div>
        )}

        {isInvalid || isExpired ? (
            <div className="pt-4 text-center space-y-4">
                <div className="rounded-xl border border-dashed p-6 bg-slate-50 text-muted-foreground text-sm">
                    {isExpired ? 'This invite link has expired.' : 'This invite link is invalid or has already been accepted.'}
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/login">Return to Login</Link>
                </Button>
            </div>
        ) : (
            <InviteAcceptForm token={token} initialEmail={invite.email} />
        )}

      </div>
    </div>
  );
}
