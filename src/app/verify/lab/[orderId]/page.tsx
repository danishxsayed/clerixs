import * as React from 'react';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { format } from 'date-fns';
import { FlaskConical, CheckCircle2, ShieldCheck, Calendar, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Report Verification | Clerixs',
  description: 'Official medical report verification portal.',
};

interface VerifyPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ReportVerifyPage({ params }: VerifyPageProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams.orderId;
  const supabase = createAdminClient();

  // Fetch report data using admin client to bypass RLS for verification
  const { data: order, error } = await supabase
    .from('lab_orders')
    .select(`
      *,
      patients(full_name, patient_code),
      organizations(name, logo_url),
      lab_samples(collected_at),
      lab_results(result_value, lab_test_parameter_id, is_abnormal)
    `)
    .eq('id', orderId)
    .single();

  if (error || !order || order.status !== 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center space-y-6 border border-slate-100 italic">
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
             <FlaskConical className="h-10 w-10 opacity-20" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verification Failed</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We could not find a verified finalized report with this ID. Please ensure you are scanning an authentic document issued by an authorized clinic.
          </p>
          <div className="pt-6">
             <a href="/" className="text-sm font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">Return to Home</a>
          </div>
        </div>
      </div>
    );
  }

  const patient = order.patients;
  const clinic = order.organizations;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans selection:bg-blue-100">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative">
        
        {/* Verification Success Header */}
        <div className="bg-emerald-600 p-10 pt-14 text-center space-y-4 relative overflow-hidden">
           {/* Animated Background Decoration */}
           <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
           <div className="absolute bottom-0 left-0 h-32 w-32 bg-black/5 rounded-full -ml-16 -mb-16 blur-2xl" />
           
           <div className="relative inline-flex items-center justify-center h-20 w-20 bg-white rounded-full text-emerald-600 shadow-xl mb-2">
              <CheckCircle2 className="h-12 w-12" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Authentic Report</h1>
           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20">
              <ShieldCheck className="h-3 w-3" /> Secure Digital Verification
           </div>
        </div>

        <div className="p-10 md:p-14 space-y-12">
           
           {/* Report Summary */}
           <div className="space-y-8">
              <div className="flex items-start gap-5">
                 <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <User className="h-6 w-6" />
                 </div>
                 <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Patient Name</h2>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{patient?.full_name}</p>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">{patient?.patient_code}</p>
                 </div>
              </div>

              <div className="flex items-start gap-5">
                 <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Building2 className="h-6 w-6" />
                 </div>
                 <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Issuing Clinic</h2>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{clinic?.name}</p>
                 </div>
              </div>

              <div className="flex items-start gap-5">
                 <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Calendar className="h-6 w-6" />
                 </div>
                 <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Date Finalized</h2>
                    <p className="text-xl font-black text-slate-900 tracking-tight">
                       {format(new Date(order.updated_at), 'dd MMMM yyyy')}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Time: {format(new Date(order.updated_at), 'hh:mm a')}</p>
                 </div>
              </div>
           </div>

           {/* Security Confirmation */}
           <div className="pt-10 border-t border-slate-100">
              <div className="flex items-center gap-6 opacity-30">
                 <img src="/assets/logo.png" alt="Clerixs" className="h-8 filter grayscale" />
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                    This document has been verified against the original records in the Clerixs Secure Database.<br />Digital Signature ID: {order.id.split('-')[0].toUpperCase()}
                 </p>
              </div>
           </div>

           <div className="text-center pt-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                 Official Verification Portal
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
