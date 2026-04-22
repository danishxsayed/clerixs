'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { saveOnboardingStep1, saveOnboardingStep2, completeOnboarding } from './actions';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { SignatureUpload } from '@/components/ui/signature-upload';
import { LetterheadUpload } from '@/components/ui/letterhead-upload';

const step1Schema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  avatar_url: z.string().optional(),
  currency: z.string().min(1, 'Currency is required.'),
  timezone: z.string().min(1, 'Timezone is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
});

const step2Schema = z.object({
  letterhead_url: z.string().optional(),
  signature_url: z.string().optional(),
});

interface WizardProps {
  userId: string;
  initialData: {
    name: string;
    timezone: string;
    currency: string;
    avatar_url?: string;
    phone?: string;
    address?: string;
    letterhead_url?: string;
    signature_url?: string;
  };
}

export function OnboardingWizard({ userId, initialData }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(1);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Load step from local storage on mount
  React.useEffect(() => {
    const savedStep = localStorage.getItem('onboardingStep');
    if (savedStep && parseInt(savedStep, 10) === 2) {
      setStep(2);
    }
  }, []);

  const goToStep2 = () => {
    setStep(2);
    localStorage.setItem('onboardingStep', '2');
  };

  const formStep1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: initialData.name || '',
      avatar_url: initialData.avatar_url || '',
      currency: initialData.currency || 'INR',
      timezone: initialData.timezone || 'Asia/Kolkata',
      phone: initialData.phone || '',
      address: initialData.address || '',
    },
  });

  const formStep2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      letterhead_url: initialData.letterhead_url || '',
      signature_url: initialData.signature_url || '',
    },
  });

  const onSubmitStep1 = (values: z.infer<typeof step1Schema>) => {
    startTransition(async () => {
      const result = await saveOnboardingStep1(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      goToStep2();
    });
  };

  const finalizeWizard = async (redirectDelayMs = 2000) => {
    const completeResult = await completeOnboarding();
    if (completeResult.error) {
       toast.error(completeResult.error);
       return;
    }
    localStorage.removeItem('onboardingStep');
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/settings/subscription');
      router.refresh();
    }, redirectDelayMs);
  };

  const onSubmitStep2 = (values: z.infer<typeof step2Schema>) => {
    startTransition(async () => {
      const result = await saveOnboardingStep2(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      await finalizeWizard();
    });
  };

  const onSkipStep2 = () => {
    startTransition(async () => {
      await finalizeWizard();
    });
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div className="bg-gradient-to-br from-[#0285F4] to-[#04E19E] p-8 rounded-full shadow-2xl mb-8 animate-[pulse_2s_ease-in-out_infinite]">
            {/* Minimal SVG Logo Placeholder for Clarixs */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 bg-gradient-to-r from-[#0285F4] to-[#04E19E] bg-clip-text text-transparent">
          Welcome to Clerixs!
        </h1>
        <p className="mt-4 text-xl font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700">
          Your clinic is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center tracking-tight">Set up your clinic</h1>
        <p className="text-center text-muted-foreground mt-2">Just a few details to get your workspace ready.</p>
        
        {/* Progress Bar */}
        <div className="mt-6 flex flex-col items-center">
           <div className="w-full max-w-md bg-muted rounded-full h-2 mb-2 overflow-hidden">
             <div className="bg-[#0285F4] h-2 rounded-full transition-all duration-500 ease-out" style={{ width: step === 1 ? '50%' : '100%' }} />
           </div>
           <p className="text-sm font-medium text-muted-foreground">Step {step} of 2</p>
        </div>
      </div>

      <Card className="shadow-lg border-muted/60">
        {step === 1 && (
          <>
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <CardTitle>Clinic Details</CardTitle>
              <CardDescription>Tell us about your organization.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-8">
              <Form {...formStep1}>
                <form id="step1-form" onSubmit={formStep1.handleSubmit(onSubmitStep1)} className="space-y-6">
                  
                  <AvatarUpload 
                    userId={userId}
                    initials={formStep1.getValues('name')?.substring(0, 2).toUpperCase() || 'U'}
                    initialUrl={formStep1.getValues('avatar_url')}
                    onUploadComplete={(url) => formStep1.setValue('avatar_url', url, { shouldDirty: true })} 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={formStep1.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic / Organization Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. DentalHQ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formStep1.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+91 99999 99999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={formStep1.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full postal address" rows={3} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={formStep1.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                              <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                              <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formStep1.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                              <SelectItem value="UTC">UTC Equivalent</SelectItem>
                              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="px-6 py-5 bg-muted/10 border-t flex justify-end">
              <Button type="submit" form="step1-form" size="lg" disabled={isPending}>
                {isPending ? 'Saving...' : 'Continue'}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <CardTitle>Letterhead & Signature</CardTitle>
              <CardDescription>Add an official touch to your prescriptions and invoices. You can always skip and do this later.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-8 space-y-10">
              
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Clinic Letterhead <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span></h3>
                <LetterheadUpload 
                  userId={userId}
                  initialUrl={formStep2.getValues('letterhead_url')}
                  onUploadComplete={(url) => formStep2.setValue('letterhead_url', url, { shouldDirty: true })}
                />
              </div>

              <div className="w-full h-px bg-border" />

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Doctor Digital Signature <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span></h3>
                <SignatureUpload 
                  userId={userId} 
                  initialUrl={formStep2.getValues('signature_url')}
                  onUploadComplete={(url) => formStep2.setValue('signature_url', url, { shouldDirty: true })}
                />
              </div>

            </CardContent>
            <CardFooter className="px-6 py-5 bg-muted/10 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={isPending}>Back</Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onSkipStep2} disabled={isPending}>
                  {isPending ? 'Finishing...' : 'Skip for now'}
                </Button>
                <Button type="button" onClick={() => onSubmitStep2(formStep2.getValues())} disabled={isPending}>
                  {isPending ? 'Saving...' : 'Finish Setup'}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
