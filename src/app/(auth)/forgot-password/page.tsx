import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '../actions';
import { AlertCircle } from 'lucide-react';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string, success: string }>;
}) {
  const { message, success } = await searchParams;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border">
        <div className="text-center flex flex-col items-center">
          <div className="relative mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <Image
              src="/assets/logo.jpg"
              alt="Clerixs Logo"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
        </div>

        {success ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 text-center border border-green-200">
                {success}
            </div>
        ) : (
            <form action={requestPasswordReset} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">Email address</label>
                <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                />
            </div>
            
            {message && (
                <div className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded-md flex items-center justify-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {message}
                </div>
            )}
            
            <Button type="submit" className="w-full">
                Send Reset Link
            </Button>
            </form>
        )}

        <div className="text-center text-sm text-muted-foreground mt-4">
          Remember your password?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
