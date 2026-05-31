'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Mail, Lock, User } from 'lucide-react';
import { signup } from '../actions';
import { toast } from 'sonner';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

function SignupButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] rounded-xl flex items-center justify-center"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Creating Account...
        </>
      ) : (
        'Sign Up'
      )}
    </Button>
  );
}

export function SignupForm() {
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  
  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (val && !emailRegex.test(val)) {
      setEmailError('Please enter a valid email address (e.g. doctor@clinic.com)');
      return false;
    } else if (!val) {
      setEmailError('Email is required');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleBlur = () => {
    validateEmail(email);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateEmail(email)) {
      e.preventDefault();
      toast.error('Please enter a valid email address (e.g. doctor@clinic.com)');
    }
  };

  return (
    <form action={signup} onSubmit={handleSubmit} noValidate className="space-y-5">
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
            type="text" 
            placeholder="eg. pixelcot@gmail.com" 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={handleBlur}
            className={`h-14 pl-12 bg-white text-slate-900 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-base rounded-xl shadow-none dark:bg-white dark:text-slate-900 dark:border-slate-200 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`} 
          />
        </div>
        {emailError && (
          <p className="text-xs font-bold text-red-500 mt-1">
            {emailError}
          </p>
        )}
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
      
      <SignupButton />
    </form>
  );
}
