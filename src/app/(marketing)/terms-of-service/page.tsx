import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Scale, FileCheck, AlertCircle, CreditCard, HelpCircle, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Clerixs',
  description: 'The terms and conditions for using the Clerixs platform.',
};

export default function TermsOfServicePage() {
  const lastUpdated = "May 14, 2026";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 relative overflow-hidden light">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-[120px] mix-blend-multiply opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none" />

      <Navbar />
      
      <main className="flex-1 py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-sm font-medium mb-4">
              <Scale size={14} />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content Sections */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-8 md:p-12 shadow-xl shadow-slate-200/50 space-y-12 text-slate-700">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
              </div>
              <p className="leading-relaxed">
                By accessing or using Clerixs, you agree to be bound by these Terms of Service and all applicable laws and regulations in India. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <ShieldAlert size={20} />
                </div>
                <h2 className="text-2xl font-bold">2. Use License</h2>
              </div>
              <p className="leading-relaxed">
                Permission is granted to temporarily use Clerixs for professional clinic management purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials or source code.</li>
                <li>Use the materials for any commercial purpose other than managing your medical practice.</li>
                <li>Attempt to decompile or reverse engineer any software contained on Clerixs.</li>
                <li>Remove any copyright or other proprietary notations from the materials.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-bold">3. Subscription & Payments</h2>
              </div>
              <p className="leading-relaxed">
                Clerixs offers various subscription plans. By subscribing, you agree to pay the fees associated with your chosen plan. All payments are processed securely through our payment partners. Fees are non-refundable except as required by law. We reserve the right to change our fees upon notice.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <AlertCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold">4. Disclaimer & Liability</h2>
              </div>
              <p className="leading-relaxed">
                The materials on Clerixs are provided on an 'as is' basis. Clerixs makes no warranties, expressed or implied. Furthermore, Clerixs shall not be liable for any medical decisions made by practitioners using the platform. The responsibility for patient care and data accuracy lies solely with the registered healthcare provider.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <HelpCircle size={20} />
                </div>
                <h2 className="text-2xl font-bold">5. Governing Law</h2>
              </div>
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-200/60 text-center">
              <p className="text-sm text-slate-500">
                Have questions about our Terms? Reach out to <a href="mailto:legal@clerixs.com" className="text-indigo-600 hover:underline font-semibold">legal@clerixs.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
