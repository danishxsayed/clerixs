import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md light">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
            <Image
              src="/assets/logo.jpg"
              alt="Clerixs Logo"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Clerixs</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link href="/#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Testimonials
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild className="rounded-full shadow-sm px-6">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Button asChild className="rounded-full shadow-sm bg-primary text-white hover:bg-primary/90">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
