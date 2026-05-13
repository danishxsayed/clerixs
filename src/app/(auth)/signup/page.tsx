import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { ChevronRight, Mail, Lock, UserPlus, User } from 'lucide-react';
import { signup } from '../actions';
import * as motion from 'framer-motion/client';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedSearchParams = await searchParams;

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
               <Image src="/assets/logo.jpg" alt="Clerixs" fill className="object-contain" />
             </div>
             <span className="text-2xl font-extrabold text-white tracking-tight">CLERIXS</span>
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
             <form action={signup} className="space-y-5">
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">Full Name</label>
                 <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                     <User size={18} />
                   </div>
                   <Input 
                     id="fullName" 
                     name="fullName" 
                     type="text" 
                     placeholder="eg. Dr. John Doe" 
                     required 
                     className="h-14 pl-12 bg-white text-slate-900 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base rounded-xl shadow-none dark:bg-white dark:text-slate-900 dark:border-slate-200" 
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
                 <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                     <Mail size={18} />
                   </div>
                   <Input 
                     id="email" 
                     name="email" 
                     type="email" 
                     placeholder="eg. pixelcot@gmail.com" 
                     required 
                     className="h-14 pl-12 bg-white text-slate-900 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base rounded-xl shadow-none dark:bg-white dark:text-slate-900 dark:border-slate-200" 
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                 <div className="relative group">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-20">
                     <Lock size={18} />
                   </div>
                   <PasswordInput 
                     id="password" 
                     name="password" 
                     placeholder="***************" 
                     required 
                     minLength={6}
                     className="h-14 pl-12 bg-white text-slate-900 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base rounded-xl shadow-none [&>input]:pl-12 dark:bg-white dark:text-slate-900 dark:border-slate-200" 
                   />
                 </div>
               </div>
               
               {resolvedSearchParams?.message && (
                 <div className="text-sm text-red-600 text-center font-bold bg-red-50 p-4 rounded-xl border border-red-100">
                   {resolvedSearchParams.message}
                 </div>
               )}
               
               <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] rounded-xl">
                 Sign Up
               </Button>
             </form>

             <div className="text-center text-sm text-slate-600 pt-4">
               Already have an account?{' '}
               <Link href="/login" className="font-bold text-primary hover:underline">
                 Sign in
               </Link>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
