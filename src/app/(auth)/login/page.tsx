import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { login } from '../actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 light">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="text-center flex flex-col items-center">
          <div className="relative mb-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <Image
              src="/assets/logo.jpg"
              alt="Clerixs Logo"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to your Clerixs account</p>
        </div>

        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-slate-700" htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none text-slate-700" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
              className="bg-white"
            />
          </div>
          
          {resolvedSearchParams?.message && (
            <div className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded-md border border-red-100">
              {resolvedSearchParams.message}
            </div>
          )}
          
          <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
