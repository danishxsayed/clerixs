import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Cookie, Settings, BarChart3, ShieldCheck, MousePointer2 } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy - Clerixs',
  description: 'Learn how Clerixs uses cookies to improve your experience.',
};

export default function CookiePolicyPage() {
  const lastUpdated = "May 14, 2026";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 relative overflow-hidden light">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-teal-100/30 rounded-full blur-[120px] mix-blend-multiply opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-sky-100/30 rounded-full blur-[100px] mix-blend-multiply opacity-50 pointer-events-none" />

      <Navbar />
      
      <main className="flex-1 py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100/50 text-teal-600 text-sm font-medium mb-4">
              <Cookie size={14} />
              <span>Cookie Preferences</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
              Cookie Policy
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content Sections */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-8 md:p-12 shadow-xl shadow-slate-200/50 space-y-12 text-slate-700">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold">1. What are Cookies?</h2>
              </div>
              <p className="leading-relaxed">
                Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences, keep you logged in, and understand how you use the site.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <Settings size={20} />
                </div>
                <h2 className="text-2xl font-bold">2. Types of Cookies We Use</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <ShieldCheck size={18} className="text-teal-600" />
                    Essential Cookies
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    These are necessary for the platform to function. They handle authentication, security, and session management. You cannot opt out of these.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <BarChart3 size={18} className="text-blue-600" />
                    Analytics Cookies
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    These help us understand how visitors use Clerixs, allowing us to improve the user experience and platform performance.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                  <MousePointer2 size={20} />
                </div>
                <h2 className="text-2xl font-bold">3. Managing Your Cookies</h2>
              </div>
              <p className="leading-relaxed">
                Most web browsers allow you to control cookies through their settings. You can choose to block all cookies, but please note that this will prevent you from logging into Clerixs and using our services effectively.
              </p>
              <p className="leading-relaxed">
                To find out more about how to manage and delete cookies, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-semibold">aboutcookies.org</a>.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-200/60 text-center">
              <p className="text-sm text-slate-500">
                Need more information? Contact us at <a href="mailto:support@clerixs.com" className="text-teal-600 hover:underline font-semibold">support@clerixs.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
