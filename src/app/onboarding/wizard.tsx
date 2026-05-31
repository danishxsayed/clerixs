'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { 
  saveOnboardingStep1, 
  saveOnboardingStep2, 
  skipOnboardingStep2,
  saveOnboardingStep3,
  skipOnboardingStep3,
  completeOnboarding 
} from './actions';
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
import { Plus, Trash2, CheckCircle, Search, ArrowRight, User, BookOpen, LayoutDashboard } from 'lucide-react';
import * as motion from 'framer-motion/client';

const SPECIALTIES = [
  'General Physician',
  'Dentist',
  'Dermatologist / Skin Doctor',
  'Hair Transplant Surgeon',
  'Plastic Surgeon',
  'Cosmetic Surgeon',
  'Orthopedic Doctor',
  'Gynecologist / Obstetrician',
  'Pediatrician',
  'Cardiologist',
  'ENT Specialist',
  'Ophthalmologist / Eye Specialist',
  'Neurologist',
  'Endocrinologist / Diabetologist',
  'Psychiatrist',
  'Urologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Nephrologist',
  'Oncologist',
  'Rheumatologist',
  'Other'
];

const step1Schema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  avatar_url: z.string().optional(),
  currency: z.string().min(1, 'Currency is required.'),
  timezone: z.string().min(1, 'Timezone is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
  fullName: z.string().min(2, "Doctor's full name is required."),
  specialty: z.string().min(1, 'Specialty is required.'),
  otherSpecialty: z.string().optional(),
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
    fullName: string;
    specialty: string;
    onboardingStep: number;
  };
}

