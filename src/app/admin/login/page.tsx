import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
};
import Image from 'next/image';
import { adminLogin } from './actions';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams.message;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Dynamic decorative backdrop grids */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="flex flex-col items-center relative z-10">
          {/* Logo */}
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-md mb-4 border border-slate-100 flex items-center justify-center">
            <Image src="/assets/logo.png" alt="Clerixs" fill className="object-contain p-1" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clerixs</h2>

          {/* Red Badge */}
          <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        <form action={adminLogin} className="mt-8 space-y-6 relative z-10">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                placeholder="admin@clerixs.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {message && (
            <div className="text-sm text-red-600 text-center font-bold bg-red-50 p-4 rounded-xl border border-red-100">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center text-base font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-600/10 cursor-pointer"
          >
            Sign In to Admin Panel
          </button>
        </form>
      </div>
    </div>
  );
}
