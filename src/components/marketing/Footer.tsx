import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full border-t bg-slate-50 py-12 light">
      <div className="container mx-auto px-4 md:px-6 text-slate-900">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
                <Image
                  src="/assets/logo.jpg"
                  alt="Clerixs Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Clerixs</span>
            </Link>
            <p className="text-sm text-slate-500 font-medium">
              Modern clinic management software designed to simplify your operations and elevate patient care.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slate-900">Product</h3>
            <Link href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Testimonials</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slate-900">Company</h3>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About</Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Blog</Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Careers</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-slate-900">Legal</h3>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between border-t pt-8">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Clerixs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