export function OnboardingWizard({ userId, initialData }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(1);
  const [specialtySelected, setSpecialtySelected] = React.useState<string>(initialData.specialty || '');
  const [isPending, startTransition] = React.useTransition();

  // Load step from database or local storage on mount
  React.useEffect(() => {
    if (initialData.onboardingStep) {
      setStep(initialData.onboardingStep);
    }
  }, [initialData.onboardingStep]);

  // Form Step 1
  const formStep1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: initialData.name || '',
      avatar_url: initialData.avatar_url || '',
      currency: initialData.currency || 'INR',
      timezone: initialData.timezone || 'Asia/Kolkata',
      phone: initialData.phone || '',
      address: initialData.address || '',
      fullName: initialData.fullName || '',
      specialty: initialData.specialty || '',
      otherSpecialty: '',
    },
  });

  // Watch for specialty field
  const selectedSpecialty = formStep1.watch('specialty');

  // Step 2 & 3 custom states
  interface PriceItem {
    name: string;
    category: string;
    price: number;
  }

  interface LabItem {
    name: string;
    category: string;
    sample_type: string;
    price: number;
  }

  const [priceItems, setPriceItems] = React.useState<PriceItem[]>([]);
  const [labItems, setLabItems] = React.useState<LabItem[]>([]);

  // Pre-fill suggestions based on specialty selected in Step 1
  const generateSuggestions = (spec: string) => {
    // 1. Price Catalog Suggestions
    let priceSugs: PriceItem[] = [];
    if (spec.includes('Dentist')) {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 300 },
        { name: 'Tooth Extraction', category: 'Procedure', price: 800 },
        { name: 'Root Canal', category: 'Procedure', price: 3500 },
      ];
    } else if (spec.includes('Dermatologist') || spec.includes('Skin') || spec.includes('Cosmetic') || spec.includes('Plastic') || spec.includes('Hair')) {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 500 },
        { name: 'Chemical Peel', category: 'Procedure', price: 2500 },
        { name: 'Botox Session', category: 'Procedure', price: 8000 },
      ];
    } else if (spec.includes('General Physician') || spec.includes('Family')) {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 300 },
        { name: 'Follow-up Visit', category: 'Consultation', price: 150 },
        { name: 'Home Visit', category: 'Consultation', price: 800 },
      ];
    } else if (spec.includes('Endocrinologist') || spec.includes('Diabetologist')) {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 600 },
        { name: 'HbA1c Test', category: 'Lab Test', price: 400 },
        { name: 'Thyroid Panel', category: 'Lab Test', price: 600 },
      ];
    } else if (spec.includes('Pediatrician')) {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 400 },
        { name: 'Vaccination Visit', category: 'Consultation', price: 200 },
        { name: 'Growth Assessment', category: 'Procedure', price: 300 },
      ];
    } else if (spec.includes('Orthopedic')) {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 500 },
        { name: 'X-Ray Review', category: 'Other', price: 200 },
        { name: 'Physiotherapy Session', category: 'Procedure', price: 800 },
      ];
    } else {
      priceSugs = [
        { name: 'Consultation', category: 'Consultation', price: 500 },
        { name: 'Follow-up Consultation', category: 'Consultation', price: 300 },
        { name: 'Specialist Procedure', category: 'Procedure', price: 2000 },
      ];
    }
    setPriceItems(priceSugs);

    // 2. Lab Catalog Suggestions
    let labSugs: LabItem[] = [];
    if (spec.includes('Endocrinologist') || spec.includes('Diabetologist')) {
      labSugs = [
        { name: 'HbA1c', category: 'Biochemistry', sample_type: 'Blood', price: 400 },
        { name: 'Fasting Blood Sugar', category: 'Biochemistry', sample_type: 'Blood', price: 100 },
        { name: 'TSH', category: 'Hormones', sample_type: 'Blood', price: 300 },
        { name: 'Vitamin D3', category: 'Vitamins', sample_type: 'Blood', price: 1200 },
        { name: 'Lipid Profile', category: 'Biochemistry', sample_type: 'Blood', price: 600 },
      ];
    } else if (spec.includes('Dentist')) {
      labSugs = [
        { name: 'Blood Group', category: 'Hematology', sample_type: 'Blood', price: 150 },
        { name: 'Complete Blood Count', category: 'Hematology', sample_type: 'Blood', price: 350 },
        { name: 'Blood Glucose', category: 'Biochemistry', sample_type: 'Blood', price: 100 },
      ];
    } else if (spec.includes('Dermatologist') || spec.includes('Skin')) {
      labSugs = [
        { name: 'KOH Mount', category: 'Microbiology', sample_type: 'Swab', price: 250 },
        { name: 'Skin Biopsy', category: 'Histopathology', sample_type: 'Other', price: 1500 },
        { name: 'Patch Test', category: 'Allergy', sample_type: 'Other', price: 2000 },
        { name: 'Hormone Panel', category: 'Hormones', sample_type: 'Blood', price: 1800 },
      ];
    } else if (spec.includes('General Physician') || spec.includes('Family')) {
      labSugs = [
        { name: 'Complete Blood Count', category: 'Hematology', sample_type: 'Blood', price: 350 },
        { name: 'Urine Routine', category: 'Clinical Pathology', sample_type: 'Urine', price: 150 },
        { name: 'Blood Glucose', category: 'Biochemistry', sample_type: 'Blood', price: 100 },
        { name: 'Lipid Profile', category: 'Biochemistry', sample_type: 'Blood', price: 600 },
      ];
    } else if (spec.includes('Pediatrician')) {
      labSugs = [
        { name: 'Complete Blood Count', category: 'Hematology', sample_type: 'Blood', price: 350 },
        { name: 'Hemoglobin', category: 'Hematology', sample_type: 'Blood', price: 100 },
        { name: 'Stool Routine', category: 'Clinical Pathology', sample_type: 'Other', price: 150 },
        { name: 'Urine Routine', category: 'Clinical Pathology', sample_type: 'Urine', price: 150 },
      ];
    } else {
      labSugs = [
        { name: 'Complete Blood Count', category: 'Hematology', sample_type: 'Blood', price: 350 },
        { name: 'Urine Routine', category: 'Clinical Pathology', sample_type: 'Urine', price: 150 },
        { name: 'Blood Glucose', category: 'Biochemistry', sample_type: 'Blood', price: 100 },
      ];
    }
    setLabItems(labSugs);
  };

  // Run suggestion generation once specialty is loaded on mount or changed
  React.useEffect(() => {
    if (specialtySelected) {
      generateSuggestions(specialtySelected);
    }
  }, [specialtySelected]);

  // Submit Step 1
  const onSubmitStep1 = (values: z.infer<typeof step1Schema>) => {
    startTransition(async () => {
      const result = await saveOnboardingStep1(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const actualSpecialty = values.specialty === 'Other' ? values.otherSpecialty || 'Other' : values.specialty;
      setSpecialtySelected(actualSpecialty);
      setStep(2);
    });
  };

  // Submit Step 2
  const onSubmitStep2 = () => {
    startTransition(async () => {
      const result = await saveOnboardingStep2({ items: priceItems });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setStep(3);
    });
  };

  // Skip Step 2
  const onSkipStep2 = () => {
    startTransition(async () => {
      const result = await skipOnboardingStep2();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setStep(3);
    });
  };

  // Submit Step 3
  const onSubmitStep3 = () => {
    startTransition(async () => {
      const result = await saveOnboardingStep3({ items: labItems });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setStep(4);
    });
  };

  // Skip Step 3
  const onSkipStep3 = () => {
    startTransition(async () => {
      const result = await skipOnboardingStep3();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setStep(4);
    });
  };

  // Complete onboarding from Step 4
  const onFinishOnboarding = () => {
    startTransition(async () => {
      const result = await completeOnboarding();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Clinic onboarding completed successfully!');
      router.push('/dashboard');
      router.refresh();
    });
  };

  // Search filter for specialty select
  const [specialtySearch, setSpecialtySearch] = React.useState('');
  const filteredSpecialties = SPECIALTIES.filter(s => 
    s.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl animate-in slide-in-from-bottom-4 fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center tracking-tight">Set up your clinic workspace</h1>
        <p className="text-center text-muted-foreground mt-2">Just a few details to get your Practice Ready.</p>
        
        {/* Progress Bar */}
        <div className="mt-6 flex flex-col items-center">
           <div className="w-full max-w-md bg-muted rounded-full h-2 mb-2 overflow-hidden">
             <div className="bg-[#0285F4] h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${(step / 4) * 100}%` }} />
           </div>
           <p className="text-sm font-medium text-muted-foreground">Step {step} of 4 {step === 4 && '— Complete!'}</p>
        </div>
      </div>

      <Card className="shadow-lg border-muted/60 bg-white">
        {step === 1 && (
          <>
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <CardTitle>Clinic & Doctor Details</CardTitle>
              <CardDescription>Tell us about your clinic practice and medical specialties.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-8">
              <Form {...formStep1}>
                <form id="step1-form" onSubmit={formStep1.handleSubmit(onSubmitStep1)} className="space-y-6">
                  
                  <AvatarUpload 
                    userId={userId}
                    initials={formStep1.getValues('name')?.substring(0, 2).toUpperCase() || 'CL'}
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
                            <Input placeholder="E.g. DentalHQ Clinic" {...field} />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={formStep1.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor&apos;s Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Dr. Ramesh Sharma" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formStep1.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor&apos;s Specialty <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              <div className="p-2 border-b flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                <Input 
                                  placeholder="Search specialties..." 
                                  value={specialtySearch} 
                                  onChange={(e) => setSpecialtySearch(e.target.value)} 
                                  className="h-8 text-xs bg-slate-50 border-none shadow-none focus-visible:ring-0" 
                                />
                              </div>
                              {filteredSpecialties.map(spec => (
                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {selectedSpecialty === 'Other' && (
                    <FormField
                      control={formStep1.control}
                      name="otherSpecialty"
                      render={({ field }) => (
                        <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <FormLabel>Specify Specialty <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your medical specialty" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={formStep1.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full postal address of your clinic" rows={3} className="resize-none" {...field} />
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
                {isPending ? 'Saving...' : 'Save & Continue'}
              </Button>
            </CardFooter>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <CardTitle>Set up your service pricing</CardTitle>
              <CardDescription>Add your consultation fees and treatment prices. You can always update these later in Settings.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-8">
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white mb-6">
                <table className="w-full text-sm text-left text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-6 py-3">Service Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Price (₹)</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {priceItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3">
                          <Input 
                            value={item.name} 
                            placeholder="Consultation, Cleaning..."
                            onChange={(e) => {
                              const updated = [...priceItems];
                              updated[index].name = e.target.value;
                              setPriceItems(updated);
                            }}
                            className="h-9 text-slate-900 border-slate-200"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <Select 
                            value={item.category} 
                            onValueChange={(val) => {
                              const updated = [...priceItems];
                              updated[index].category = val || '';
                              setPriceItems(updated);
                            }}
                          >
                            <SelectTrigger className="h-9 border-slate-200">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Consultation">Consultation</SelectItem>
                              <SelectItem value="Procedure">Procedure</SelectItem>
                              <SelectItem value="Lab Test">Lab Test</SelectItem>
                              <SelectItem value="Medicine">Medicine</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-3">
                          <Input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => {
                              const updated = [...priceItems];
                              updated[index].price = Number(e.target.value);
                              setPriceItems(updated);
                            }}
                            className="h-9 text-slate-900 border-slate-200"
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const updated = priceItems.filter((_, i) => i !== index);
                              setPriceItems(updated);
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {priceItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic font-medium">
                          No service catalog items added yet. Click &apos;+ Add Item&apos; to begin!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setPriceItems([...priceItems, { name: '', category: 'Consultation', price: 0 }])}
                className="w-full flex items-center justify-center gap-2 border-dashed border-slate-300 hover:bg-slate-50 h-11 font-semibold rounded-xl text-slate-700 shadow-none"
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </CardContent>
            <CardFooter className="px-6 py-5 bg-muted/10 border-t flex justify-between items-center">
              <button 
                onClick={onSkipStep2} 
                disabled={isPending}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Skip for now
              </button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} disabled={isPending}>Back</Button>
                <Button onClick={onSubmitStep2} size="lg" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </CardFooter>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="border-b bg-muted/20 px-6 py-5">
              <CardTitle>Configure your lab tests</CardTitle>
              <CardDescription>Add the lab tests you commonly order. Skip this if you don&apos;t run or order lab reports.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-8">
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white mb-6">
                <table className="w-full text-sm text-left text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-6 py-3">Test Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Sample Type</th>
                      <th className="px-6 py-3">Price (₹)</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3">
                          <Input 
                            value={item.name} 
                            placeholder="Complete Blood Count, Fasting Blood Sugar..."
                            onChange={(e) => {
                              const updated = [...labItems];
                              updated[index].name = e.target.value;
                              setLabItems(updated);
                            }}
                            className="h-9 text-slate-900 border-slate-200"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <Input 
                            value={item.category} 
                            placeholder="E.g. Biochemistry"
                            onChange={(e) => {
                              const updated = [...labItems];
                              updated[index].category = e.target.value;
                              setLabItems(updated);
                            }}
                            className="h-9 text-slate-900 border-slate-200"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <Select 
                            value={item.sample_type} 
                            onValueChange={(val) => {
                              const updated = [...labItems];
                              updated[index].sample_type = val || '';
                              setLabItems(updated);
                            }}
                          >
                            <SelectTrigger className="h-9 border-slate-200">
                              <SelectValue placeholder="Sample Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Blood">Blood</SelectItem>
                              <SelectItem value="Urine">Urine</SelectItem>
                              <SelectItem value="Saliva">Saliva</SelectItem>
                              <SelectItem value="Swab">Swab</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-3">
                          <Input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => {
                              const updated = [...labItems];
                              updated[index].price = Number(e.target.value);
                              setLabItems(updated);
                            }}
                            className="h-9 text-slate-900 border-slate-200"
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const updated = labItems.filter((_, i) => i !== index);
                              setLabItems(updated);
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {labItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic font-medium">
                          No lab tests added yet. Click &apos;+ Add Item&apos; to begin!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setLabItems([...labItems, { name: '', category: 'General', sample_type: 'Blood', price: 0 }])}
                className="w-full flex items-center justify-center gap-2 border-dashed border-slate-300 hover:bg-slate-50 h-11 font-semibold rounded-xl text-slate-700 shadow-none"
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </CardContent>
            <CardFooter className="px-6 py-5 bg-muted/10 border-t flex justify-between items-center">
              <Button 
                variant="outline"
                onClick={onSkipStep3} 
                disabled={isPending}
                className="text-xs font-bold text-slate-500 border-slate-200 hover:bg-slate-50 h-10 shadow-none rounded-xl"
              >
                Skip — I don&apos;t run a lab
              </Button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} disabled={isPending}>Back</Button>
                <Button onClick={onSubmitStep3} size="lg" disabled={isPending}>
                  {isPending ? 'Save & Continue' : 'Save & Continue'}
                </Button>
              </div>
            </CardFooter>
          </>
        )}

        {step === 4 && (
          <div className="p-8 text-center flex flex-col items-center">
            {/* Celebrate animation */}
            <div className="bg-gradient-to-br from-[#0285F4] to-[#04E19E] p-8 rounded-full shadow-2xl mb-8 animate-[pulse_2s_ease-in-out_infinite] text-white">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#0285F4] to-[#04E19E] bg-clip-text text-transparent mb-2">
              Your clinic is ready! 🎉
            </h1>
            <p className="text-lg text-slate-500 font-semibold mb-8">
              Welcome to Clerixs, {formStep1.getValues('fullName') || 'Doctor'}!
            </p>

            {/* Summary Bento Card */}
            <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left shadow-inner mb-8 space-y-3 font-semibold text-slate-700 text-sm">
              <div className="flex items-center gap-2 text-slate-900 text-base font-black mb-1 border-b pb-2">
                <span>Workspace Setup Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✅</span>
                <span>Clinic: <strong className="text-slate-900">{formStep1.getValues('name')}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✅</span>
                <span>Specialty: <strong className="text-slate-900">{specialtySelected}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✅</span>
                <span>Services added: <strong className="text-slate-900">{priceItems.length > 0 ? `${priceItems.length} items` : 'Skipped'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">✅</span>
                <span>Lab tests added: <strong className="text-slate-900">{labItems.length > 0 ? `${labItems.length} items` : 'Skipped'}</strong></span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
              <Button variant="outline" onClick={onFinishOnboarding} className="h-24 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-center gap-1 hover:shadow-md transition-all group">
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">Add first patient <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              </Button>
              <Button variant="outline" onClick={onFinishOnboarding} className="h-24 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-center gap-1 hover:shadow-md transition-all group">
                <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">Book appointment <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              </Button>
              <Button variant="outline" onClick={onFinishOnboarding} className="h-24 bg-white hover:bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-center gap-1 hover:shadow-md transition-all group">
                <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">Explore dashboard <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
              </Button>
            </div>

            <Button onClick={onFinishOnboarding} size="lg" className="w-full h-14 text-base font-bold shadow-lg shadow-blue-500/20 rounded-2xl cursor-pointer">
              Go to Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
