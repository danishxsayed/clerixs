import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
};
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { ChevronRight, Mail, Lock, UserPlus, User } from 'lucide-react';
import { signup } from '../actions';
import * as motion from 'framer-motion/client';

import { SignupForm } from './signup-form';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; success?: string }>;
}) {
  const { message, success } = await searchParams;

  return (
    <div className="flex min-h-screen w-full bg-white light overflow-hidden">
      {/* Left Panel: Graphic (hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden border-r border-zinc-800">
        <Image
          src="/assets/auth-bg.png"
          alt="Abstract Medical Technology"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white shadow-md">
              <Image src="/assets/logo.png" alt="Clerixs" fill className="object-contain" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Clerixs</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mt-auto mb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm font-medium text-zinc-300 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
              Smart Clinic Platform
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Secure your account and stay protected.
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
              Join thousands of healthcare professionals who trust Clerixs for their clinic management needs.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Form Redesigned to match requested image */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12 relative bg-white light">
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Grid Background Header Area */}
          <div className="relative flex flex-col items-center mb-10">
            <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] opacity-[0.08] pointer-events-none"
              style={{ backgroundImage: 'linear-gradient(#0052cc 1px, transparent 1px), linear-gradient(90deg, #0052cc 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-10 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6"
            >
              <UserPlus className="text-white w-8 h-8" />
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account!</h2>
              <p className="text-slate-500 font-medium">Join Clerixs and start managing your clinic with ease!</p>
            </div>
          </div>

          <div className="space-y-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-emerald-50 p-6 text-sm text-emerald-800 text-center border border-emerald-200 font-bold space-y-2"
              >
                <p>Registration successful! Please check your inbox and verify your email address before logging in.</p>
                <p className="text-xs text-emerald-600 font-normal">If you don&apos;t see the email, please check your spam/junk folder.</p>
              </motion.div>
            ) : (
              <>
                <SignupForm />

                {message && (
                  <div className="text-sm text-red-600 text-center font-bold bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                    {message}
                  </div>
                )}
              </>
            )}

            <div className="text-center text-sm text-slate-600 pt-4">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
