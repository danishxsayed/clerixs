import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Shield, Lock, Eye, FileText, Globe, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Clerixs',
  description: 'How we handle your data and maintain patient confidentiality at Clerixs.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 14, 2026";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 relative overflow-hidden light">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[120px] mix-blend-multiply opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none" />

      <Navbar />
      
      <main className="flex-1 py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-sm font-medium mb-4">
              <Shield size={14} />
              <span>Trust & Safety</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content Sections */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-8 md:p-12 shadow-xl shadow-slate-200/50 space-y-12 text-slate-700">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Globe size={20} />
                </div>
                <h2 className="text-2xl font-bold">1. Introduction</h2>
              </div>
              <p className="leading-relaxed">
                Clerixs ("we," "our," or "us") is committed to protecting the privacy and security of your personal information and the health data of your patients. This Privacy Policy describes how we collect, use, and share information when you use our clinic management platform.
              </p>
              <p className="leading-relaxed">
                By using Clerixs, you agree to the collection and use of information in accordance with this policy. We comply with the <strong>Digital Personal Data Protection Act (DPDP Act) 2023</strong> of India and maintain high standards of data security to protect sensitive healthcare information.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold">2. Information We Collect</h2>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">A. Clinic & Provider Information</h3>
                <p>When you register for an account, we collect information such as your name, email address, clinic name, professional registration details, and contact information.</p>
                
                <h3 className="font-bold text-slate-900">B. Patient Data (EMR)</h3>
                <p>As a data processor, we process patient data on your behalf. This includes patient names, contact details, medical history, prescriptions, and appointment records. You remain the data fiduciary for this information.</p>
                
                <h3 className="font-bold text-slate-900">C. Usage Data</h3>
                <p>We automatically collect information about how you interact with our platform, including IP addresses, browser types, and usage patterns to improve our services.</p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Lock size={20} />
                </div>
                <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our clinic management services.</li>
                <li>To notify you about changes to our platform or services.</li>
                <li>To provide customer support and respond to inquiries.</li>
                <li>To monitor usage and improve the user experience.</li>
                <li>To ensure compliance with legal and regulatory requirements in India.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold">4. Data Security & Sovereignty</h2>
              </div>
              <p className="leading-relaxed">
                We implement industry-standard security measures, including end-to-end encryption for sensitive data and secure server infrastructure. In compliance with Indian regulations, all sensitive personal data is stored on servers located within India.
              </p>
              <p className="leading-relaxed">
                We perform regular security audits and maintain strict access controls to ensure that only authorized personnel have access to the infrastructure supporting your data.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={20} />
                </div>
                <h2 className="text-2xl font-bold">5. Your Rights</h2>
              </div>
              <p className="leading-relaxed">
                Under the DPDP Act 2023, you and your patients have the right to access, correct, or delete personal data. You can manage most of this directly through the platform or by contacting our support team.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-200/60">
              <p className="text-sm text-slate-500 text-center">
                Questions about our Privacy Policy? Contact us at <a href="mailto:privacy@clerixs.com" className="text-blue-600 hover:underline font-semibold">privacy@clerixs.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
