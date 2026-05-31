'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowLeft, 
  Check, 
  HelpCircle, 
  AlertTriangle,
  Info,
  Clock,
  Printer,
  FileText,
  Key,
  ShieldCheck,
  Building2,
  Phone,
  Keyboard,
  ExternalLink,
  Laptop,
  CheckCircle,
  AlertCircle,
  Plus,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Settings as SettingsIcon,
  Mic,
  DollarSign,
  Download,
  Percent,
  Lock,
  ArrowUpRight,
  CreditCard,
  History,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportModal } from '@/components/support/support-modal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ==========================================
// PURE CSS/HTML RESPONSIVE MOCKUP SCREENSHOTS
// ==========================================

const BrowserHeader = ({ url }: { url: string }) => (
  <div className="bg-slate-100 border-b px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 select-none">
    <div className="flex gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
      <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
      <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
    </div>
    <div className="bg-white text-slate-400 font-mono px-4 py-0.5 rounded border border-slate-200/60 w-3/5 text-center truncate">
      {url}
    </div>
    <div className="w-8" />
  </div>
);

const MockDashboardScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/dashboard" />
    <img 
      src="/assets/Mock-dash.png" 
      alt="Clerixs Dashboard" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockSignUpScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6 max-w-md mx-auto">
    <BrowserHeader url="app.clerixs.com/auth/signup" />
    <img 
      src="/assets/sign-up.png" 
      alt="Clerixs Sign Up" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockLetterheadScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/setup.png" 
      alt="Clinic Setup" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockAddPatientScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/Add-New-Patient.png" 
      alt="Add New Patient" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockPatientProfileScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/pt-profile.png" 
      alt="Patient Profile Overview" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockImportCsvScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/import-data.png" 
      alt="Bulk Importing Patients via CSV" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockAddAppointmentScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/appointments" />
    <img 
      src="/assets/appointment.png" 
      alt="Appointments" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockWaitingRoomScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/queue" />
    <img 
      src="/assets/queue-2.png" 
      alt="Queue Management" 
      className="w-full max-h-[300px] object-cover object-top"
    />
  </div>
);

const MockPrescriptionFormScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/prescriptions/new" />
    <img 
      src="/assets/Prescription.png" 
      alt="Prescription Form" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockPrescriptionPrintScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6 max-w-lg mx-auto">
    <div className="bg-white p-6 font-serif text-[10px] text-slate-800 space-y-6">
      {/* Letterhead */}
      <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
        <div className="font-sans text-left">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide font-mono">SHARMA DENTAL CLINIC</h2>
          <p className="text-[8px] text-slate-500">102, Metro Plaza, Sector 15, Dwarka, New Delhi</p>
          <p className="text-[8px] text-slate-500">Ph: +91 11-4567890 • email: sharmadental@gmail.com</p>
        </div>
        <div className="text-right text-[8px] text-slate-500 font-sans font-semibold">
          <p>Dr. Devendra Sharma, BDS, MDS</p>
          <p>Reg No: DE-12345 (Delhi Dental Council)</p>
        </div>
      </div>
      {/* Patient info */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded font-sans text-[8px] border">
        <div><strong>Patient Name:</strong> Amitabh Bachchan</div>
        <div><strong>Age / Gender:</strong> 83 / Male</div>
        <div><strong>ID:</strong> PT-1002</div>
        <div><strong>Date:</strong> 2026-05-29</div>
      </div>
      {/* Diagnosis */}
      <div className="space-y-1">
        <h4 className="font-sans font-bold uppercase text-[8px] tracking-wider text-slate-500 border-b pb-0.5">Clinical Diagnosis</h4>
        <p className="italic">Acute periapical abscess associated with tooth #46.</p>
      </div>
      {/* Prescription body */}
      <div className="space-y-2">
        <h4 className="font-sans font-bold uppercase text-[8px] tracking-wider text-slate-500 border-b pb-0.5">Rx (Medications)</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between items-start font-mono">
            <div>
              <span className="font-bold">1. Amoxicillin 500mg Capsule</span>
              <p className="text-[8px] text-slate-500 font-sans italic ml-3">Take 1 capsule twice daily (Morning and Night) after meals.</p>
            </div>
            <div className="text-right">Qty: 10 • 5 Days</div>
          </div>
        </div>
      </div>
      {/* Signature */}
      <div className="pt-6 flex justify-between items-end font-sans">
        <div className="text-[8px] text-slate-500">
          <p className="font-bold">Instructions:</p>
          <p>Complete the full course of antibiotics as directed. Return for root canal follow-up.</p>
        </div>
        <div className="text-center space-y-1 w-32">
          {/* Mock Signature */}
          <div className="h-6 flex items-center justify-center italic text-blue-600 font-bold border-b border-dashed">
            D. Sharma
          </div>
          <p className="text-[7px] text-slate-400 font-bold">Authorised Signature</p>
        </div>
      </div>
    </div>
  </div>
);

const MockLabDashboardScreenshot = () => (
  <div className="space-y-6 my-6">
    <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200">
      <BrowserHeader url="app.clerixs.com/lab" />
      <img 
        src="/assets/lab.png" 
        alt="Lab Dashboard" 
        className="w-full h-auto object-cover"
      />
    </div>
    <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200">
      <BrowserHeader url="app.clerixs.com/lab/orders" />
      <img 
        src="/assets/Lab-order.png" 
        alt="Lab Order Details" 
        className="w-full h-auto object-cover"
      />
    </div>
  </div>
);

const MockInvoiceFormScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/billing" />
    <img 
      src="/assets/invoice.png" 
      alt="Billing & Invoices" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockInviteMemberScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/staff" />
    <img 
      src="/assets/staff.png" 
      alt="Staff Management" 
      className="w-full h-auto object-cover"
    />
  </div>
);

const MockBasicReportsScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <div className="bg-white p-4 text-xs text-slate-600 space-y-3">
      <div className="flex justify-between items-center border-b pb-2">
        <h4 className="font-bold text-slate-900">Clinic Analytics — Revenue</h4>
        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">Last 30 Days</span>
      </div>
      {/* Stylised SVG chart */}
      <div className="h-32 w-full flex items-end justify-between px-2 pt-4 bg-slate-50/50 rounded-lg relative overflow-hidden">
        {/* Mock chart grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-10 pointer-events-none">
          <div className="border-b w-full" />
          <div className="border-b w-full" />
          <div className="border-b w-full" />
        </div>
        <div className="w-8 bg-blue-200 hover:bg-blue-300 h-10 rounded-t text-center font-bold text-[8px] text-blue-700 flex items-end justify-center pb-1">₹12k</div>
        <div className="w-8 bg-blue-200 hover:bg-blue-300 h-16 rounded-t text-center font-bold text-[8px] text-blue-700 flex items-end justify-center pb-1">₹24k</div>
        <div className="w-8 bg-blue-200 hover:bg-blue-300 h-24 rounded-t text-center font-bold text-[8px] text-blue-700 flex items-end justify-center pb-1">₹38k</div>
        <div className="w-8 bg-blue-600 h-28 rounded-t text-center font-bold text-[8px] text-white flex items-end justify-center pb-1">₹45k</div>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-1">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4 (Current)</span>
      </div>
    </div>
  </div>
);

// ==========================================
// DOCUMENTATION COMPREHENSIVE DATASET
// ==========================================

const DOCS_DATA = [
  {
    id: 'getting-started',
    title: '1. Getting Started',
    desc: 'Learn about Clerixs and complete your initial clinic onboarding.',
    sections: [
      {
        id: 'what-is-clerixs',
        heading: 'What is Clerixs?',
        content: (
          <div className="space-y-4">
            <p>
              Clerixs is a cloud-based clinic management software designed specifically for Indian healthcare practices. It brings patient records, appointments, prescriptions, lab orders, and billing into one secure platform — accessible from any browser, anywhere.
            </p>
            <p>
              Clerixs eliminates paper registers, scattered prescription pads, and disconnected billing sheets. Everything your clinic needs is in one place, always secure and up to date.
            </p>
            <MockDashboardScreenshot />
          </div>
        )
      },
      {
        id: 'who-is-clerixs-for',
        heading: 'Who Is Clerixs For?',
        content: (
          <div className="space-y-4">
            <p>Clerixs is custom-built for a wide range of outpatient clinical specialties:</p>
            <ul className="list-none pl-0 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> <span><strong className="text-slate-900">Dental Clinics</strong> — Manage tooth charts, treatment plans, and billing per procedure.</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> <span><strong className="text-slate-900">Endocrinology</strong> — Track chronic patients, repeat prescriptions, and lab reports over time.</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> <span><strong className="text-slate-900">Aesthetics & Dermatology</strong> — Maintain treatment histories, before/after notes, and package billing.</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> <span><strong className="text-slate-900">Pediatrics</strong> — Age-based patient profiles with vaccination notes and growth tracking fields.</span></li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> <span><strong className="text-slate-900">Orthopedics</strong> — Link lab reports and imaging notes directly to patient prescriptions.</span></li>
            </ul>
            <p className="text-slate-600">
              Any outpatient clinic with 1 to 50+ staff members can use Clerixs effectively to run their daily practice.
            </p>
          </div>
        )
      },
      {
        id: 'system-requirements',
        heading: 'System Requirements',
        content: (
          <div className="space-y-4">
            <p>Clerixs runs entirely in your web browser — no installation is needed.</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                  <tr>
                    <th className="px-6 py-3">Requirement</th>
                    <th className="px-6 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-6 py-3.5 font-bold text-slate-900">Browser</td>
                    <td className="px-6 py-3.5">Google Chrome (recommended), Mozilla Firefox, Microsoft Edge, Apple Safari</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-bold text-slate-900">Internet</td>
                    <td className="px-6 py-3.5">Stable broadband or 4G LTE connection (minimum 2 Mbps download speed)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-bold text-slate-900">Device</td>
                    <td className="px-6 py-3.5">Desktop, laptop, or tablet (desktop/laptop recommended for the best clinical experience)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5 font-bold text-slate-900">Screen</td>
                    <td className="px-6 py-3.5">1024×768 px minimum display resolution</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Compatibility Warning</p>
                <p className="text-amber-800 text-xs mt-1">
                  Internet Explorer is not supported. Always run the latest version of your browser for optimal performance and secure data encryption.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'how-to-sign-up',
        heading: 'How to Sign Up',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-3 text-slate-600">
              <li>Open your web browser and go to <strong className="text-slate-950 font-mono">app.clerixs.com</strong>.</li>
              <li>Click the <strong className="text-slate-900">Get Started Free</strong> button on the homepage.</li>
              <li>Enter your full name, email address, and a strong password (minimum 8 characters).</li>
              <li>Click <strong className="text-slate-900">Create Account</strong> to register.</li>
              <li>Check your email inbox for a verification email from Clerixs and click the confirmation link.</li>
              <li>You will be directed straight into your new clinic dashboard.</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Owner Tip</p>
                <p className="text-blue-800 text-xs mt-1">
                  Use a professional email address (e.g., your clinic's Gmail or work email) so your staff invitations come from a recognizable sender.
                </p>
              </div>
            </div>
            <MockSignUpScreenshot />
          </div>
        )
      },
      {
        id: 'free-trial',
        heading: 'The 7-Day Free Trial',
        content: (
          <div className="space-y-4">
            <p>
              Every new Clerixs account starts with a free 7-day trial of the Pro plan. During the trial you get access to all Pro features including Advanced Reports, unlimited prescriptions, and up to 5 staff members.
            </p>
            <p>
              No credit card is required to start your trial. At the end of 7 days you can choose to upgrade to Basic or Pro, or your account will move to a limited read-only state until you subscribe.
            </p>
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <p className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Data Protection Guarantee
              </p>
              <p className="text-slate-600 text-xs mt-1">
                Your data is never deleted if your trial expires. You can subscribe at any time to regain full access.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'onboarding-wizard',
        heading: 'Onboarding Wizard Walkthrough',
        content: (
          <div className="space-y-4">
            <p>After signing up for the first time, Clerixs guides you through a short setup wizard. Complete all steps before inviting staff:</p>
            
            <div className="space-y-6 mt-4">
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">1</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-md">Clinic Name</h4>
                  <p className="text-slate-600 text-sm mt-1">Enter your clinic's official name (e.g., "Sharma Dental Clinic"). This name will appear on all prescriptions, invoices, and patient-facing documents.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">2</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-md">Upload Clinic Letterhead</h4>
                  <p className="text-slate-600 text-sm mt-1">Click Upload Letterhead and select a PNG or JPG image (recommended size: 1200×300 px). If skipped, you can add it later in Settings → Clinic Settings.</p>
                  <MockLetterheadScreenshot />
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">3</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-md">Upload Digital Signature</h4>
                  <p className="text-slate-600 text-sm mt-1">Click Upload Signature and select a clear image of your doctor's signature (PNG with transparent background recommended). This signature will auto-print at the bottom of prescriptions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">4</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-md">Set Timezone and Currency</h4>
                  <p className="text-slate-600 text-sm mt-1">Your timezone is set to Asia/Kolkata (IST) and Currency defaults to INR (₹) by default. Click Finish Setup to access your Dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'dashboard-overview',
        heading: 'Dashboard Overview',
        content: (
          <div className="space-y-4">
            <p>The Clerixs dashboard gives you a real-time snapshot of your clinic's activity for the day. Navigating the dashboard is split into the Left Sidebar, Top Bar, and key Dashboard Cards.</p>
            
            <h4 className="font-bold text-slate-900 text-sm">Left Sidebar — Navigation</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Section</th>
                    <th className="px-4 py-2.5">What It Does</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Dashboard</td>
                    <td className="px-4 py-2">Today's summary — cashflow, appointments, patients, and queue states.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Patients</td>
                    <td className="px-4 py-2">Full patient database, timelines, notes, and CSV importer.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Appointments</td>
                    <td className="px-4 py-2">Book, schedule, cancel, and manage appointments in list or calendar views.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Queue</td>
                    <td className="px-4 py-2">Live waiting room board, check-ins, walk-ins, and statuses.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Lab Dashboard</td>
                    <td className="px-4 py-2">Diagnostic lab orders, sample tracking, reference ranges, and reports.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Billing</td>
                    <td className="px-4 py-2">Issue GST invoices, record payments, and track outstanding bills.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Reports</td>
                    <td className="px-4 py-2">Revenue, appointment metrics, top treatments, and physician collections.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Staff</td>
                    <td className="px-4 py-2">Invite new staff and manage credentials and permissions.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Settings</td>
                    <td className="px-4 py-2">Configure profile details, clinic layouts, price catalogs, and templates.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-bold text-slate-900 text-sm mt-4">Top Bar Tools</h4>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Search bar (⌘K / Ctrl+K)</strong> — Find any patient, appointment, or invoice instantly.</li>
              <li><strong>Notification bell</strong> — See recent activity, alerts, and system updates.</li>
              <li><strong>Profile avatar</strong> — Access your profile settings and sign out.</li>
            </ul>

            <h4 className="font-bold text-slate-900 text-sm mt-4">Dashboard Metric Cards</h4>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Cashflow</strong> — Total revenue collected today across all payment modes.</li>
              <li><strong>Today's Appointments</strong> — Number of appointments scheduled for the current date.</li>
              <li><strong>Total Patients</strong> — Cumulative count of active patient records in your database.</li>
              <li><strong>Queue Status</strong> — The number of patients currently checked in and waiting.</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'patient-management',
    title: '2. Patient Management',
    desc: 'Manage your patient database, record clinical histories, and import records.',
    sections: [
      {
        id: 'adding-patient',
        heading: 'Adding a New Patient',
        content: (
          <div className="space-y-4">
            <p>
              Every person treated at your clinic needs a patient profile in Clerixs before you can book an appointment, write a prescription, or raise an invoice.
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Click <strong>Patients</strong> in the left sidebar.</li>
              <li>Click the <strong>Add Patient</strong> button (top right).</li>
              <li>Fill in the patient details form.</li>
              <li>Click <strong>Save Patient</strong>.</li>
            </ol>
            <MockAddPatientScreenshot />
          </div>
        )
      },
      {
        id: 'patient-fields',
        heading: 'Patient Form Fields Explained',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Field</th>
                    <th className="px-4 py-2.5">Required</th>
                    <th className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Full Name</td>
                    <td className="px-4 py-2"><Badge className="bg-red-50 text-red-600 border-red-100 text-[9px]">Yes</Badge></td>
                    <td className="px-4 py-2">Patient's legal name. The name is automatically trimmed of whitespaces.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Phone Number</td>
                    <td className="px-4 py-2"><Badge className="bg-red-50 text-red-600 border-red-100 text-[9px]">Yes</Badge></td>
                    <td className="px-4 py-2">10-digit mobile number, prefixed with +91. Used for sending WhatsApp prescriptions.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Date of Birth</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 text-[9px]">No</Badge></td>
                    <td className="px-4 py-2">Used to dynamically calculate and print age on prescriptions.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Gender</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 text-[9px]">No</Badge></td>
                    <td className="px-4 py-2">Options: Male / Female / Other. Printed on prescription headers.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Email Address</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 text-[9px]">No</Badge></td>
                    <td className="px-4 py-2">Checked against email regex. Used for delivering PDF invoice links.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Blood Group</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 text-[9px]">No</Badge></td>
                    <td className="px-4 py-2">Blood details shown on clinical prescription headers.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Emergency Contact</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 text-[9px]">No</Badge></td>
                    <td className="px-4 py-2">Secondary phone number for critical emergency alerts.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Medical History</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-slate-400 text-[9px]">No</Badge></td>
                    <td className="px-4 py-2">Pre-existing chronic conditions, active drugs, or allergies.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'patient-profile',
        heading: 'Patient Profile Overview',
        content: (
          <div className="space-y-4">
            <p>Click any patient's name in your database lists to open their full clinical timeline. Their profile is organized into standard, responsive tabs:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Appointments Tab</strong> — Shows all past and upcoming appointment slots. You can book directly from here.</li>
              <li><strong>Prescriptions Tab</strong> — Displays all past written prescriptions, newest first. Includes printing and WhatsApp triggers.</li>
              <li><strong>Lab & Docs Tab</strong> — Access diagnostic orders, enter lab results, or upload external diagnostic PDFs.</li>
              <li><strong>Billing & Invoices Tab</strong> — Manage, review, issue, and record payments for invoices.</li>
            </ul>
            <MockPatientProfileScreenshot />
          </div>
        )
      },
      {
        id: 'patient-search',
        heading: 'Searching for Patients',
        content: (
          <div className="space-y-4 text-slate-600">
            <h4 className="font-bold text-slate-900 text-xs">Method 1 — Patient List Filter</h4>
            <p className="text-sm">Navigate to <strong>Patients</strong> and type the name or phone number in the top search box. Results filter instantly as you type.</p>
            
            <h4 className="font-bold text-slate-900 text-xs mt-2">Method 2 — Global Search Shortcut (⌘K / Ctrl+K)</h4>
            <p className="text-sm">Press <strong>Ctrl+K</strong> or <strong>Cmd+K</strong> from anywhere in Clerixs. Type the patient's name, code (e.g. PT-1002), or phone, and click to open their profile directly. This is the fastest navigation method.</p>
          </div>
        )
      },
      {
        id: 'editing-patient',
        heading: 'Editing Patient Details',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Open the patient's profile.</li>
              <li>Click the <strong>Edit Patient</strong> button (top right of the profile).</li>
              <li>Update the required fields.</li>
              <li>Click <strong>Save Changes</strong>.</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-sm">Automatic Sync</p>
                <p className="text-blue-800 text-xs mt-1">
                  Editing a patient's name will update it across all linked prescriptions, invoices, and lab reports automatically.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'medical-notes',
        heading: 'Clinical Notes',
        content: (
          <div className="space-y-4">
            <p>Clinical notes let you record observations, follow-up instructions, and ongoing treatment history for a patient:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Open the patient profile and locate the <strong>Clinical Timeline</strong>.</li>
              <li>Click <strong>Add Note</strong>.</li>
              <li>Type your note in the text box.</li>
              <li>Click <strong>Save Note</strong>.</li>
            </ol>
            <p className="text-slate-600">
              To preserve a strict medical audit trail, clinical notes cannot be deleted or edited. Any additions or corrections must be entered as a new progress note.
            </p>
          </div>
        )
      },
      {
        id: 'bulk-import',
        heading: 'Bulk Importing Patients via CSV',
        content: (
          <div className="space-y-4">
            <p>If you are migrating records from spreadsheets or legacy systems, Clerixs allows you to import all patients at once:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Go to <strong>Patients</strong> and click <strong>Import</strong>.</li>
              <li>Click <strong>Download CSV Template</strong> to get the correct column structure.</li>
              <li>Fill in patient details — one patient per row. Required columns: <code>full_name</code>, <code>phone</code>.</li>
              <li>Save as a standard <code>.csv</code> file.</li>
              <li>Click <strong>Upload CSV</strong>, review the preview table, and click <strong>Confirm Import</strong>.</li>
            </ol>
            <MockImportCsvScreenshot />
          </div>
        )
      },
      {
        id: 'patient-codes',
        heading: 'Patient Codes Explained',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>Every patient is automatically assigned a unique code in the format <strong>PT-XXXX</strong> (e.g. PT-1002).</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Codes are sequential, unique, and cannot be changed.</li>
              <li>Codes appear on all prescriptions, invoices, and lab reports to cross-reference records without confusion.</li>
              <li>You can search patient codes directly using Global Search.</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'appointments',
    title: '3. Appointments',
    desc: 'Book and manage patient slots, assign practitioners, and manage conflicts.',
    sections: [
      {
        id: 'booking-appointment',
        heading: 'Booking an Appointment',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Click <strong>Appointments</strong> in the left sidebar.</li>
              <li>Click <strong>Add Appointment</strong> (top right).</li>
              <li>Select the Patient from the autocomplete dropdown.</li>
              <li>Pick the Appointment Date and Start Time.</li>
              <li>Select a Treatment category (e.g., Consultation, Dental Scaling).</li>
              <li>Assign a Doctor/Provider (or leave it as Unassigned).</li>
              <li>Click <strong>Confirm Booking</strong>.</li>
            </ol>
            <MockAddAppointmentScreenshot />
          </div>
        )
      },
      {
        id: 'calendar-vs-list',
        heading: 'Calendar View vs List View',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs provides two responsive views to organize your appointments:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>List View</strong> — Best for busy front desks scanning the day's schedule at a glance. You can filter by specific dates, search, and sort by doctor or status.</li>
              <li><strong>Calendar View</strong> — Best for visualizing weekly or monthly schedules. Blocks are color-coded to show which practitioner is assigned.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'appointment-statuses',
        heading: 'Appointment Statuses',
        content: (
          <div className="space-y-4">
            <p>Every booked appointment has a status that maps to its current state:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9.5px]">Scheduled</Badge></td>
                    <td className="px-4 py-2">Appointment is booked and upcoming.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9.5px]">Completed</Badge></td>
                    <td className="px-4 py-2">The patient was seen by the doctor and the session is closed.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-red-50 text-red-700 border-red-100 text-[9.5px]">Cancelled</Badge></td>
                    <td className="px-4 py-2">The appointment was cancelled by the patient or staff.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'assigning-doctor',
        heading: 'Assigning a Doctor to an Appointment',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>During appointment creation, you can select from the active doctor roster in your clinic. Assigning a doctor helps the queue system automatically route the patient to the correct consultation room upon arrival.</p>
            <p>If a doctor was not assigned at the time of booking, click the option menu (⋮) next to the appointment row, click <strong>View Details</strong>, select the doctor, and update.</p>
          </div>
        )
      },
      {
        id: 'scheduling-follow-up',
        heading: 'Scheduling a Follow-Up',
        content: (
          <div className="space-y-4 text-slate-600">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open the patient's profile and go to the <strong>Appointments</strong> tab.</li>
              <li>Click <strong>Add Appointment</strong>. The patient field is pre-filled automatically.</li>
              <li>Set the date, time, and treatment for the follow-up consultation.</li>
              <li>Click <strong>Confirm Booking</strong>.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'editing-cancelling',
        heading: 'Editing and Cancelling Appointments',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>To edit or update details: Click Open menu (⋮) → <strong>View Details</strong> next to any appointment row. Update fields and save changes.</p>
            <p>To cancel: Click Open menu (⋮) → <strong>Cancel Appointment</strong>. Cancelled appointments remain in lists for historic accounting but are clearly flagged to prevent confusion.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Cancellation Recommendation</p>
                <p className="text-amber-800 text-xs mt-1">
                  We recommend cancelling instead of deleting appointments. Cancellation preserves booking histories, which are required for clinical audit logs and front-desk metrics.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'double-booking',
        heading: 'No Double-Booking Rule',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>To prevent practitioner scheduling conflicts, Clerixs automatically validates bookings in real-time. If you try to book an appointment slot that is already reserved for the same doctor, the form will show an error and block submission.</p>
            <p>This conflict rule is doctor-specific. Multiple doctors can have appointments booked at the exact same time without conflict.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'live-queue',
    title: '4. Live Queue Management',
    desc: 'Track and manage the live clinic waiting room and coordinate with doctors.',
    sections: [
      {
        id: 'what-is-queue',
        heading: 'What Is the Live Waiting Room?',
        content: (
          <div className="space-y-4">
            <p>
              The Live Waiting Room is a real-time, interactive board tracking all patients physically present in your clinic. It coordinates the front desk with consultation rooms instantly without needing to refresh pages.
            </p>
            <MockWaitingRoomScreenshot />
          </div>
        )
      },
      {
        id: 'checking-in',
        heading: 'Checking In a Patient from Appointments',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>When a patient with an appointment arrives at your clinic on the scheduled day, navigate to the <strong>Queue</strong> page. If the appointment is scheduled for today, it will appear in the scheduled check-in list. Click <strong>Check In</strong> next to their name to add them to the waiting room.</p>
          </div>
        )
      },
      {
        id: 'adding-walk-in',
        heading: 'Adding a Walk-In Patient',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>For patients who arrive at the clinic without a pre-existing booking:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Navigate to the <strong>Queue</strong> page and click <strong>Add Walk-in</strong>.</li>
              <li>Type their name in the Patient Search field. If they exist, select their profile.</li>
              <li>If they are a new patient, select <strong>Create Patient Profile</strong> to register them on the spot.</li>
              <li>Choose their assigned Doctor.</li>
              <li>Click <strong>Confirm & Add to Queue</strong>. The patient joins the waiting list immediately.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'queue-statuses',
        heading: 'Queue Statuses',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9.5px]">Waiting</Badge></td>
                    <td className="px-4 py-2">The patient is currently checked in and waiting in the lobby.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9.5px]">In Consultation</Badge></td>
                    <td className="px-4 py-2">The patient is in the consultation room with the assigned doctor.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9.5px]">Completed</Badge></td>
                    <td className="px-4 py-2">The consultation is finished, and the patient has left the clinic.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'moving-queue',
        heading: 'Moving Patients Through the Queue',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Front-desk staff and doctors can move patients through queue states using action triggers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Call Next</strong> — Changes the first waiting patient's status to <code>In Consultation</code>.</li>
              <li><strong>Complete</strong> — Marks the session as finished and archives the queue record.</li>
              <li><strong>Skip</strong> — Moves the patient to the back of the queue (helpful if the patient is not ready).</li>
              <li><strong>Remove</strong> — Removes the patient card entirely (e.g. if the patient leaves prior to consultation).</li>
            </ul>
          </div>
        )
      },
      {
        id: 'realtime-updates',
        heading: 'How the Queue Updates in Real Time',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs integrates Supabase real-time database subscriptions. When any receptionist checks in a patient or a doctor clicks <strong>Call Next</strong>, the change reflects on all active screens in your clinic within seconds — without needing manual page reloads.</p>
          </div>
        )
      },
      {
        id: 'daily-reset',
        heading: 'Daily Queue Reset',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>To keep workspaces organized, the queue automatically resets at midnight (IST) daily. Completed and removed patients are archived, starting the next day with a clean queue board.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Active Queue Warning</p>
                <p className="text-amber-800 text-xs mt-1">
                  Patients left in <code>Waiting</code> or <code>In Consultation</code> states at midnight are NOT automatically reset. Staff must manually complete or remove active queue cards before closing for the day.
                </p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'prescriptions',
    title: '5. Prescriptions',
    desc: 'Write digital prescriptions, search medicine catalog, load templates, and send via WhatsApp.',
    sections: [
      {
        id: 'writing-prescription',
        heading: 'Writing a Prescription from the Patient Profile',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Open the patient's profile and go to the <strong>Prescriptions</strong> tab.</li>
              <li>Click <strong>New Prescription</strong>.</li>
              <li>Choose <strong>Start Blank</strong> (or load a saved template).</li>
              <li>Fill in the prescription form details.</li>
              <li>Click <strong>Generate Prescription</strong> to compile the document PDF.</li>
            </ol>
            <MockPrescriptionFormScreenshot />
          </div>
        )
      },
      {
        id: 'medicine-autocomplete',
        heading: 'Medicine Autocomplete Search',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs features an integrated, fully-indexed Indian medicines database. Start typing a brand or generic name (e.g., "Amox" for Amoxicillin) in the Drug Name field, and a suggestion list will display matching entries. Selecting a suggestion auto-populates common clinical dosage parameters automatically.</p>
          </div>
        )
      },
      {
        id: 'adding-custom-meds',
        heading: 'Adding Custom Medicines to the Database',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>If a specific medicine is missing from the global autocomplete search catalog:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Navigate to <strong>Settings → Prescription Templates</strong> (or select Medicine Catalog).</li>
              <li>Click <strong>Add Medicine</strong>.</li>
              <li>Input the drug name, category (e.g. tablet, syrup, injection), and default dosage details.</li>
              <li>Click <strong>Save</strong>. The custom medicine will now appear in searches across your clinic.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'frequency-toggles',
        heading: 'Frequency Toggles',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Each medication row includes three frequency buttons:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Morn</strong> — Take in the morning.</li>
              <li><strong>Aft</strong> — Take in the afternoon.</li>
              <li><strong>Ngt</strong> — Take at night.</li>
            </ul>
            <p>Click these buttons to toggle them on or off. For example, a twice-daily antibiotic row would have Morn and Ngt selected.</p>
          </div>
        )
      },
      {
        id: 'diagnosis-field',
        heading: 'Clinical Diagnosis Field',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>The <strong>Clinical Diagnosis</strong> field is mandatory. You must enter the patient's active diagnosis (e.g. "Acute pharyngitis") to generate and download the prescription PDF. Clerixs blocks blank diagnosis fields to ensure comprehensive, legally-compliant medical charting.</p>
          </div>
        )
      },
      {
        id: 'advice-section',
        heading: 'General Advice Section',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>The General Advice/Next Steps section is a free-text field for non-medication instructions. Use it to record dietary recommendations ("Avoid processed sugars"), activity limits ("No strenuous exercise for 2 weeks"), follow-up timelines, or referral notices.</p>
          </div>
        )
      },
      {
        id: 'voice-to-text',
        heading: 'Voice-to-Text Feature',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Speed up note-taking during active patient sessions using the integrated voice transcription module:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click inside any text input field (Clinical Diagnosis, Advice, or Medicine Name).</li>
              <li>Press and <strong>Hold Ctrl+Shift</strong> on your keyboard (or click the microphone icon on mobile).</li>
              <li>Speak clearly into your microphone — your words translate to text in real time.</li>
              <li>Release the keys to complete transcription. Make sure your browser has microphone permission enabled.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'saving-template',
        heading: 'Saving a Prescription as a Template',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>If you frequently write the same prescription for common conditions (e.g., seasonal allergy):</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Fill in the prescription form details.</li>
              <li>Before clicking Generate, click <strong>Save as Template</strong>.</li>
              <li>Name the template (e.g. "Cold & Fever Protocol") and save.</li>
            </ol>
            <p>Saved templates are shared across your entire clinic — all active doctors can access them.</p>
          </div>
        )
      },
      {
        id: 'loading-template',
        heading: 'Loading a Saved Template',
        content: (
          <div className="space-y-4 text-slate-600">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Click <strong>New Prescription</strong> on any patient's profile.</li>
              <li>Under Clinic Templates in the selection dialog, click the desired template.</li>
              <li>The form will populate instantly. Edit medicines or notes as needed and generate.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'generating-pdf',
        heading: 'Generating a Prescription PDF',
        content: (
          <div className="space-y-4">
            <p>After compiling the form details, click <strong>Generate Prescription</strong>. Clerixs opens a print-ready PDF in a new tab complete with your logo, letterhead banner, patient details, medications list, and the physician's digital signature.</p>
            <MockPrescriptionPrintScreenshot />
          </div>
        )
      },
      {
        id: 'sending-whatsapp',
        heading: 'Sending a Prescription via WhatsApp',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Deliver digital prescriptions directly to your patient's phone. In the patient's prescription list, click the green <strong>WhatsApp icon</strong> next to the record. Verify the patient's mobile number, and click send. Clerixs will deliver a secure URL linking to their prescription PDF. Messages are handled using WhatsApp credits.</p>
          </div>
        )
      },
      {
        id: 'prescription-history',
        heading: 'Prescription History on Patient Profile',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>All issued prescriptions are saved permanently in the <strong>Prescriptions</strong> tab of the patient's profile. You can review, reprint, or resend records at any time. To preserve clinic integrity, existing prescriptions cannot be deleted or modified.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'lab-dashboard',
    title: '6. Lab Dashboard',
    desc: 'Order laboratory diagnostics, record result values, and track sample collections.',
    sections: [
      {
        id: 'lab-overview',
        heading: 'Lab Dashboard Overview',
        content: (
          <div className="space-y-4">
            <p>The Lab Dashboard acts as a central workspace for clinical diagnostics. It tracks every order from creation to results entry and doctor finalization:</p>
            <MockLabDashboardScreenshot />
          </div>
        )
      },
      {
        id: 'creating-order',
        heading: 'Creating a Lab Order for a Patient',
        content: (
          <div className="space-y-4 text-slate-600">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open the patient's profile and go to the <strong>Lab & Docs</strong> tab.</li>
              <li>Click <strong>Order Lab Test</strong>.</li>
              <li>Select the Sample Type (e.g., Blood, Urine, Saliva, Swab).</li>
              <li>Click <strong>Browse Catalog</strong> to add diagnostic tests.</li>
              <li>Click <strong>Confirm Lab Order</strong>. You must select at least one test to confirm.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'adding-tests',
        heading: 'Adding Tests from the Lab Catalog',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>On the lab order form, click <strong>Browse Catalog</strong>. You can search by test name (e.g. CBC, HbA1c) or browse by categories. Click the <strong>+ Add</strong> button to add tests to the active order, and close the catalog panel when done.</p>
          </div>
        )
      },
      {
        id: 'sample-tracking',
        heading: 'Sample Tracking Stages',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Stage</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Ordered</td>
                    <td className="px-4 py-2"><Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9.5px]">Ordered</Badge></td>
                    <td className="px-4 py-2">Test ordered. Sample collection is pending.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Collected</td>
                    <td className="px-4 py-2"><Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9.5px]">Collected</Badge></td>
                    <td className="px-4 py-2">Sample drawn, labeled, and sent to lab for processing.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Submitted</td>
                    <td className="px-4 py-2"><Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[9.5px]">Submitted</Badge></td>
                    <td className="px-4 py-2">Results entered by lab technician; pending doctor review.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Completed</td>
                    <td className="px-4 py-2"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9.5px]">Completed</Badge></td>
                    <td className="px-4 py-2">Report approved and finalized. PDF is ready.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'entering-results',
        heading: 'Entering Test Results',
        content: (
          <div className="space-y-4 text-slate-600">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open the lab order from the dashboard.</li>
              <li>Input the result values for each test parameter.</li>
              <li>Click <strong>Submit Results</strong>. The status will update to Submitted.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'abnormal-flagging',
        heading: 'Abnormal Value Flagging',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs automatically compares all input values with standard normal reference ranges defined in the catalog. If a result falls outside reference limits, Clerixs displays a warning badge next to the value:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-red-600">High Values</strong> are automatically flagged in red text.</li>
              <li><strong className="text-amber-600">Low Values</strong> are automatically flagged in orange text.</li>
              <li><strong>Normal Values</strong> display in clean black text.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'finalising-report',
        heading: 'Finalising and Printing a Lab Report',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>To finalize, the reviewing doctor must open the submitted order and click <strong>Approve & Finalise Report</strong>. Once clicked, results lock, the order updates to Completed, and you can click <strong>Print Report</strong> to generate the PDF.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Lock Policy</p>
                <p className="text-amber-800 text-xs mt-1">
                  Once approved, lab results cannot be edited. If a correction is needed, the doctor must click <strong>Request Revision</strong> to send the order back to the technician for updates.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'uploading-external',
        heading: 'Uploading External Lab Reports',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>For tests completed at outside laboratories: Open the patient profile → <strong>Lab & Docs</strong> tab, click <strong>Upload External</strong>, select the PDF/Image file, enter a descriptive label (e.g. "MRI Report Dwarka Branch"), and save. The document is archived permanently in the patient's record timeline.</p>
          </div>
        )
      },
      {
        id: 'patient-lab-records',
        heading: 'Lab Orders on the Patient Profile',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>All lab orders and external documents are stored inside the patient's profile under the Lab & Docs tab. Click <strong>Manage Details</strong> on any row to print, review results, or request revisions.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'billing',
    title: '7. Billing & Invoices',
    desc: 'Raise GST invoices, record payments, and manage pricing catalogs.',
    sections: [
      {
        id: 'creating-invoice',
        heading: 'Creating an Invoice',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Click <strong>Billing</strong> in the left sidebar.</li>
              <li>Click <strong>New Invoice</strong>.</li>
              <li>Select the Patient from the autocomplete dropdown.</li>
              <li>Click <strong>Add Item</strong> to select billing rows from the Price Catalog.</li>
              <li>Input any applicable Discounts or GST tax parameters.</li>
              <li>Click <strong>Issue Invoice</strong> to finalize and generate the invoice code (e.g. INV-000123).</li>
            </ol>
            <MockInvoiceFormScreenshot />
          </div>
        )
      },
      {
        id: 'price-catalog-billing',
        heading: 'Adding Line Items from the Price Catalog',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>On the invoice creation form, click <strong>Add Item</strong>. Type or browse through services pre-configured in your Price Catalog (e.g. Consultation, Tooth Extraction). Selecting a service auto-populates pricing fields, speed billing operations significantly.</p>
          </div>
        )
      },
      {
        id: 'gst-calculation',
        heading: 'GST Calculation',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs automatically calculates the applicable tax breakdown for GST-eligible services configured in Settings:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>CGST</strong> = 2.5%</li>
              <li><strong>SGST</strong> = 2.5%</li>
              <li><strong>Total GST</strong> = 5%</li>
            </ul>
            <p>The CGST and SGST breakdown is formatted and printed as separate lines on the invoice PDF. GST calculation requires your clinic's GST number to be configured in settings.</p>
          </div>
        )
      },
      {
        id: 'discount-billing',
        heading: 'Discount Application',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>On the invoice form, enter a discount amount in the Discount (₹) field. Clerixs validates that the discount does not exceed the invoice total and shows a clear error if it does. The discounted total is shown as Total Amount Payable.</p>
          </div>
        )
      },
      {
        id: 'invoice-statuses',
        heading: 'Invoice Statuses',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-slate-50 text-slate-600 border-slate-200 text-[9.5px]">Draft</Badge></td>
                    <td className="px-4 py-2">Invoice is drafted but not yet finalized or visible on patient accounting.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-amber-50 text-amber-700 border-amber-100 text-[9.5px]">Issued</Badge></td>
                    <td className="px-4 py-2">Invoice is finalized and shared; waiting for payment collection.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[9.5px]">Partially Paid</Badge></td>
                    <td className="px-4 py-2">Part payment received; balance remains outstanding.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900"><Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9.5px]">Paid</Badge></td>
                    <td className="px-4 py-2">Full payment received; invoice is closed.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'recording-payments',
        heading: 'Recording Payments',
        content: (
          <div className="space-y-4 text-slate-600">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open any Issued or Partially Paid invoice.</li>
              <li>Click <strong>Record Payment</strong>.</li>
              <li>Enter the Payment Amount received.</li>
              <li>Select the Payment Mode (e.g. Cash, UPI/GPay, Card, Bank Transfer).</li>
              <li>Click <strong>Save Payment</strong>. The invoice status updates automatically.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'printing-invoice',
        heading: 'Printing and Downloading an Invoice PDF',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Open any Issued or Paid invoice and click <strong>Print / Download PDF</strong>. Clerixs compiles a beautifully styled, GST-compliant invoice document in a new browser tab. Use your browser's print options (Ctrl+P) to print or save the PDF file.</p>
          </div>
        )
      },
      {
        id: 'billing-history',
        heading: 'Billing History',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>All invoices are securely archived in the Billing module. You can filter the history list by Patient Name, Invoice Code, date range, or Payment Status to track revenue easily.</p>
          </div>
        )
      },
      {
        id: 'invoice-numbering',
        heading: 'Invoice Numbering Format',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs generates invoice numbers automatically in the format <strong>INV-XXXXXX</strong> (e.g., INV-000123). Numbers are sequential and cannot be changed. This format is audit-friendly and accepted by Indian accounting standards.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'staff-management',
    title: '8. Staff Management',
    desc: 'Invite clinical staff, manage roles, and review access privileges.',
    sections: [
      {
        id: 'inviting-staff',
        heading: 'Inviting a Staff Member',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600">
              <li>Navigate to <strong>Staff</strong> in the left sidebar.</li>
              <li>Click <strong>Invite Member</strong>.</li>
              <li>Enter the staff member's Email Address.</li>
              <li>Assign their Role and primary Branch.</li>
              <li>Click <strong>Send Invite</strong>. Clerixs will deliver a secure signup email containing activation instructions.</li>
            </ol>
            <MockInviteMemberScreenshot />
          </div>
        )
      },
      {
        id: 'staff-roles',
        heading: 'Staff Roles Explained',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs provides four distinct roles to secure patient data and control access features:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Owner / Admin</strong> — Full permissions across all modules, clinical files, billing reports, settings, and subscription plans.</li>
              <li><strong>Doctor</strong> — Full access to clinical timelines, patient profiles, prescriptions, live queue, and lab order diagnostics. Billing analytics are hidden.</li>
              <li><strong>Receptionist</strong> — Access to patient registrations, appointments booking, live waiting room queues, and basic billing. Clinical prescriptions are hidden.</li>
              <li><strong>Lab Technician</strong> — Access is locked exclusively to the Lab Dashboard. Technicians can view lab orders, collect samples, enter result values, and print diagnostics.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'accepting-invite',
        heading: 'Accepting an Invitation (Email Flow)',
        content: (
          <div className="space-y-4 text-slate-600">
            <ol className="list-decimal pl-6 space-y-2">
              <li>The new staff member receives an invitation email from Clerixs.</li>
              <li>They click the <strong>Accept Invitation</strong> button.</li>
              <li>They are directed to a secure registration screen to set their password.</li>
              <li>After setting their password, they can log in at <code>app.clerixs.com</code>.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'managing-staff',
        heading: 'Managing Staff',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>To deactivate a staff member or change permissions: Go to the Staff list, locate the member, click the option menu (⋮), and select <strong>Edit Role</strong> or <strong>Deactivate</strong>. Deactivated staff members lose workspace access instantly, but their past audit logs remain intact.</p>
          </div>
        )
      },
      {
        id: 'staff-limits',
        heading: 'Staff Limits per Plan',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Plan Tier</th>
                    <th className="px-4 py-2.5">Max Staff Roster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Basic</td>
                    <td className="px-4 py-2">2 Staff Accounts (including owner).</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Pro</td>
                    <td className="px-4 py-2">5 Staff Accounts (including owner).</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Enterprise</td>
                    <td className="px-4 py-2">Unlimited Staff Accounts.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'reports',
    title: '9. Reports & Analytics',
    desc: 'Review clinical trends, track billing revenue, and monitor outcomes.',
    sections: [
      {
        id: 'basic-reports',
        heading: 'Basic Reports Explained',
        content: (
          <div className="space-y-4">
            <p>Available on all subscription plans. Go to Reports in the left sidebar to access standard charts:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Revenue</strong> — Tracks total billings and collected payments over a selected period.</li>
              <li><strong>Patients</strong> — Review counts of newly registered patient profiles.</li>
              <li><strong>Appointments</strong> — Analyze completed, scheduled, and cancelled appointment metrics.</li>
              <li><strong>Top Treatments</strong> — Identifies the most frequently billed services and treatments.</li>
            </ul>
            <MockBasicReportsScreenshot />
          </div>
        )
      },
      {
        id: 'advanced-reports',
        heading: 'Advanced Reports Explained',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Unlocked on Pro and Enterprise tiers, providing advanced medical business intelligence:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Revenue by Doctor</strong> — Tracks payment collections generated by each specific doctor.</li>
              <li><strong>Revenue Trends</strong> — Detailed month-on-month billing comparison charts.</li>
              <li><strong>Outstanding Payments</strong> — Lists all Issued and Partially Paid invoices showing outstanding balances.</li>
              <li><strong>Patient Retention</strong> — Analytics comparing new vs returning patient visits over time.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'date-filters',
        heading: 'Date Range Filters',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>All reports support custom date range filters. Click the date picker on the reports page to select presets (e.g. Today, This Month, Last 30 Days) or select custom start/end ranges. Graphs and tables will update instantly.</p>
          </div>
        )
      },
      {
        id: 'exporting-reports',
        heading: 'Exporting Reports',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Pro and Enterprise clinics can export any active report dataset. Select the date range, click <strong>Export</strong> (top right), and choose <strong>PDF</strong> (for reporting and printing) or <strong>Excel</strong> (for advanced offline calculations). File downloads will trigger automatically.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'settings',
    title: '10. Settings',
    desc: 'Configure profile details, clinic layouts, price catalogs, and templates.',
    sections: [
      {
        id: 'my-profile',
        heading: 'My Profile Settings',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Under Profile Settings, you can update your Full Name, Phone Number, and upload a profile photo. To update credentials, enter your new password in the password blocks and save changes.</p>
          </div>
        )
      },
      {
        id: 'clinic-settings',
        heading: 'Clinic Settings',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clinic settings control details mapped across all printed documents:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Clinic Name</strong> — Pre-fills header fields on all invoices, prescriptions, and lab sheets.</li>
              <li><strong>Clinic Logo</strong> — Upload a clear logo to place on headers.</li>
              <li><strong>Digital Signature</strong> — Upload a clear digital signature for doctors (transparent PNG recommended).</li>
              <li><strong>Clinic Letterhead</strong> — Upload custom prescription letterhead banners (1200×300 px).</li>
              <li><strong>GST Number</strong> — Input your official GSTIN tax code to enable 5% GST billing calculations.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'price-catalog-settings',
        heading: 'Price Catalog Settings',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Define standard clinic treatments to enable fast billing invoices:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to <strong>Settings → Price Catalog</strong>.</li>
              <li>Click <strong>Add Item</strong>.</li>
              <li>Enter the Treatment/Service name and Price (₹).</li>
              <li>Toggle GST taxation on or off for the item.</li>
              <li>Click <strong>Save</strong>.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'lab-catalog-settings',
        heading: 'Lab Catalog Settings',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Manage laboratory tests and diagnostic packages:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Add Custom Test</strong> — Under Lab Catalog, click Add Test, define the parameters, input normal reference ranges, unit types (e.g. mg/dL), and base price.</li>
              <li><strong>Test Packages</strong> — Group multiple tests into a package (e.g., a "Diabetic Panel" consisting of HbA1c + Fasting Glucose). Set a package discount price and save.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'presc-templates-settings',
        heading: 'Prescription Templates',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Review, edit, or delete prescription templates created during patient sessions. Modifications made here apply instantly to all subsequent template loadings.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'subscription-billing',
    title: '11. Subscription & Billing',
    desc: 'Compare plans, track storage quotas, and manage billing history.',
    sections: [
      {
        id: 'subscription-plans',
        heading: 'Plans Explained',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5">Monthly Cost</th>
                    <th className="px-4 py-2.5">Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Basic</td>
                    <td className="px-4 py-2">₹999 / month</td>
                    <td className="px-4 py-2">Up to 2 staff members, unlimited patients, basic reports, 5 GB cloud storage.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Pro</td>
                    <td className="px-4 py-2">₹1,999 / month</td>
                    <td className="px-4 py-2">Up to 5 staff members, advanced analytics, report exports (PDF/Excel), WhatsApp delivery integration, 10 GB cloud storage.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-bold text-slate-900">Enterprise</td>
                    <td className="px-4 py-2">Custom Quotes</td>
                    <td className="px-4 py-2">Unlimited staff members, multi-branch clinic management, dedicated manager logins, isolated databases, custom integrations.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'free-trial-billing',
        heading: '7-Day Free Trial Rules',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>All signups start on a 7-day Pro plan trial. We send reminder notifications 3 days before expiration. Post-trial, access reverts to a secure read-only state until a subscription is activated. Your data is preserved indefinitely.</p>
          </div>
        )
      },
      {
        id: 'upgrading-plan',
        heading: 'How to Upgrade',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Go to <strong>Settings → Subscription</strong>. Click <strong>Upgrade Plan</strong>, select either the Basic or Pro tier, input card or UPI credentials, and confirm payment. Your new plan tier activates instantly.</p>
          </div>
        )
      },
      {
        id: 'storage-quotas',
        heading: 'Storage Quotas',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs monitors storage across all uploaded clinic files (logos, signatures, letterheads, diagnostic lab files, and patient documentation):</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Basic Plan:</strong> 5 GB total cloud storage quota.</li>
              <li><strong>Pro Plan:</strong> 10 GB total cloud storage quota.</li>
            </ul>
            <p>Remaining storage balances are displayed in the left sidebar. Clerixs delivers system alerts when your quota approaches 90% utilization.</p>
          </div>
        )
      },
      {
        id: 'billing-history-settings',
        heading: 'Billing History & Invoice Downloads',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Under Subscription Settings, scroll to Billing History to review past payments. Click <strong>Download Invoice</strong> next to any row to access and print a GST-compliant tax receipt.</p>
          </div>
        )
      },
      {
        id: 'cancelling-sub',
        heading: 'How to Cancel Your Subscription',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Navigate to Subscription Settings and click <strong>Cancel Subscription</strong>. Your clinical workspace will remain fully active in write mode until the end of the current billing cycle. Post-expiration, your account moves to a read-only state.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">90-Day Retention Policy</p>
                <p className="text-amber-800 text-xs mt-1">
                  We preserve your data in read-only mode for 90 days after subscription cancellation. To protect privacy, all records are permanently deleted from Clerixs servers after 90 days. Export all files before this window closes.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'auto-renewal',
        heading: 'Auto-Renewal Explained',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Subscriptions renew automatically on the same calendar date monthly or annually. Recurring payments are billed automatically to your saved payment method, and receipts are delivered straight to your registered email.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'whatsapp-integration',
    title: '12. WhatsApp Integration',
    desc: 'Configure automated WhatsApp messages and purchase delivery credits.',
    sections: [
      {
        id: 'what-whatsapp-does',
        heading: 'What WhatsApp Integration Does',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Clerixs's WhatsApp integration allows you to deliver digital prescriptions and lab reports directly to patient mobile numbers. The patient receives a secure, branded link to download the PDF — no app installations or clinic phone line configurations required.</p>
          </div>
        )
      },
      {
        id: 'sending-whatsapp-integration',
        heading: 'Sending a Prescription via WhatsApp',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Open the patient's profile, navigate to the <strong>Prescriptions</strong> tab, and click the green WhatsApp icon. Confirm the patient's phone number, and click <strong>Send</strong>. Clerixs handles delivery automatically within seconds.</p>
          </div>
        )
      },
      {
        id: 'whatsapp-credits',
        heading: 'WhatsApp Credits Explained',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>WhatsApp delivery utilizes dedicated message credits. 1 credit = 1 prescription or lab report message successfully delivered to a patient.</p>
            <p>Your active WhatsApp Credit balance is shown under the storage widget in the left sidebar. You can purchase credit top-ups at any time in Settings → WhatsApp Credits without changing your subscription plan.</p>
          </div>
        )
      },
      {
        id: 'credits-deducted',
        heading: 'How Credits Are Deducted',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Credits are deducted from your balance only when a message is successfully sent. If your credit balance runs out, WhatsApp sending triggers are disabled, and the system will prompt you to purchase a top-up package.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'branches',
    title: '13. Branches (Enterprise Only)',
    desc: 'Manage multi-location clinics, database isolation, and branch manager roles.',
    sections: [
      {
        id: 'what-is-branch',
        heading: 'What Is the Branch Feature?',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Branches allow a single Clerixs account to manage multiple clinic locations from one login. Each branch has its own patients, appointments, staff, and billing — while the clinic owner can see consolidated reports across all locations.</p>
          </div>
        )
      },
      {
        id: 'who-can-use-branches',
        heading: 'Who Can Use Branches?',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>The Branch feature is available exclusively on the Enterprise plan. Basic and Pro plans support a single branch only (labelled "Headquarters" by default).</p>
          </div>
        )
      },
      {
        id: 'contact-sales',
        heading: 'How to Contact Sales for Enterprise',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>To upgrade to multi-branch Enterprise clinics, contact our sales and infrastructure team:</p>
            <ul className="list-none pl-0 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-600 shrink-0" /> <strong>Email:</strong> enterprise@clerixs.com</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-600 shrink-0" /> <strong>WhatsApp Support:</strong> Open Help inside your clinic dashboard</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-600 shrink-0" /> <strong>Sales button:</strong> Under Settings → Subscription → Enterprise</li>
            </ul>
          </div>
        )
      },
      {
        id: 'creating-logins',
        heading: 'Creating Branch Logins',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Once your Enterprise account is active, the clinic owner can navigate to <strong>Settings → Branches</strong>, click <strong>Add Branch</strong>, and enter its name, address, and local timezone. You can invite staff to specific branches during the standard Staff Invite flow.</p>
          </div>
        )
      },
      {
        id: 'branch-manager',
        heading: 'Branch Manager Access',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Assigning a staff member as a Branch Manager grants them administrative permissions locked to their assigned branch. They cannot view billing details, patient records, or roster details for any other clinic branches.</p>
          </div>
        )
      },
      {
        id: 'data-isolation',
        heading: 'Data Isolation Between Branches',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>For data protection and financial compliance, each branch has strict database isolation. Patient files, billing records, and lab diagnostics remain secure within the branch where they were created. A patient registered at Branch A will not appear in databases at Branch B.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'keyboard-shortcuts',
    title: '14. Keyboard Shortcuts',
    desc: 'Quickly navigate Clerixs using system-wide keyboard shortcuts.',
    sections: [
      {
        id: 'shortcut-reference',
        heading: 'Complete Shortcut Reference',
        content: (
          <div className="space-y-4">
            <p>Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border font-mono text-slate-800 text-xs shadow-sm">Ctrl + /</kbd> (or <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border font-mono text-slate-800 text-xs shadow-sm">Cmd + /</kbd>) at any time to open the keyboard shortcut panel.</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Shortcut (Windows)</th>
                    <th className="px-6 py-3">Shortcut (Mac)</th>
                    <th className="px-6 py-3">Action performed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-mono text-[11px]">
                  <tr>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Ctrl + K</kbd></td>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Cmd + K</kbd></td>
                    <td className="px-6 py-3.5 font-sans text-xs">Open Global Search tool</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Ctrl + N</kbd></td>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Cmd + N</kbd></td>
                    <td className="px-6 py-3.5 font-sans text-xs">Create New Record (e.g. Patient, Appointment, Invoice)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Ctrl + S</kbd></td>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Cmd + S</kbd></td>
                    <td className="px-6 py-3.5 font-sans text-xs">Save active form or details</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Escape</kbd></td>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Escape</kbd></td>
                    <td className="px-6 py-3.5 font-sans text-xs">Close active modal dialog or popup overlay</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Hold Ctrl + Shift</kbd></td>
                    <td className="px-6 py-3.5"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border shadow-sm">Hold Ctrl + Shift</kbd></td>
                    <td className="px-6 py-3.5 font-sans text-xs">Activate microphone for Voice-to-Text inputs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'shortcut-tips',
        heading: 'Tips for Using Shortcuts',
        content: (
          <div className="space-y-4 text-slate-600">
            <p><strong>Ctrl+K</strong> is the most useful shortcut. Learn it first — it lets you jump to any patient, appointment, or invoice from anywhere in the app instantly.</p>
            <p>When writing a prescription, use <strong>Hold Ctrl+Shift</strong> to speak the Clinical Diagnosis instead of typing it. This can cut prescription writing time significantly.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Focus Block</p>
                <p className="text-amber-800 text-xs mt-1">
                  Keyboard shortcuts are automatically disabled when a text input is focused (except for Ctrl+S to save). This prevents accidental page navigations while typing clinical notes.
                </p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'faq',
    title: '15. Troubleshooting & FAQ',
    desc: 'Quick answers to common questions, invitation issues, and support contact details.',
    sections: [
      {
        id: 'faq-pdf',
        heading: 'Why is my prescription PDF not downloading?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>
              Clerixs compiles and opens your printed prescription PDF in a new browser tab. Most browsers block these new tabs as pop-ups by default.
            </p>
            <p>
              <strong className="text-slate-900">Solution:</strong> Check your browser address bar for a pop-up blocked indicator, select "Always allow pop-ups from app.clerixs.com", and click print again. We recommend using Google Chrome for the best printing experience.
            </p>
          </div>
        )
      },
      {
        id: 'faq-invitations',
        heading: 'Why am I not receiving invitation emails?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>
              Invitation emails can sometimes be flagged by email filters. Ask your staff member to:
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Check their Spam or Junk folder.</li>
              <li>Check their Promotions tab (specifically in Google Gmail).</li>
              <li>Have the clinic owner resend the invitation from the Staff page.</li>
              <li>Ensure the invited email matches their address exactly.</li>
            </ol>
          </div>
        )
      },
      {
        id: 'faq-password',
        heading: 'How do I reset my password?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>Go to <code>app.clerixs.com</code> and click <strong>Forgot Password</strong> on the login screen. Enter your registered email address, and Clerixs will deliver a reset token valid for 1 hour. Click the link in the email to set your new password.</p>
          </div>
        )
      },
      {
        id: 'faq-trial-expired',
        heading: 'My trial expired — how do I reactivate?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>Log in to <code>app.clerixs.com</code>. You will see a subscription required banner. Click <strong>Upgrade Now</strong>, choose your subscription plan, and complete payment. Your account will reactivate instantly. No data is lost when a trial expires.</p>
          </div>
        )
      },
      {
        id: 'faq-transfer-patient',
        heading: 'How do I transfer a patient to another branch?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>Currently, patient transfer between isolated databases requires re-registering the patient at the destination branch. The receiving branch staff can register the patient as new, and the original branch can export or share the clinical prescription PDF as a digital handoff document. Direct database transfer is on the product roadmap.</p>
          </div>
        )
      },
      {
        id: 'faq-data-cancel',
        heading: 'What happens to my data if I cancel?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>Your clinic data is preserved securely in read-only mode for 90 days after subscription cancellation. You can export patients and billing records. To protect medical privacy, all clinic data is permanently deleted from Clerixs servers after 90 days.</p>
          </div>
        )
      },
      {
        id: 'faq-browsers',
        heading: 'Which browsers are supported?',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Browser</th>
                    <th className="px-6 py-3">Support Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-900">Google Chrome</td>
                    <td className="px-6 py-2.5 font-semibold text-emerald-600 flex items-center gap-1.5"><Check className="h-4 w-4" /> Fully Supported (Recommended)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-900">Mozilla Firefox</td>
                    <td className="px-6 py-2.5 font-semibold text-emerald-600 flex items-center gap-1.5"><Check className="h-4 w-4" /> Fully Supported</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-900">Microsoft Edge</td>
                    <td className="px-6 py-2.5 font-semibold text-emerald-600 flex items-center gap-1.5"><Check className="h-4 w-4" /> Fully Supported</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-900">Apple Safari</td>
                    <td className="px-6 py-2.5 font-semibold text-emerald-600 flex items-center gap-1.5"><Check className="h-4 w-4" /> Fully Supported (Keep updated)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-900">Internet Explorer</td>
                    <td className="px-6 py-2.5 font-bold text-red-600 flex items-center gap-1.5"><X className="h-4 w-4" /> Not Supported</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: 'faq-mobile',
        heading: 'Does Clerixs work on mobile?',
        content: (
          <div className="space-y-2 text-slate-600">
            <p>Yes. Clerixs is fully mobile-responsive and runs on all smartphone and tablet browsers via collapsible sidebar menus. However, we recommend a laptop or desktop with a physical keyboard for optimal prescription writing and lab data entry.</p>
          </div>
        )
      },
      {
        id: 'faq-support',
        heading: 'How do I contact support?',
        content: (
          <div className="space-y-4">
            <p>Our support team is ready to help you with any technical or billing questions:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Email:</strong> support@clerixs.com (response guaranteed within 24 hours).</li>
              <li><strong>WhatsApp Support:</strong> Click the Help button in the bottom-right corner of your Clerixs clinic dashboard.</li>
              <li><strong>Office Hours:</strong> Monday to Saturday, 9:00 AM – 6:00 PM IST.</li>
            </ul>
          </div>
        )
      }
    ]
  }
];

export default function DocsPage() {
  const [activeChapterId, setActiveChapterId] = React.useState('getting-started');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const [supportCategory, setSupportCategory] = React.useState<'Technical Support' | 'Sales Inquiry' | 'Billing & Subscription' | 'Feature Request' | 'Enterprise / Branches' | 'Bug Report' | 'Other'>('Technical Support');

  React.useEffect(() => {
    const currentChapter = DOCS_DATA.find(c => c.id === activeChapterId);
    if (currentChapter) {
      const cleanTitle = currentChapter.title.replace(/^\d+\.\s+/, '');
      document.title = `${cleanTitle} | Docs | Clerixs`;
    } else {
      document.title = 'Documentation | Clerixs';
    }
  }, [activeChapterId]);

  // Search filter
  const filteredDocs = DOCS_DATA.map(chapter => {
    // If search query is empty, return chapter unchanged
    if (!searchQuery) return chapter;

    // Filter sections that match search query
    const matchingSections = chapter.sections.filter(sec => 
      sec.heading.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchingSections.length > 0 || chapter.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return {
        ...chapter,
        sections: matchingSections.length > 0 ? matchingSections : chapter.sections
      };
    }

    return null;
  }).filter(Boolean) as typeof DOCS_DATA;

  const currentChapter = DOCS_DATA.find(c => c.id === activeChapterId) || DOCS_DATA[0];

  const handleChapterClick = (id: string) => {
    setActiveChapterId(id);
    setMobileMenuOpen(false);
    // Scroll content container back to top
    const container = document.getElementById('docs-content-pane');
    if (container) {
      container.scrollTop = 0;
    }
  };

  const handleSubheadingClick = (secId: string) => {
    const element = document.getElementById(secId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white/95 px-4 md:px-8 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
              <Image
                src="/assets/logo.png"
                alt="Clerixs Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Clerixs</span>
          </Link>
          <span className="h-5 w-px bg-slate-200" />
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            Docs
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md mx-6 hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="search"
            placeholder="Search documentation..."
            className="w-full bg-slate-50 border-slate-200 pl-9 pr-4 h-9 text-xs rounded-lg focus-visible:ring-blue-600/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5 transition-colors hidden sm:flex">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          
          {/* Mobile hamburger menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-xs h-9 px-4 rounded-lg">
            <Link href="/auth/login">Login to Clinic</Link>
          </Button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Navigation Sidebar */}
        <aside className={cn(
          "fixed inset-y-16 left-0 z-30 w-72 bg-white border-r flex flex-col transition-all duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] shrink-0 overflow-y-auto shadow-lg md:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          {/* Mobile Search input inside drawer */}
          <div className="p-4 border-b sm:hidden bg-slate-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                type="search"
                placeholder="Search documentation..."
                className="w-full bg-white border-slate-200 pl-8 h-8 text-xs rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 select-none">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Chapters</p>
            {filteredDocs.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 italic">No matching chapters</p>
            ) : (
              filteredDocs.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 text-left",
                    activeChapterId === chapter.id 
                      ? "bg-blue-50 text-blue-600 shadow-[inset_3px_0_0_0_#2563eb]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <span className="truncate">{chapter.title}</span>
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 opacity-40 transition-transform", activeChapterId === chapter.id && "rotate-90 opacity-80 text-blue-600")} />
                </button>
              ))
            )}
          </nav>

          <div className="p-4 border-t bg-slate-50 text-center flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Need more help?</p>
            <p className="text-xs text-slate-600 leading-normal font-medium">Our dedicated clinical team is available 9 AM – 6 PM IST.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 font-bold text-[11px] h-8 bg-white border-slate-200 cursor-pointer"
              onClick={() => {
                setSupportCategory('Technical Support');
                setSupportOpen(true);
              }}
            >
              <span className="flex items-center justify-center gap-1.5 font-bold">
                <HelpCircle className="h-3.5 w-3.5 text-blue-600" /> Contact Support
              </span>
            </Button>
          </div>
        </aside>

        {/* Content & outline viewpane */}
        <div className="flex-1 flex overflow-hidden min-w-0 font-sans" id="docs-content-pane">
          
          {/* Main text pane */}
          <main className="flex-1 overflow-y-auto px-4 py-8 md:p-12 lg:px-16 bg-white flex flex-col h-full scroll-smooth">
            <div className="max-w-3xl w-full mx-auto space-y-8 flex-1">
              
              {/* Header Title Block */}
              <div className="border-b pb-6 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                  <BookOpen className="h-4 w-4" />
                  Documentation Guide
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{currentChapter.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{currentChapter.desc}</p>
              </div>

              {/* Dynamic Chapter Sections Rendering */}
              <div className="space-y-12">
                {currentChapter.sections.map((section) => (
                  <section 
                    key={section.id} 
                    id={section.id} 
                    className="space-y-4 pt-4 first:pt-0 scroll-mt-20 border-b border-slate-100 pb-8 last:border-none"
                  >
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-600 rounded-full shrink-0" />
                      {section.heading}
                    </h3>
                    <div className="text-slate-700 text-sm leading-relaxed space-y-4 font-normal">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>

              {/* Simple Navigation footer */}
              <div className="pt-10 border-t flex justify-between items-center gap-4 text-xs text-slate-400">
                <p>Clerixs Platform Guide v1.0 • May 2026</p>
                <div className="flex items-center gap-1">
                  Was this helpful? 
                  <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800">Yes</Button>
                  /
                  <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800">No</Button>
                </div>
              </div>
            </div>
          </main>

          {/* Right Outline Sidebar (On This Page outline) - hidden on tablet/mobile screens */}
          <aside className="w-64 border-l bg-slate-50 p-6 overflow-y-auto shrink-0 hidden lg:block h-[calc(100vh-4rem)] sticky top-16 select-none">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On This Page</p>
              <nav className="space-y-2">
                {currentChapter.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSubheadingClick(section.id)}
                    className="block text-left text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors py-0.5 truncate w-full hover:underline"
                  >
                    {section.heading}
                  </button>
                ))}
              </nav>
              
              <div className="border-t border-slate-200 pt-6 mt-6 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Laptop className="h-3.5 w-3.5 text-slate-400" />
                  Technical Links
                </div>
                <div className="space-y-2 text-xs">
                  <button 
                    type="button"
                    onClick={() => {
                      setSupportCategory('Sales Inquiry');
                      setSupportOpen(true);
                    }}
                    className="flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors text-left w-full cursor-pointer font-bold text-xs"
                  >
                    Contact Sales <ExternalLink className="h-3 w-3 opacity-60" />
                  </button>
                  <Link href="/terms-of-service" className="flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors">
                    Terms of Service <ExternalLink className="h-3 w-3 opacity-60" />
                  </Link>
                  <Link href="/privacy-policy" className="flex items-center justify-between text-slate-600 hover:text-blue-600 transition-colors">
                    Privacy Policy <ExternalLink className="h-3 w-3 opacity-60" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
      
      <SupportModal 
        open={supportOpen} 
        onOpenChange={setSupportOpen} 
        initialCategory={supportCategory} 
      />
    </div>
  );
}
