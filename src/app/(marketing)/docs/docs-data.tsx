import * as React from 'react';
import Image from 'next/image';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Laptop, 
  ExternalLink 
} from 'lucide-react';

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

export const ScreenshotPlaceholder = ({ text }: { text: string }) => (
  <div className="w-full border border-dashed rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 select-none my-6">
    <span className="text-xs font-bold tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-500">Screenshot Placeholder</span>
    <span className="text-[11px] font-semibold italic text-slate-400 text-center">{text}</span>
  </div>
);

export const DocScreenshot = ({ 
  src, 
  alt, 
  url, 
  className = "w-full h-auto object-cover",
  wrapperClassName = "w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6"
}: { 
  src: string; 
  alt: string; 
  url?: string;
  className?: string;
  wrapperClassName?: string;
}) => (
  <div className={wrapperClassName}>
    {url && <BrowserHeader url={url} />}
    <img 
      src={src} 
      alt={alt} 
      className={className}
    />
  </div>
);

export const MockDashboardScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/dashboard" />
    <img 
      src="/assets/Mock-dash.png" 
      alt="Clerixs Dashboard" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockSignUpScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/auth/signup" />
    <img 
      src="/assets/sign-up.png" 
      alt="Clerixs Sign Up" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockLetterheadScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/setup.png" 
      alt="Clinic Setup" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockAddPatientScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/Add-New-Patient.png" 
      alt="Add New Patient" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockPatientProfileScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/pt-profile.png" 
      alt="Patient Profile Overview" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockImportCsvScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <img 
      src="/assets/import-data.png" 
      alt="Bulk Importing Patients via CSV" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockAddAppointmentScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/appointments" />
    <img 
      src="/assets/appointment.png" 
      alt="Appointments" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockWaitingRoomScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/queue" />
    <img 
      src="/assets/queue-2.png" 
      alt="Queue Management" 
      className="w-full max-h-[300px] object-cover object-top"
    />
  </div>
);

export const MockPrescriptionFormScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/prescriptions/new" />
    <img 
      src="/assets/Prescription.png" 
      alt="Prescription Form" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockPrescriptionPrintScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6 max-w-lg mx-auto">
    <div className="bg-white p-6 font-serif text-[10px] text-slate-800 space-y-6">
      {/* Letterhead */}
      <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
        <div className="font-sans text-left">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-wide font-mono">SHARMA DENTAL CLINIC</h2>
          <p className="text-[8px] text-slate-500 font-sans">102, Metro Plaza, Sector 15, Dwarka, New Delhi</p>
          <p className="text-[8px] text-slate-500 font-sans">Ph: +91 11-4567890 • email: sharmadental@gmail.com</p>
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
          <div className="h-6 flex items-center justify-center italic text-blue-600 font-bold border-b border-dashed">
            D. Sharma
          </div>
          <p className="text-[7px] text-slate-400 font-bold">Authorised Signature</p>
        </div>
      </div>
    </div>
  </div>
);

export const MockLabDashboardScreenshot = () => (
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

export const MockInvoiceFormScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/billing" />
    <img 
      src="/assets/invoice.png" 
      alt="Billing & Invoices" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockInviteMemberScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <BrowserHeader url="app.clerixs.com/staff" />
    <img 
      src="/assets/staff.png" 
      alt="Staff Management" 
      className="w-full h-auto object-cover"
    />
  </div>
);

export const MockBasicReportsScreenshot = () => (
  <div className="w-full border rounded-xl overflow-hidden shadow-sm bg-slate-50 border-slate-200 my-6">
    <div className="bg-white p-4 text-xs text-slate-600 space-y-3">
      <div className="flex justify-between items-center border-b pb-2">
        <h4 className="font-bold text-slate-900">Clinic Analytics — Revenue</h4>
        <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">Last 30 Days</span>
      </div>
      <div className="h-32 w-full flex items-end justify-between px-2 pt-4 bg-slate-50/50 rounded-lg relative overflow-hidden">
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

export const DOCS_DATA = [
  {
    id: 'getting-started',
    title: '1. Getting Started with Clerixs',
    desc: "",
    sections: [
      {
        id: 'what-is-clerixs',
        heading: 'What Is Clerixs?',
        content: (
          <div className="space-y-4">
            <p>Clerixs is a clinic management platform built for Indian healthcare practices. It brings your patient records, appointments, prescriptions, lab orders, and billing into one place — accessible from any browser, on any device.</p>
            <p>No installation. No hardware. Just open a browser and you are ready.</p>
            <p><strong>Clerixs is used by:</strong></p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Dental clinics</li><li>Endocrinology & diabetes clinics</li><li>Aesthetics & dermatology practices</li><li>Paediatric clinics</li><li>Orthopaedic clinics</li><li>Any outpatient clinic in India</li></ul>
          </div>
        )
      },
      {
        id: 'system-requirements',
        heading: 'System Requirements',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">What you need</th><th className="px-6 py-3">Details</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Browser</strong></td><td className="px-6 py-3.5">Google Chrome (recommended), Firefox, Edge, Safari</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Internet</strong></td><td className="px-6 py-3.5">Broadband or 4G — minimum 2 Mbps</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Device</strong></td><td className="px-6 py-3.5">Desktop, laptop, or tablet</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Screen size</strong></td><td className="px-6 py-3.5">1024×768 pixels or larger</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Internet Explorer does not work with Clerixs. Always use Chrome for the best experience. Keep your browser updated.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-to-create-your-account',
        heading: 'How to Create Your Account',
        content: (
          <div className="space-y-4">
            <MockSignUpScreenshot />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open <strong>app.clerixs.com</strong> in your browser.</li><li>Click <strong>Sign up</strong> at the bottom of the login form.</li><li>Enter your <strong>Full Name</strong>, <strong>Email Address</strong>, and a <strong>Password</strong> (minimum 8 characters).</li><li>Click <strong>Create Account</strong>.</li><li>Check your email inbox — Clerixs sends a <strong>verification email</strong>. Click the link inside it.</li><li>You are taken to your clinic dashboard.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Use your clinic's email address (e.g., drsharma@sharmadental.com) so your staff recognise invitation emails as coming from a trusted sender.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-to-log-in',
        heading: 'How to Log In',
        content: (
          <div className="space-y-4">
            <DocScreenshot src="/assets/login.png" alt="Clerixs login page" url="app.clerixs.com/auth/login" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open <strong>app.clerixs.com</strong>.</li><li>The page shows <strong>Login to your account!</strong></li><li>Enter your <strong>Email</strong> and <strong>Password</strong>.</li><li>Tick <strong>Remember me</strong> if you want to stay logged in on this device.</li><li>Click <strong>Login</strong>.</li></ol>
            <p><strong>Forgot your password?</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Forgot Password ?</strong> on the login page.</li><li>Enter your email address.</li><li>Check your inbox for a reset link (valid for 1 hour).</li><li>Click the link and set a new password.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> If the reset email does not arrive within 5 minutes, check your Spam or Promotions folder.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'your-7-day-free-trial',
        heading: 'Your 7-Day Free Trial',
        content: (
          <div className="space-y-4">
            <p>Every new Clerixs account starts with a <strong>free 7-day Pro trial</strong>. You get full access to every Pro feature including Advanced Reports, unlimited prescriptions, and up to 5 staff members.</p>
            <p><strong>No credit card required</strong> to start your trial.</p>
            <p>Three days before the trial ends, Clerixs sends a reminder email. If you do not subscribe, your account switches to <strong>read-only mode</strong> — your data is safe but you cannot add new records.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Use the trial period to set up your Price Catalog, Lab Catalog, and invite all your staff so you are fully operational from day one.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'onboarding-setup-wizard',
        heading: 'Onboarding Setup Wizard',
        content: (
          <div className="space-y-4">
            <p>After signing up, Clerixs guides you through a five-step setup wizard to configure your clinic workspace. Complete these steps to get your practice ready before inviting your team.</p>
            <DocScreenshot src="/assets/onboarding-Wizard.png" alt="Onboarding wizard" url="app.clerixs.com/onboarding" />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Step 1 — Clinic & Doctor Details</h4>
            <p>Enter the foundational details of your clinic and the primary doctor. These will be used across your prescriptions, invoices, and reports.</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Clinic Logo / Avatar</strong></td><td className="px-6 py-3.5">Upload your clinic's logo. If skipped, Clerixs generates an avatar using the first two letters of your clinic name.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Clinic / Organization Name</strong></td><td className="px-6 py-3.5">Your clinic's official name (e.g., <em>DentalHQ Clinic</em> or <em>Sharma Dental Clinic</em>). Appears at the top of every invoice, bill, and report.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Phone Number & Address</strong></td><td className="px-6 py-3.5">Your clinic's contact number and full postal address.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Doctor's Full Name</strong></td><td className="px-6 py-3.5">The primary doctor's name (e.g., <em>Dr. Ramesh Sharma</em>).</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Default Currency & Timezone</strong></td><td className="px-6 py-3.5">Defaults to <strong>₹ Indian Rupee (INR)</strong> and <strong>Asia/Kolkata (IST)</strong>.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Clinic Letterhead</strong> <em>(Optional)</em></td><td className="px-6 py-3.5">Upload a PNG or JPG banner. Recommended size: <strong>1200 × 300 pixels</strong>. Prints at the top of all prescription PDFs.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Doctor Digital Signature</strong> <em>(Optional)</em></td><td className="px-6 py-3.5">Upload a high-resolution image of the doctor's signature.</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Letterhead Tip</p>
    <p className="text-blue-800 text-xs mt-1">Ask your graphic designer for a letterhead image that includes your clinic name, address, phone number, and logo. Clerixs prints this image exactly as-is — no additional headers are added to the PDF when using a custom letterhead image.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Signature Tip</p>
    <p className="text-blue-800 text-xs mt-1">For the best visual results on printed prescriptions, upload your signature as a PNG file with a transparent background.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Step 2 — Select Your Medical Specialty</h4>
            <p>Select your primary medical specialty from the searchable grid (e.g., Dentist, General Physician, Dermatologist, Pediatrician, or Endocrinologist). If your specialty is not listed, select <strong>Other</strong> and specify it manually.</p>
            <p>Clerixs uses this specialty selection to automatically configure and pre-populate your service price catalog and laboratory parameters in the next steps.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Step 3 — Set Up Your Service Pricing</h4>
            <p>Configure your service catalog by adding your consultation fees, treatments, and procedures.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Based on the specialty chosen in Step 2, Clerixs pre-fills this table with common consultation fees and treatment rates.</li><li>You can edit the service names, choose a category (e.g., Consultation, Procedure, Lab Test, Medicine, Other), and update the pricing (₹).</li><li>Add custom rows by clicking <strong>+ Add Item</strong>, or delete items using the trash icon.</li></ul>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">If you're not ready to set up your pricing now, click <strong>Skip for now</strong> at the bottom. You can always update your services later in <strong>Settings → Price Catalog</strong>.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Step 4 — Configure Your Lab Tests</h4>
            <p>If your clinic orders or runs lab investigations, you can pre-configure your lab test menu here.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Like the service catalog, Clerixs pre-populates this table with recommended lab tests based on your specialty.</li><li>For each test, you can customise the <strong>Test Name</strong>, <strong>Category</strong>, <strong>Sample Type</strong> (Blood, Urine, Saliva, Swab, Other), and <strong>Price (₹)</strong>.</li><li>If you don't run or order lab reports, click <strong>Skip — I don't run a lab</strong>.</li></ul>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Step 5 — Workspace Summary & Quick Actions</h4>
            <p>Your workspace setup is now complete. Clerixs displays a summary showing your clinic name, specialty, and the number of services and lab tests configured.</p>
            <p>From here, select one of three quick actions to jump straight into your workflow:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li><strong>Add first patient</strong> — Create your first patient record.</li><li><strong>Book appointment</strong> — Schedule a patient in the calendar.</li><li><strong>Explore dashboard</strong> — Go straight to your main dashboard overview.</li></ol>
            <p>Click <strong>Go to Dashboard</strong> to finalise your workspace and begin.</p>
          </div>
        )
      },
      {
        id: 'dashboard-overview',
        heading: 'Dashboard Overview',
        content: (
          <div className="space-y-4">
            <p>The Dashboard is the first screen you see after logging in. It gives you a live summary of your clinic's activity today.</p>
            <MockDashboardScreenshot />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">The Left Sidebar</h4>
            <p>The left sidebar is your main navigation. It has two sections — <strong>Clinic</strong> (daily clinical work) and <strong>Management</strong> (admin and settings).</p>
            <p><strong>Clinic</strong></p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Sidebar item</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Dashboard</strong></td><td className="px-6 py-3.5">Today's summary — revenue, appointments, patient count</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patients</strong></td><td className="px-6 py-3.5">All patient records</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Appointments</strong></td><td className="px-6 py-3.5">Book and manage appointments</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Queue</strong></td><td className="px-6 py-3.5">Live waiting room (green pulsing dot = active)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Treatments</strong></td><td className="px-6 py-3.5">Treatment plans and clinical notes</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Lab Dashboard</strong></td><td className="px-6 py-3.5">Lab orders and test results</td></tr>
    </tbody>
  </table>
</div>
            <p><strong>Management</strong></p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Sidebar item</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Billing</strong></td><td className="px-6 py-3.5">Invoices and payments</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>WhatsApp</strong></td><td className="px-6 py-3.5">WhatsApp message history</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Reports</strong></td><td className="px-6 py-3.5">Revenue and clinic analytics</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Staff</strong></td><td className="px-6 py-3.5">Invite and manage your team</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Branches</strong></td><td className="px-6 py-3.5">Manage your clinic locations</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Files</strong></td><td className="px-6 py-3.5">Uploaded documents</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Settings</strong></td><td className="px-6 py-3.5">Clinic and account settings</td></tr>
    </tbody>
  </table>
</div>
            <p>If you have more than one branch, a <strong>branch selector dropdown</strong> appears at the top of the sidebar. Click it to switch between branches or select <strong>All Branches</strong> to view data across all locations.</p>
            <p>At the bottom of the sidebar, you see your <strong>storage usage</strong> (e.g., <em>USED: 0.4 GB / TOTAL: 10 GB</em>) and theme toggle (<strong>Light / Dark / System</strong>).</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">The Top Bar</h4>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>Search bar</strong> — Shows <em>Search patients, appointments, invoices... ⌘K</em>. Click it or press <strong>Ctrl+K</strong> to search anything instantly.</li><li><strong>Notification bell</strong> — Recent activity alerts.</li><li><strong>Profile avatar</strong> — Your name and clinic role. Click to access profile settings or sign out.</li></ul>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Dashboard Summary Cards</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Card</th><th className="px-6 py-3">What it shows</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Cashflow</strong></td><td className="px-6 py-3.5">Total revenue collected today</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Today's Appointments</strong></td><td className="px-6 py-3.5">Number of appointments booked for today</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Total Patients</strong></td><td className="px-6 py-3.5">All patients registered in your clinic</td></tr>
    </tbody>
  </table>
</div>
            <p>Below the cards, you see today's date, a greeting (<em>Good morning, [Name]!</em>), and a <strong>Filters</strong> button to adjust the date range shown.</p>
          </div>
        )
      },
      {
        id: 'common-first-day-mistakes',
        heading: 'Common First-Day Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Skipping the letterhead upload</td><td className="px-6 py-3.5">Add it before printing any prescription — it cannot be added retroactively to old PDFs</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Using a personal email to sign up</td><td className="px-6 py-3.5">Use your clinic email so staff recognise your invitations</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not verifying your email</td><td className="px-6 py-3.5">You must verify before your account is fully active</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Inviting staff before setting up Settings</td><td className="px-6 py-3.5">Set up Price Catalog, Lab Catalog, and Clinic Settings first</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Next: <a href="02-patients.md" className="text-blue-600 hover:underline font-semibold">02 — Patient Management</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'patient-management',
    title: '2. Patient Management',
    desc: "",
    sections: [
      {
        id: 'what-is-the-patients-section',
        heading: 'What Is the Patients Section?',
        content: (
          <div className="space-y-4">
            <p>The <strong>Patients</strong> section is your clinic's complete patient database. Every person treated at your clinic must have a patient profile before you can book appointments, write prescriptions, or raise invoices for them.</p>
            <p>Go to <strong>Patients</strong> in the left sidebar to open the patient list.</p>
            <DocScreenshot src="/assets/patients.png" alt="Patients List" url="app.clerixs.com/patients" />
          </div>
        )
      },
      {
        id: 'adding-a-new-patient',
        heading: 'Adding a New Patient',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Patients</strong> in the left sidebar.</li><li>Click the <strong>Add Patient</strong> button (top right of the page).</li><li>Fill in the patient form (see field guide below).</li><li>Click <strong>Save Patient</strong>.</li></ol>
            <p>Clerixs automatically assigns a patient code in the format <strong>PT-1001</strong>, <strong>PT-1002</strong>, etc.</p>
            <MockAddPatientScreenshot />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Patient Form — Every Field Explained</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">Required?</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Full Name</strong></td><td className="px-6 py-3.5">✅ Yes</td><td className="px-6 py-3.5">Patient's full name as they spell it</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Phone Number</strong></td><td className="px-6 py-3.5">Recommended</td><td className="px-6 py-3.5">10-digit mobile number — Clerixs adds +91 automatically</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Email Address</strong></td><td className="px-6 py-3.5">Optional</td><td className="px-6 py-3.5">For sending digital invoices or WhatsApp links</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Date of Birth</strong></td><td className="px-6 py-3.5">Recommended</td><td className="px-6 py-3.5">Clerixs auto-calculates Age from this</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Age</strong></td><td className="px-6 py-3.5">✅ Yes</td><td className="px-6 py-3.5">Enter directly if date of birth is unknown</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Gender</strong></td><td className="px-6 py-3.5">Optional</td><td className="px-6 py-3.5">Male / Female / Other / Prefer not to say</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Blood Group</strong></td><td className="px-6 py-3.5">Optional</td><td className="px-6 py-3.5">Shown on prescription header</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Emergency Contact</strong></td><td className="px-6 py-3.5">Optional</td><td className="px-6 py-3.5">A second 10-digit number — +91 is added automatically</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Home Address</strong></td><td className="px-6 py-3.5">Optional</td><td className="px-6 py-3.5">Appears on invoices as billing address</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Medical Notes / History</strong></td><td className="px-6 py-3.5">Optional</td><td className="px-6 py-3.5">Allergies, past surgeries, chronic conditions</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Always enter the phone number correctly — it is used for WhatsApp prescription delivery. Enter it with the country code (+91 for India) so it works without any formatting issues.</p>
  </div>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Two patients cannot share the same phone number. If you try to register a patient whose number is already in the system, Clerixs will show an error.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'understanding-patient-codes',
        heading: 'Understanding Patient Codes',
        content: (
          <div className="space-y-4">
            <p>Every patient is automatically assigned a unique <strong>Patient Code</strong> in the format <strong>PT-XXXX</strong> — for example, <strong>PT-1001</strong> or <strong>PT-1045</strong>.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Codes are assigned in order as patients are registered.</li><li>You cannot change a patient code.</li><li>Use the code to find patients instantly using global search (Ctrl+K).</li><li>The code appears on every prescription, lab report, and invoice so staff can cross-reference records without confusion.</li></ul>
          </div>
        )
      },
      {
        id: 'searching-for-a-patient',
        heading: 'Searching for a Patient',
        content: (
          <div className="space-y-4">
            <p><strong>Method 1 — Search inside the Patients page:</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Patients</strong> in the sidebar.</li><li>Type the patient's name or phone number in the search field at the top of the table.</li><li>The list filters instantly as you type.</li></ol>
            <p><strong>Method 2 — Global search (fastest, works from any page):</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Press <strong>Ctrl+K</strong> (Windows / Linux) or <strong>Cmd+K</strong> (Mac) — or click the search bar that says <em>Search patients, appointments, invoices... ⌘K</em>.</li><li>Type the patient's name, code (e.g., PT-1023), or phone number.</li><li>Click the matching result to open their profile directly.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Global search is the fastest way to navigate Clerixs. Learn <strong>Ctrl+K</strong> on your first day — it saves time on every patient visit.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'opening-a-patient-profile',
        heading: 'Opening a Patient Profile',
        content: (
          <div className="space-y-4">
            <p>Click on any patient's name in the patient list to open their full profile.</p>
            <MockPatientProfileScreenshot />
            <p>The profile has two parts:</p>
            <p><strong>Top section:</strong> Patient name, patient code, age, gender, blood group, emergency contact, and address. You also see the quick-action buttons: <strong>Edit Patient</strong>, <strong>Add Note</strong>, <strong>WhatsApp</strong>, and <strong>Print PDF</strong>.</p>
            <p><strong>Tab section (below the top):</strong> Four tabs organise the patient's clinical history:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Tab</th><th className="px-6 py-3">What it shows</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Appointments (0)</strong></td><td className="px-6 py-3.5">All appointments — past and upcoming</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Prescriptions (1)</strong></td><td className="px-6 py-3.5">All prescriptions, newest first</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Lab & Docs (0)</strong></td><td className="px-6 py-3.5">Lab orders and uploaded external reports</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Billing & Invoices (0)</strong></td><td className="px-6 py-3.5">All invoices raised for this patient</td></tr>
    </tbody>
  </table>
</div>
            <p>The number in brackets shows how many records exist in each tab. It updates automatically.</p>
          </div>
        )
      },
      {
        id: 'editing-patient-details',
        heading: 'Editing Patient Details',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click <strong>Edit Patient</strong> (top right of the profile).</li><li>Update any fields you need to change.</li><li>Click <strong>Save Changes</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Changing a patient's name updates it across all linked prescriptions, invoices, and lab reports automatically. Make sure you are editing the correct patient before saving.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'adding-medical-notes-clinical-timeline',
        heading: 'Adding Medical Notes (Clinical Timeline)',
        content: (
          <div className="space-y-4">
            <p>Medical notes let you record observations, follow-up instructions, and ongoing treatment history. They form a permanent clinical timeline for the patient.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>In the <strong>CLINICAL TIMELINE</strong> section (left panel of the profile), click <strong>Add Note</strong>.</li><li>Type your observation in the text box.</li><li>Click <strong>Save Note</strong>.</li></ol>
            <p>Notes are displayed in reverse chronological order — the most recent note is always at the top.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Notes <strong>cannot be deleted or edited</strong> after saving. This is intentional — it preserves a complete and tamper-proof clinical record. Always proofread before clicking Save Note.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Use medical notes for non-prescription observations — for example, "Patient complained of knee pain during follow-up. Referred for X-ray." This keeps a clear record separate from the prescription history.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'importing-patients-in-bulk-csv-import',
        heading: 'Importing Patients in Bulk (CSV Import)',
        content: (
          <div className="space-y-4">
            <p>If you are migrating from another system, Clerixs lets you import all patients at once using a spreadsheet.</p>
            <MockImportCsvScreenshot />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Patients</strong> in the sidebar.</li><li>Click the <strong>Import</strong> button (next to <strong>Add Patient</strong>).</li><li>Click <strong>Download CSV Template</strong> to get the correct column layout.</li><li>Open the template in Microsoft Excel or Google Sheets.</li><li>Fill in one patient per row. Required columns are <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">full_name</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">phone</code>. Other columns are optional.</li><li>Save the file as <strong>.csv</strong> format (File → Save As → CSV).</li><li>Back in Clerixs, click <strong>Upload CSV</strong> and select your saved file.</li><li>Clerixs shows a <strong>preview table</strong>. Rows with errors are highlighted in red — fix them in your spreadsheet and re-upload.</li><li>Once all rows are clean, click <strong>Confirm Import</strong>.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Test with a small batch of 5–10 patients first to make sure your CSV columns are formatted correctly before importing hundreds of records.</p>
  </div>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Clerixs will skip any row where the phone number already exists in your database. Duplicate phone numbers are not imported.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'viewing-a-patients-appointment-history',
        heading: 'Viewing a Patient\'s Appointment History',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Appointments</strong> tab.</li><li>All past and upcoming appointments are listed — date, time, doctor, treatment, and status.</li><li>Click <strong>Add Appointment</strong> inside this tab to book a new appointment for this patient (the patient field will be pre-filled).</li></ol>
          </div>
        )
      },
      {
        id: 'viewing-prescription-history',
        heading: 'Viewing Prescription History',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Prescriptions</strong> tab.</li><li>All prescriptions are listed, newest first — with date, doctor name, and medicine count.</li><li>Click <strong>View</strong> to open a prescription or <strong>Print PDF</strong> to reprint it.</li><li>Click <strong>New Prescription</strong> to write a new prescription for this patient.</li></ol>
          </div>
        )
      },
      {
        id: 'viewing-billing-history',
        heading: 'Viewing Billing History',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Billing & Invoices</strong> tab.</li><li>All invoices are listed with status, date, and amount.</li><li>Click any invoice to open it or print a copy.</li></ol>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Registering the same patient twice</td><td className="px-6 py-3.5">Always search (Ctrl+K) before adding a new patient</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Entering phone number without country code</td><td className="px-6 py-3.5">Use +91 XXXXXXXXXX format</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Skipping Date of Birth</td><td className="px-6 py-3.5">The patient's age will show as "N/A" on prescriptions — always fill this in</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Trying to delete a medical note</td><td className="px-6 py-3.5">Notes cannot be deleted. Be careful what you write</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="01-getting-started.md" className="text-blue-600 hover:underline font-semibold">01 — Getting Started</a> | Next: <a href="03-appointments.md" className="text-blue-600 hover:underline font-semibold">03 — Appointments</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'appointments',
    title: '3. Appointments',
    desc: "",
    sections: [
      {
        id: 'what-is-the-appointments-section',
        heading: 'What Is the Appointments Section?',
        content: (
          <div className="space-y-4">
            <p><strong>Appointments</strong> is where you book, view, and manage all scheduled patient visits. Every appointment is linked to a patient, a date and time, a treatment type, and optionally a doctor.</p>
            <p>Click <strong>Appointments</strong> in the left sidebar to open the appointments list.</p>
            <MockAddAppointmentScreenshot />
          </div>
        )
      },
      {
        id: 'booking-a-new-appointment',
        heading: 'Booking a New Appointment',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Appointments</strong> in the left sidebar.</li><li>Click <strong>Add Appointment</strong> (top right).</li><li>Fill in the booking form:</li></ol>
            <DocScreenshot src="/assets/New-Appointment.png" alt="Add Appointment form" url="app.clerixs.com/appointments" />
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patient</strong></td><td className="px-6 py-3.5">Type the patient's name and select from the dropdown. If they are new, register them in Patients first</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Date</strong></td><td className="px-6 py-3.5">Pick the appointment date from the calendar</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Time</strong></td><td className="px-6 py-3.5">Enter the start time (e.g., 10:00)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Treatment</strong></td><td className="px-6 py-3.5">Select a treatment type — the default shows <strong>Consultation</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Provider</strong></td><td className="px-6 py-3.5">Select the doctor. Leave as <strong>Unassigned</strong> if not yet decided</td></tr>
    </tbody>
  </table>
</div>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Confirm Booking</strong>.</li></ol>
            <p>The appointment appears in the list with status <strong>Scheduled</strong>.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">You can also book appointments directly from a patient's profile. Open the patient → click the <strong>Appointments</strong> tab → click <strong>Add Appointment</strong>. The patient field is pre-filled automatically — saves time at the front desk.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'booking-a-follow-up-appointment',
        heading: 'Booking a Follow-Up Appointment',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Appointments</strong> tab.</li><li>Click <strong>Add Appointment</strong> (the patient is pre-filled).</li><li>Set the follow-up date, time, and treatment.</li><li>Click <strong>Confirm Booking</strong>.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Always schedule follow-ups before the patient leaves the clinic. It is much harder to get patients to self-schedule later.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'reading-the-appointments-list',
        heading: 'Reading the Appointments List',
        content: (
          <div className="space-y-4">
            <p>The appointments list shows a table with these columns:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Column</th><th className="px-6 py-3">What it means</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Date</strong></td><td className="px-6 py-3.5">The appointment date (e.g., 2026-05-26)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Time</strong></td><td className="px-6 py-3.5">Start time (e.g., 10:00)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patient</strong></td><td className="px-6 py-3.5">Patient's name and code</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Treatment</strong></td><td className="px-6 py-3.5">Type of treatment (e.g., Consultation)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Provider</strong></td><td className="px-6 py-3.5">Assigned doctor (or Unassigned)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Status</strong></td><td className="px-6 py-3.5">Current status — Scheduled, Completed, or Cancelled</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Actions</strong></td><td className="px-6 py-3.5">The <strong>Open menu</strong> button (⋮) for actions on that appointment</td></tr>
    </tbody>
  </table>
</div>
            <p>Use the <strong>date filter</strong> at the top of the table to view appointments for a specific day, week, or range.</p>
          </div>
        )
      },
      {
        id: 'appointment-statuses',
        heading: 'Appointment Statuses',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Status</th><th className="px-6 py-3">What it means</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Scheduled</strong></td><td className="px-6 py-3.5">Appointment is booked and upcoming</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Completed</strong></td><td className="px-6 py-3.5">Patient was seen — appointment is closed</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Cancelled</strong></td><td className="px-6 py-3.5">Appointment was cancelled</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'changing-an-appointment-status',
        heading: 'Changing an Appointment Status',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>In the appointment list, find the appointment.</li><li>Click <strong>Open menu</strong> (the ⋮ icon in the Actions column).</li><li>A small menu appears with these options:</li></ol>
            <DocScreenshot src="/assets/Appointment-Status.png" alt="Appointment Status dropdown" />
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Option</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Mark Completed</strong></td><td className="px-6 py-3.5">Changes status from Scheduled → Completed. Use this after the patient is seen</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>View Details</strong></td><td className="px-6 py-3.5">Opens the appointment detail page where you can edit all fields</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Delete</strong></td><td className="px-6 py-3.5">Permanently deletes the appointment (use with caution — see warning below)</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> <strong>Delete</strong> permanently removes the appointment with no way to recover it. If a patient cancels, use <strong>View Details</strong> to update the status to Cancelled instead. Cancellation keeps the record; deletion removes it entirely.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'editing-an-appointment',
        heading: 'Editing an Appointment',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Open menu (⋮)</strong> next to the appointment.</li><li>Select <strong>View Details</strong>.</li><li>The appointment detail page opens — update any field: date, time, patient, treatment, or doctor.</li><li>Click <strong>Save Changes</strong> (or the equivalent save button on that page).</li></ol>
          </div>
        )
      },
      {
        id: 'assigning-a-doctor-to-an-appointment',
        heading: 'Assigning a Doctor to an Appointment',
        content: (
          <div className="space-y-4">
            <p>When booking, select the doctor from the <strong>Provider</strong> dropdown. If the doctor was not assigned at booking:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Open menu (⋮) → View Details</strong>.</li><li>In the Provider field, select the correct doctor.</li><li>Save the changes.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Assigning a doctor helps the Queue system automatically route the patient to the right consultation room when they check in.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'no-double-booking-rule',
        heading: 'No Double-Booking Rule',
        content: (
          <div className="space-y-4">
            <p>Clerixs <strong>prevents two appointments from being booked for the same doctor at the same time</strong>. If you try to book a time slot that the doctor already has, Clerixs shows an error and asks you to pick a different time.</p>
            <p>This rule applies <strong>per doctor</strong>. Two different doctors can both have 10:00 AM appointments without any conflict.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> The double-booking check only applies when a doctor is assigned. If both appointments are left as <em>Unassigned</em>, Clerixs will allow them at the same time. Always assign a doctor when booking.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Clicking Delete instead of Cancel</td><td className="px-6 py-3.5">Always use View Details and change status to Cancelled</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Booking without selecting a doctor</td><td className="px-6 py-3.5">Always assign the Provider — it helps with queue routing</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Forgetting to book follow-ups</td><td className="px-6 py-3.5">Schedule the follow-up before the patient leaves</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not using the date filter</td><td className="px-6 py-3.5">Use the date filter to view only today's or this week's appointments</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="02-patients.md" className="text-blue-600 hover:underline font-semibold">02 — Patient Management</a> | Next: <a href="04-queue.md" className="text-blue-600 hover:underline font-semibold">04 — Queue Management</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'queue',
    title: '4. Live Queue Management',
    desc: "",
    sections: [
      {
        id: 'what-is-the-live-waiting-room',
        heading: 'What Is the Live Waiting Room?',
        content: (
          <div className="space-y-4">
            <p>The <strong>Live Waiting Room</strong> is Clerixs's real-time queue system. It shows every patient currently at your clinic — who is waiting, who is in consultation, and who has been seen.</p>
            <p>Every device logged into Clerixs sees the same queue updating live. When the receptionist adds a patient, the doctor's screen updates instantly — no refreshing needed.</p>
            <p>Click <strong>Queue</strong> in the left sidebar to open the Live Waiting Room.</p>
            <MockWaitingRoomScreenshot />
          </div>
        )
      },
      {
        id: 'adding-a-walk-in-patient',
        heading: 'Adding a Walk-In Patient',
        content: (
          <div className="space-y-4">
            <p>A <strong>walk-in patient</strong> is someone who arrives at the clinic without a prior appointment.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Queue</strong> in the left sidebar.</li><li>Click <strong>Add Walk-in</strong> (top right of the page).</li><li>The <strong>Add Walk-in Patient</strong> dialog opens.</li></ol>
            <DocScreenshot src="/assets/Walk-In-Patient.png" alt="Add Walk-in Patient" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>In the <strong>Patient Search / Name</strong> field, type the patient's name. Results appear as you type.</li><li>Click the correct patient name in the dropdown to select them.</li><li>If the patient is <strong>not registered yet</strong>, tick the <strong>Create Patient Profile</strong> checkbox. Enter their name and phone number — Clerixs registers them automatically.</li><li>In the <strong>Assign to Doctor</strong> dropdown, select which doctor the patient should see.</li><li>Click <strong>Confirm & Add to Queue</strong>.</li></ol>
            <p>The patient appears in the waiting room under the assigned doctor's section immediately. A toast notification confirms: <em>Patient added to queue successfully.</em></p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">If a patient calls ahead to say they are on the way, you can add them to the queue before they arrive so the doctor is ready.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'checking-in-a-patient-with-an-appointment',
        heading: 'Checking In a Patient with an Appointment',
        content: (
          <div className="space-y-4">
            <p>When a patient arrives for a booked appointment:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Queue</strong>.</li><li>Look for their name in the check-in section (appointments scheduled for today appear here).</li><li>Click <strong>Check In</strong> next to their name.</li></ol>
            <p>They are added to the waiting room immediately.</p>
          </div>
        )
      },
      {
        id: 'understanding-queue-statuses',
        heading: 'Understanding Queue Statuses',
        content: (
          <div className="space-y-4">
            <p>Each patient in the queue has a status badge showing where they are in the flow:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Status</th><th className="px-6 py-3">Meaning</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Waiting</strong></td><td className="px-6 py-3.5">Patient is in the waiting room — not yet seen</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>In Consultation</strong></td><td className="px-6 py-3.5">Patient is currently with the doctor</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Completed</strong></td><td className="px-6 py-3.5">Consultation is done — patient has left</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'moving-patients-through-the-queue',
        heading: 'Moving Patients Through the Queue',
        content: (
          <div className="space-y-4">
            <p>The receptionist or doctor can move patients forward using action buttons on each patient card:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Button</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Call Next</strong></td><td className="px-6 py-3.5">Moves the first Waiting patient to In Consultation</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Complete</strong></td><td className="px-6 py-3.5">Marks the patient as done — moves to Completed status</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Skip</strong></td><td className="px-6 py-3.5">Moves the patient to the back of the queue (use if a patient is not ready when called)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Remove</strong></td><td className="px-6 py-3.5">Removes the patient from the queue entirely (use if a patient leaves without being seen)</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Use <strong>Skip</strong> when a patient needs more time to prepare (fill a form, visit the restroom, etc.) and you want to call the next patient without losing their place.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-real-time-updates-work',
        heading: 'How Real-Time Updates Work',
        content: (
          <div className="space-y-4">
            <p>Clerixs uses live database connections. Every change you make — adding a patient, updating a status, removing someone — is instantly visible on every logged-in device in your clinic.</p>
            <p>The doctor's screen shows only their assigned patients. The receptionist's screen shows all doctors and all patients.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> The queue only updates live when the browser tab is <strong>open and active</strong>. If a staff member's screen is locked or the browser is closed, they will miss live updates until they log back in.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'daily-queue-reset',
        heading: 'Daily Queue Reset',
        content: (
          <div className="space-y-4">
            <p>The queue automatically clears at <strong>midnight IST</strong> every night. All Completed and Removed patients are archived and the queue starts fresh the next day.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Patients who are still <strong>Waiting</strong> or <strong>In Consultation</strong> at midnight are <strong>not automatically cleared</strong>. A staff member must manually click <strong>Complete</strong> or <strong>Remove</strong> before midnight to keep the next day's queue clean. Make it a habit to clear the queue before closing the clinic each day.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Adding the same walk-in patient twice</td><td className="px-6 py-3.5">Always search before adding — the patient may already be in the queue</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not assigning a doctor</td><td className="px-6 py-3.5">Unassigned patients are not routed to any doctor's view — always assign one</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Leaving patients in "Waiting" overnight</td><td className="px-6 py-3.5">Clear the queue every evening before closing</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Confusing Remove with Complete</td><td className="px-6 py-3.5">Use Complete when the patient was seen. Use Remove only when they left without a consultation</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="03-appointments.md" className="text-blue-600 hover:underline font-semibold">03 — Appointments</a> | Next: <a href="05-prescriptions.md" className="text-blue-600 hover:underline font-semibold">05 — Prescriptions</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'prescriptions',
    title: '5. Prescriptions',
    desc: "",
    sections: [
      {
        id: 'what-is-the-prescriptions-feature',
        heading: 'What Is the Prescriptions Feature?',
        content: (
          <div className="space-y-4">
            <p>The <strong>Prescriptions</strong> feature lets doctors write digital prescriptions directly in Clerixs. Every prescription is saved permanently to the patient's profile, can be printed as a professional PDF, and can be sent to the patient via WhatsApp in one click.</p>
            <p>Prescriptions include your clinic's letterhead, the doctor's digital signature, patient details, diagnosis, medicines, frequency, and advice — all formatted professionally without any manual design work.</p>
          </div>
        )
      },
      {
        id: 'writing-a-new-prescription',
        heading: 'Writing a New Prescription',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Prescriptions</strong> tab.</li><li>Click <strong>New Prescription</strong>.</li></ol>
            <DocScreenshot src="/assets/Patient-profile-Prescriptions-tab.png" alt="Prescriptions tab" url="app.clerixs.com/patients" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>A dialog appears: <strong>Choose Prescription Template</strong>.</li></ol>
            <DocScreenshot src="/assets/Choose-Prescription-Template.png" alt="Choose Prescription Template" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Start Blank</strong> to write a fresh prescription with no pre-filled medicines.</li></ol>
            <p>— OR —</p>
            <p>Click a saved template to load a pre-written prescription (see <a href="#using-prescription-templates" className="text-blue-600 hover:underline font-semibold">Using Templates</a> below).</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>The prescription form opens.</li></ol>
          </div>
        )
      },
      {
        id: 'prescription-form-section-by-section',
        heading: 'Prescription Form — Section by Section',
        content: (
          <div className="space-y-4">
            <MockPrescriptionFormScreenshot />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">SMART PRESCRIBE</h4>
            <p>At the top of the form you see the <strong>SMART PRESCRIBE</strong> banner with two buttons:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>Load Template</strong> — Load a saved prescription template into this form.</li><li><strong>Save as Template</strong> — Save the current prescription as a reusable template.</li></ul>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">CLINICAL DIAGNOSIS</h4>
            <p>This is a <strong>mandatory field</strong>. Type the patient's diagnosis for this visit.</p>
            <p>Examples:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><em>Type 2 Diabetes mellitus — 3-month follow-up</em></li><li><em>Acute viral upper respiratory tract infection</em></li><li><em>Generalised anxiety disorder</em></li></ul>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> You <strong>cannot</strong> click <strong>Generate Prescription</strong> if this field is empty. Clerixs will show the error: <em>Clinical diagnosis is required.</em> Fill this in before anything else.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Use the <strong>voice-to-text feature</strong> to speak the diagnosis instead of typing it. Hold <strong>Ctrl+Shift</strong> and speak clearly. Release when done. See <a href="#voice-to-text-feature" className="text-blue-600 hover:underline font-semibold">Voice-to-Text</a> below.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">MEDICATIONS RX</h4>
            <p>This section is where you add medicines.</p>
            <p><strong>Each medicine row has these fields:</strong></p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Drug Name</strong> — shows <em>Search medicine...</em></td><td className="px-6 py-3.5">Type the medicine name. A dropdown appears with matching medicines. Click to select</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Dosage</strong></td><td className="px-6 py-3.5">Enter the strength — e.g., <em>500mg</em>, <em>2%</em>, <em>10ml</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Duration (Days)</strong></td><td className="px-6 py-3.5">Number of days the medicine should be taken — e.g., <em>5</em>, <em>30</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Morn / Aft / Ngt</strong></td><td className="px-6 py-3.5">Click the frequency buttons to toggle morning, afternoon, and night doses</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Food / Special Instructions</strong></td><td className="px-6 py-3.5">Optional — e.g., <em>Take after food</em>, <em>Apply on affected area only</em></td></tr>
    </tbody>
  </table>
</div>
            <DocScreenshot src="/assets/Prescription.png" alt="Filled medicine row" />
            <p><strong>Adding more medicines:</strong></p>
            <p>Click <strong>Add Another Medicine</strong> to add a second (or third, fourth…) medicine row.</p>
            <p><strong>Frequency toggles explained:</strong></p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Button</th><th className="px-6 py-3">When to click it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Morn</strong></td><td className="px-6 py-3.5">Patient should take the medicine in the morning</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Aft</strong></td><td className="px-6 py-3.5">Patient should take the medicine in the afternoon</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Ngt</strong></td><td className="px-6 py-3.5">Patient should take the medicine at night</td></tr>
    </tbody>
  </table>
</div>
            <p>A medicine taken twice a day (morning and night) = click <strong>Morn</strong> and <strong>Ngt</strong>. A medicine taken three times a day = click all three.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">GENERAL ADVICE / NEXT STEPS</h4>
            <p>A free-text field for non-medicine instructions. Use it for:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Dietary advice (<em>Avoid sugar and fried foods</em>)</li><li>Lifestyle changes (<em>Walk 30 minutes daily</em>)</li><li>Activity restrictions (<em>Bed rest for 3 days</em>)</li><li>Follow-up instructions (<em>Return in 10 days</em>)</li><li>Referrals (<em>Refer to cardiologist for further evaluation</em>)</li></ul>
            <p>This field is optional but highly recommended — it makes the prescription a complete clinical document.</p>
          </div>
        )
      },
      {
        id: 'medicine-autocomplete',
        heading: 'Medicine Autocomplete',
        content: (
          <div className="space-y-4">
            <p>When you type in the <strong>Drug Name</strong> field, Clerixs searches its built-in Indian medicines database and shows matching results in a dropdown.</p>
            <DocScreenshot src="/assets/Medicine-Autocomplete.png" alt="Medicine Autocomplete" />
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Type at least <strong>3 characters</strong> for best results.</li><li>The autocomplete searches both <strong>generic names</strong> (e.g., Amoxicillin) and <strong>brand names</strong> (e.g., Amoxil, Mox).</li><li>Click any result to fill the field.</li></ul>
          </div>
        )
      },
      {
        id: 'adding-a-custom-medicine',
        heading: 'Adding a Custom Medicine',
        content: (
          <div className="space-y-4">
            <p>If a medicine is not in the autocomplete list:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings</strong> in the left sidebar.</li><li>Find the <strong>Prescription</strong> or <strong>Medicine Catalog</strong> section.</li><li>Click <strong>Add Medicine</strong>.</li><li>Enter the medicine name, form (tablet / syrup / injection / cream / etc.), and default dosage.</li><li>Click <strong>Save</strong>.</li></ol>
            <p>The medicine is now available in all prescription forms across your clinic.</p>
          </div>
        )
      },
      {
        id: 'voice-to-text-feature',
        heading: 'Voice-to-Text Feature',
        content: (
          <div className="space-y-4">
            <p>Clerixs has a built-in voice input to speed up prescription writing.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click inside any text field — Clinical Diagnosis, General Advice, or the Drug Name field.</li><li><strong>Hold Ctrl+Shift</strong> (Windows/Linux) — your browser's microphone activates.</li><li>Speak clearly at a normal pace.</li><li>Release <strong>Ctrl+Shift</strong> when you finish speaking.</li></ol>
            <p>Your speech is transcribed directly into the field.</p>
            <DocScreenshot src="/assets/Voice-to-Text.png" alt="Voice-to-Text" />
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Your browser must have microphone permission enabled for <strong>app.clerixs.com</strong>. If you see a microphone blocked icon in the browser's address bar, click it and select <strong>Allow</strong>.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Doctors who use voice-to-text for diagnosis and advice report writing prescriptions in half the time compared to typing.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'generating-the-prescription-pdf',
        heading: 'Generating the Prescription PDF',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>After completing all fields, click <strong>Generate Prescription</strong> (bottom of the form).</li><li>A new browser tab opens with the <strong>printable prescription</strong>.</li></ol>
            <MockPrescriptionPrintScreenshot />
            <p>The printed prescription includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Your <strong>clinic letterhead</strong> (the image you uploaded in Settings)</li><li><strong>Patient Details</strong> — name, code, age, gender</li><li><strong>Prescription Details</strong> — Rx number, date, doctor's name</li><li><strong>⚕ Clinical Diagnosis</strong></li><li><strong>Medications Rx</strong> — formatted medicine table with dosage, frequency, and duration</li><li><strong>General Advice / Next Steps</strong> (if filled)</li><li><strong>Authorised Signature</strong> — the doctor's digital signature image</li><li>Footer: <em>This is a computer-generated document and does not require a physical stamp inside Clerixs networks.</em></li></ul>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Print PDF</strong> (top right of the print page) to open your browser's print dialog.</li><li>In the print dialog, select <strong>Save as PDF</strong> to save a digital copy, or select your printer to print on paper.</li></ol>
          </div>
        )
      },
      {
        id: 'saving-a-prescription-as-a-template',
        heading: 'Saving a Prescription as a Template',
        content: (
          <div className="space-y-4">
            <p>If you write similar prescriptions often (e.g., for hypertension follow-ups, seasonal fever, diabetes protocol), save them as templates for one-click reuse.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Fill in the prescription form completely.</li><li>Before clicking Generate Prescription, click <strong>Save as Template</strong>.</li><li>Give the template a clear name — e.g., <em>HTN Follow-Up</em>, <em>Cold & Cough Adult</em>, <em>Diabetic Protocol Q3</em>.</li><li>Click <strong>Save</strong>.</li></ol>
            <p>Templates are saved to your clinic and are available to <strong>all doctors</strong> at your clinic.</p>
          </div>
        )
      },
      {
        id: 'using-prescription-templates',
        heading: 'Using Prescription Templates',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>New Prescription</strong> on any patient's profile.</li><li>In the <strong>Choose Prescription Template</strong> dialog, your saved templates appear under:</li></ol>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>RECENTLY USED</strong> — templates you personally used recently.</li><li><strong>ALL CLINIC TEMPLATES</strong> — all templates saved by anyone at your clinic.</li></ul>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click a template to load it into the form.</li><li><strong>Always review and update the loaded fields</strong> — change the diagnosis, adjust dosage, and modify advice to match this specific patient.</li><li>Click <strong>Generate Prescription</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Templates auto-fill medicines and dosages. Do not generate the prescription without reviewing every field — the loaded medicines are a starting point, not a final prescription.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'sending-a-prescription-via-whatsapp',
        heading: 'Sending a Prescription via WhatsApp',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's <strong>Prescriptions</strong> tab.</li><li>Find the prescription you want to send.</li><li>Click the <strong>WhatsApp</strong> button (WhatsApp icon) next to that prescription.</li><li>Confirm the patient's phone number shown in the dialog.</li><li>Click <strong>Send via WhatsApp</strong>.</li></ol>
            <p>The patient receives a WhatsApp message with a link to download their prescription PDF.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Each WhatsApp send uses <strong>1 WhatsApp Credit</strong>. Monitor your credit balance in the left sidebar. See <a href="12-whatsapp.md" className="text-blue-600 hover:underline font-semibold">WhatsApp Integration</a> for details.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'prescription-history',
        heading: 'Prescription History',
        content: (
          <div className="space-y-4">
            <p>All prescriptions are saved permanently to the patient's profile. They never expire or disappear.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile → <strong>Prescriptions</strong> tab.</li><li>Every prescription is listed — date, prescribing doctor, number of medicines.</li><li>Click <strong>View</strong> to reopen any prescription.</li><li>Click <strong>Print PDF</strong> to reprint.</li><li>Click the <strong>WhatsApp</strong> button to resend.</li></ol>
            <p>Prescriptions <strong>cannot be deleted</strong> — this preserves a complete, auditable clinical record.</p>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Forgetting to fill Clinical Diagnosis</td><td className="px-6 py-3.5">Fill this first — the form cannot be submitted without it</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Loading a template and generating without reviewing</td><td className="px-6 py-3.5">Always check every field after loading a template</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not enabling microphone for voice-to-text</td><td className="px-6 py-3.5">Allow microphone access in your browser settings for app.clerixs.com</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Closing the print tab before saving as PDF</td><td className="px-6 py-3.5">Print / Save PDF before closing the print tab</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Sending via WhatsApp to the wrong number</td><td className="px-6 py-3.5">Verify the phone number in the WhatsApp dialog before clicking Send</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="04-queue.md" className="text-blue-600 hover:underline font-semibold">04 — Queue Management</a> | Next: <a href="06-lab.md" className="text-blue-600 hover:underline font-semibold">06 — Lab Dashboard</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'lab',
    title: '6. Lab Dashboard',
    desc: "",
    sections: [
      {
        id: 'what-is-the-lab-dashboard',
        heading: 'What Is the Lab Dashboard?',
        content: (
          <div className="space-y-4">
            <p>The <strong>Lab Dashboard</strong> is where your clinic manages all diagnostic tests — from the moment a doctor orders a test to the moment the patient receives their report.</p>
            <p>It tracks every lab order through four stages: <strong>Ordered → Collected → Submitted → Completed</strong>.</p>
            <p>Click <strong>Lab Dashboard</strong> in the left sidebar to open it.</p>
            <MockLabDashboardScreenshot />
          </div>
        )
      },
      {
        id: 'lab-dashboard-overview',
        heading: 'Lab Dashboard Overview',
        content: (
          <div className="space-y-4">
            <p>The top of the page shows <strong>three summary cards</strong>:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Card</th><th className="px-6 py-3">What it shows</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Pending Collection</strong> — <em>Awaiting sample draw</em></td><td className="px-6 py-3.5">Orders placed by a doctor but sample not yet collected</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>In Processing</strong> — <em>Samples collected & analyzing</em></td><td className="px-6 py-3.5">Samples collected — awaiting result entry</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Completed Reports</strong> — <em>Results finalized</em></td><td className="px-6 py-3.5">Reports with results entered and approved</td></tr>
    </tbody>
  </table>
</div>
            <p>Below the cards is the <strong>Recent Lab Orders</strong> table:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Column</th><th className="px-6 py-3">What it shows</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Order ID</strong></td><td className="px-6 py-3.5">Unique ID for this order (e.g., 6D6BE6F5)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Date</strong></td><td className="px-6 py-3.5">Date the order was created</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patient</strong></td><td className="px-6 py-3.5">Patient name and code</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Tests</strong></td><td className="px-6 py-3.5">Test(s) ordered (e.g., CBC, Lipid Profile)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Sample Type</strong></td><td className="px-6 py-3.5">Blood, Urine, etc.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Status</strong></td><td className="px-6 py-3.5">Current stage: Ordered, Collected, Submitted, Completed</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Action</strong></td><td className="px-6 py-3.5"><strong>Manage Details</strong> link to open the order</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'creating-a-lab-order-for-a-patient',
        heading: 'Creating a Lab Order for a Patient',
        content: (
          <div className="space-y-4">
            <p>Lab orders are created from the <strong>patient's profile</strong>, not from the Lab Dashboard directly.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Lab & Docs</strong> tab.</li><li>Click <strong>Order Lab Test</strong>.</li></ol>
            <DocScreenshot src="/assets/Creating-a-Lab-Order-for-a-patient.png" alt="Creating a Lab Order" url="app.clerixs.com/lab/new" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>On the lab order form, fill in:</li></ol>
            <p><strong>Sample Type</strong> — click one of the six options:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>Blood (Serum/Plasma)</strong></li><li><strong>Urine</strong></li><li><strong>Saliva / Swab</strong></li><li><strong>Stool</strong></li><li><strong>Tissue / Biopsy</strong></li><li><strong>Other</strong></li></ul>
            <p><strong>Technician Notes</strong> — optional instructions for the lab technician (e.g., <em>Collect fasting sample</em>, <em>Refrigerate immediately</em>).</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Browse Catalog</strong> to add tests (see <a href="#adding-tests-from-the-catalog" className="text-blue-600 hover:underline font-semibold">Adding Tests from the Catalog</a> below).</li><li>Review the <strong>Order Summary</strong> — it shows the subtotal, any discount, and the <strong>TOTAL AMOUNT PAYABLE</strong>.</li><li>Click <strong>Confirm Lab Order</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> You must add <strong>at least one test</strong> before clicking <strong>Confirm Lab Order</strong>. If no tests are selected, Clerixs shows the error: <em>Please add at least one test before confirming the order.</em></p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'adding-tests-from-the-lab-catalog',
        heading: 'Adding Tests from the Lab Catalog',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>On the lab order form, click <strong>Browse Catalog</strong>.</li><li>A panel opens showing your clinic's full list of tests — organised by category.</li><li>Search for a test by name (e.g., <em>CBC</em>, <em>HbA1c</em>, <em>Lipid Profile</em>, <em>Thyroid</em>).</li><li>Click the <strong>+</strong> button next to any test to add it to the order.</li><li>Add as many tests as needed.</li><li>Close the catalog panel when done.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">You can add multiple tests to one order — for example, CBC + Lipid Profile + HbA1c together. This creates one combined lab report for the patient.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Add your clinic's standard tests to the Lab Catalog in Settings before you start using the lab feature. See <a href="10-settings.md#lab-catalog" className="text-blue-600 hover:underline font-semibold">Lab Catalog Settings</a>.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'the-four-stages-of-a-lab-order',
        heading: 'The Four Stages of a Lab Order',
        content: (
          <div className="space-y-4">
            <p>Every lab order moves through four stages. Each stage requires an action from staff.</p>
            <DocScreenshot src="/assets/Four-Stages-of-a-Lab-Order.png" alt="Four Stages of a Lab Order" url="app.clerixs.com/lab/orders" />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Stage 1 — ORDERED</h4>
            <p>The doctor has placed the order. The lab technician has not yet collected the sample.</p>
            <p><strong>Action:</strong> The lab technician opens the order and clicks <strong>Collect Sample</strong>.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Stage 2 — COLLECTED</h4>
            <p>The sample has been drawn from the patient and labelled with the barcode or identifier.</p>
            <p>In the <strong>Sample Detail</strong> section, enter the <strong>BARCODE / IDENTIFIER</strong> for the sample (the tube label or accession number from your lab).</p>
            <p><strong>Action:</strong> Enter test results for each parameter. Click <strong>Submit Results</strong>.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Stage 3 — SUBMITTED</h4>
            <p>The lab technician has entered all results. The order is waiting for the doctor to review.</p>
            <p><strong>Action:</strong> The doctor reviews the results and clicks <strong>Approve & Finalize Report</strong> — or clicks <strong>Request Revision</strong> to send it back to the technician for correction.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Stage 4 — COMPLETED</h4>
            <p>The report is finalised and locked. The patient can now receive their report.</p>
            <p><strong>Action:</strong> Print the report or share it with the patient.</p>
          </div>
        )
      },
      {
        id: 'entering-test-results',
        heading: 'Entering Test Results',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open a lab order that is in <strong>Collected</strong> stage. Click <strong>Manage Details</strong> from the Lab Dashboard.</li><li>Scroll to the <strong>Test Parameters</strong> section.</li><li>For each test in the order, enter the <strong>result value</strong> in the input field.</li><li>Clerixs automatically compares your result against the <strong>normal reference range</strong> set in your Lab Catalog.</li><li>Click <strong>Submit Results</strong>.</li></ol>
            <DocScreenshot src="/assets/lab-Test-Results.png" alt="Lab Test Results" />
          </div>
        )
      },
      {
        id: 'abnormal-value-flags',
        heading: 'Abnormal Value Flags',
        content: (
          <div className="space-y-4">
            <p>When a result is outside the normal range, Clerixs shows a <strong>⚠️ warning triangle</strong> next to that value.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>High result</strong> (above normal range) — flagged in red.</li><li><strong>Low result</strong> (below normal range) — flagged in orange.</li><li><strong>Normal result</strong> — shown in black with no flag.</li></ul>
            <p>The doctor sees these flags clearly when reviewing and can take appropriate clinical action.</p>
          </div>
        )
      },
      {
        id: 'finalising-a-lab-report',
        heading: 'Finalising a Lab Report',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open a lab order in <strong>Submitted</strong> stage.</li><li>Review all test results and abnormal flags.</li><li>If everything is correct, click <strong>Approve & Finalize Report</strong>.</li><li>The order status changes to <strong>Completed</strong> and the results are locked.</li><li>Click <strong>Print Report</strong> (or the print button on the order page) to open the printable report PDF.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Once you click <strong>Approve & Finalize Report</strong>, the results are <strong>locked and cannot be edited</strong>. If a correction is needed, click <strong>Request Revision</strong> instead — this sends the order back to the lab technician.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'requesting-a-revision',
        heading: 'Requesting a Revision',
        content: (
          <div className="space-y-4">
            <p>If a result is incorrect or incomplete:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the lab order in <strong>Submitted</strong> stage.</li><li>Click <strong>Request Revision</strong>.</li><li>The order status goes back to <strong>Collected</strong> so the technician can update the results.</li><li>The technician corrects the values and clicks <strong>Submit Results</strong> again.</li><li>The doctor reviews the corrected report and clicks <strong>Approve & Finalize Report</strong>.</li></ol>
          </div>
        )
      },
      {
        id: 'printing-a-lab-report',
        heading: 'Printing a Lab Report',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open any <strong>Completed</strong> lab order.</li><li>Click <strong>Print Report</strong> (or the print/download button on that page).</li><li>A print-ready PDF opens in a new browser tab.</li></ol>
            <p>The lab report PDF includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Your clinic's letterhead</li><li>Patient name and code</li><li>Order date and order ID</li><li>All test names, result values, normal reference ranges, and units</li><li>Abnormal value flags clearly marked</li><li>Finalisation date</li></ul>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Press <strong>Ctrl+P</strong> to print or choose <strong>Save as PDF</strong> in the print dialog.</li></ol>
          </div>
        )
      },
      {
        id: 'uploading-external-lab-reports',
        heading: 'Uploading External Lab Reports',
        content: (
          <div className="space-y-4">
            <p>For tests done at an outside laboratory (e.g., a reference lab), you can attach the external report to the patient's profile.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile → <strong>Lab & Docs</strong> tab.</li><li>Click <strong>Upload External</strong>.</li><li>Select the PDF or image file from your device.</li><li>Add a label — e.g., <em>MRI Report — May 2026</em> or <em>External Blood Work — Apollo Lab</em>.</li><li>Click <strong>Upload</strong>.</li></ol>
            <p>The file is saved permanently to the patient's Lab & Docs tab and can be downloaded by any staff member at any time.</p>
            <DocScreenshot src="/assets/Uploading-External-Lab-Reports.png" alt="Uploading External Lab Reports" />
          </div>
        )
      },
      {
        id: 'lab-orders-on-the-patient-profile',
        heading: 'Lab Orders on the Patient Profile',
        content: (
          <div className="space-y-4">
            <p>All lab orders — both created in Clerixs and uploaded externally — appear in the patient's <strong>Lab & Docs</strong> tab.</p>
            <p>Each entry shows the date, order ID, test names, sample type, and current status. Click <strong>Manage Details</strong> to open any order.</p>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Confirming an order with no tests</td><td className="px-6 py-3.5">Always add at least one test from Browse Catalog before clicking Confirm Lab Order</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Finalising a report before reviewing abnormal flags</td><td className="px-6 py-3.5">Review every ⚠️ flag before clicking Approve & Finalize Report</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Entering the wrong barcodel</td><td className="px-6 py-3.5">Double-check the BARCODE / IDENTIFIER against the physical tube label</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not uploading external reports</td><td className="px-6 py-3.5">Attach all outside lab reports so the doctor has a complete picture</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Editing a finalised result</td><td className="px-6 py-3.5">Once finalised, use Request Revision — you cannot directly edit a completed order</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="05-prescriptions.md" className="text-blue-600 hover:underline font-semibold">05 — Prescriptions</a> | Next: <a href="07-billing.md" className="text-blue-600 hover:underline font-semibold">07 — Billing & Invoices</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'billing',
    title: '7. Billing & Invoices',
    desc: "",
    sections: [
      {
        id: 'what-is-the-billing-section',
        heading: 'What Is the Billing Section?',
        content: (
          <div className="space-y-4">
            <p>The <strong>Billing</strong> section is where you create invoices for patients, record payments, and track your clinic's revenue. Every invoice is linked to a patient and can be printed as a professional PDF.</p>
            <p>Click <strong>Billing</strong> in the left sidebar to open the billing list.</p>
            <DocScreenshot src="/assets/Billing-&-Invoices.png" alt="Billing and Invoices" url="app.clerixs.com/billing" />
          </div>
        )
      },
      {
        id: 'creating-a-new-invoice',
        heading: 'Creating a New Invoice',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Billing</strong> in the left sidebar.</li><li>Click <strong>New Invoice</strong> (top right).</li><li>The invoice creation form opens.</li></ol>
            <MockInvoiceFormScreenshot />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Select the patient from the <strong>Bill To (Patient)</strong> dropdown — type to search by name.</li><li>Set the <strong>Issue Date</strong> (defaults to today) and optionally a <strong>Due Date</strong>.</li><li>Set the <strong>Initial Status</strong> — choose Draft, Issued, Partially Paid, or Paid.</li><li>Add line items (see <a href="#adding-items-from-the-price-catalog" className="text-blue-600 hover:underline font-semibold">Adding Items from the Price Catalog</a> below).</li><li>Apply a discount if needed (see <a href="#applying-a-discount" className="text-blue-600 hover:underline font-semibold">Applying a Discount</a> below).</li><li>If payment was received at the time of invoicing, enter the amount in <strong>Amount Paid (₹) Now</strong>.</li><li>Click <strong>Create Invoice</strong>.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">You can also create an invoice directly from a patient's profile. Open the patient → <strong>Billing & Invoices</strong> tab → <strong>New Invoice</strong>. The patient field is pre-filled.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'adding-items-from-the-price-catalog',
        heading: 'Adding Items from the Price Catalog',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>On the invoice form, click <strong>Add Item</strong>.</li><li>A dropdown appears — search for a treatment or service from your <strong>Price Catalog</strong> (e.g., <em>Consultation</em>, <em>X-Ray</em>, <em>Root Canal</em>, <em>Blood Test</em>).</li><li>Click the item — the name and price auto-fill from your catalog.</li><li>Adjust the <strong>Quantity</strong> if the patient is being charged for multiple units.</li><li>Repeat to add more line items.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> If an item does not appear in the search, it has not been added to your Price Catalog yet. Go to <strong>Settings → Price Catalog</strong> to add it first, then come back to create the invoice. See <a href="10-settings.md#price-catalog" className="text-blue-600 hover:underline font-semibold">Price Catalog</a>.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'understanding-gst-on-invoices',
        heading: 'Understanding GST on Invoices',
        content: (
          <div className="space-y-4">
            <p>Clerixs automatically calculates <strong>GST</strong> for line items marked as taxable in your Price Catalog:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Tax</th><th className="px-6 py-3">Rate</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>CGST</strong></td><td className="px-6 py-3.5">2.5%</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>SGST</strong></td><td className="px-6 py-3.5">2.5%</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Total GST</strong></td><td className="px-6 py-3.5">5%</td></tr>
    </tbody>
  </table>
</div>
            <p>The GST breakdown appears on the invoice PDF as a separate line. To apply GST, your clinic's <strong>GST Number (GSTIN)</strong> must be saved in <strong>Settings → Clinic Settings</strong>.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Medical consultation fees are generally <strong>GST-exempt</strong> under Indian law. Apply GST only to non-exempt services. Consult your accountant for guidance specific to your clinic type.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'applying-a-discount',
        heading: 'Applying a Discount',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>On the invoice form, find the <strong>Global Discount (₹)</strong> field in the totals summary area (bottom right).</li><li>Enter the discount amount in rupees (e.g., ₹100 off a ₹500 invoice).</li><li>The <strong>Total</strong> updates automatically — it shows: Subtotal → Discount → SGST 2.5% → CGST 2.5% → <strong>Total</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> The discount cannot exceed the invoice total. If you enter a discount larger than the invoice amount, Clerixs will show an error: <em>Discount cannot exceed invoice total of ₹XXX.</em></p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'invoice-statuses',
        heading: 'Invoice Statuses',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Status</th><th className="px-6 py-3">What it means</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Draft</strong></td><td className="px-6 py-3.5">Invoice saved but not yet issued. You can still edit it</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Issued</strong></td><td className="px-6 py-3.5">Invoice finalised and issued — payment is now expected</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Partially Paid</strong></td><td className="px-6 py-3.5">Some payment received — a balance is still outstanding</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Paid</strong></td><td className="px-6 py-3.5">Full payment received — invoice is closed</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'recording-a-payment',
        heading: 'Recording a Payment',
        content: (
          <div className="space-y-4">
            <p>When a patient pays (in full or in part):</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the invoice — find it in the <strong>Billing</strong> list or in the patient's <strong>Billing & Invoices</strong> tab.</li><li>Click <strong>Record Payment</strong>.</li><li>Fill in the payment details:</li></ol>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Amount Received</strong></td><td className="px-6 py-3.5">The amount paid (e.g., ₹500)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Payment Mode</strong></td><td className="px-6 py-3.5">Cash, UPI, Card, Cheque, Bank Transfer, etc.</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Date</strong></td><td className="px-6 py-3.5">Date of payment (defaults to today)</td></tr>
    </tbody>
  </table>
</div>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Save Payment</strong>.</li></ol>
            <p>The invoice status updates automatically:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Partial payment → status becomes <strong>Partially Paid</strong></li><li>Full payment → status becomes <strong>Paid</strong></li></ul>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">For UPI payments, note the UPI transaction ID in the payment remarks field. This helps during audits.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'printing-and-downloading-an-invoice-pdf',
        heading: 'Printing and Downloading an Invoice PDF',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open any issued invoice.</li><li>Click <strong>Print / Download PDF</strong> (top right of the invoice).</li><li>The invoice PDF opens in a new browser tab.</li></ol>
            <DocScreenshot src="/assets/Downloading-an-Invoice-PDF.png" alt="Invoice PDF" />
            <p>The PDF includes:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Clinic name and logo</li><li>Invoice number (format: <strong>INV-000123</strong>)</li><li>Patient name and address</li><li>All line items with quantities and prices</li><li>GST breakdown (CGST + SGST)</li><li>Discount applied</li><li>Total amount payable</li><li>Payment status and amount received</li><li>Balance outstanding (if partially paid)</li></ul>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Press <strong>Ctrl+P</strong> to print or save as PDF.</li></ol>
          </div>
        )
      },
      {
        id: 'understanding-invoice-numbers',
        heading: 'Understanding Invoice Numbers',
        content: (
          <div className="space-y-4">
            <p>Clerixs generates invoice numbers automatically in the format <strong>INV-XXXXXX</strong> — for example, <strong>INV-000001</strong>, <strong>INV-000045</strong>.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Numbers are assigned sequentially in order.</li><li>You cannot change or choose an invoice number.</li><li>This format is audit-friendly and meets Indian accounting standards.</li></ul>
          </div>
        )
      },
      {
        id: 'viewing-billing-history',
        heading: 'Viewing Billing History',
        content: (
          <div className="space-y-4">
            <p>All invoices are saved permanently in the <strong>Billing</strong> section. Use the search and filter tools to find any invoice:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Search by patient name or patient code</li><li>Filter by status (Draft, Issued, Partially Paid, Paid)</li><li>Filter by date range</li></ul>
            <p>You can also see a patient's complete billing history from their profile → <strong>Billing & Invoices</strong> tab.</p>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Issuing an invoice before adding all items</td><td className="px-6 py-3.5">Use Save as Draft first, review, then issue</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Adding a discount larger than the invoice total</td><td className="px-6 py-3.5">Keep discounts within the invoice total — Clerixs will block oversized discounts</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not recording a payment</td><td className="px-6 py-3.5">Always record payments so the invoice status stays accurate</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Printing an invoice before issuing it</td><td className="px-6 py-3.5">Issue the invoice first — Draft invoices are not final</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not setting up Price Catalog first</td><td className="px-6 py-3.5">Set up all your treatments in Settings before creating invoices</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="06-lab.md" className="text-blue-600 hover:underline font-semibold">06 — Lab Dashboard</a> | Next: <a href="08-staff.md" className="text-blue-600 hover:underline font-semibold">08 — Staff Management</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'staff',
    title: '8. Staff Management',
    desc: "",
    sections: [
      {
        id: 'what-is-staff-management',
        heading: 'What Is Staff Management?',
        content: (
          <div className="space-y-4">
            <p>The <strong>Staff</strong> section lets you invite your clinic team — doctors, receptionists, and lab technicians — to Clerixs. Each staff member gets their own login and sees only what their role allows.</p>
            <p>Click <strong>Staff</strong> in the left sidebar to open the staff list.</p>
            <MockInviteMemberScreenshot />
          </div>
        )
      },
      {
        id: 'inviting-a-staff-member',
        heading: 'Inviting a Staff Member',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Staff</strong> in the left sidebar.</li><li>Click <strong>Invite Member</strong> (top right).</li><li>The <strong>Invite to Clinic workspace</strong> dialog opens.</li></ol>
            <DocScreenshot src="/assets/Inviting-a-Staff-Member.png" alt="Invite Staff Member" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Fill in the invitation form:</li></ol>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Email Address</strong></td><td className="px-6 py-3.5">The staff member's work email address</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Role</strong></td><td className="px-6 py-3.5">Select: <strong>doctor</strong>, <strong>receptionist</strong>, or <strong>lab technician</strong> (see roles below)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Primary Branch</strong></td><td className="px-6 py-3.5">Select the branch they will work at</td></tr>
    </tbody>
  </table>
</div>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Send Invite</strong>.</li></ol>
            <p>Clerixs immediately sends an invitation email to that address. The staff member must click the link in the email to set their password and activate their account.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Ask the staff member to check their <strong>Spam</strong> or <strong>Promotions</strong> folder if the email does not arrive within 5 minutes. Invitation emails sometimes land there.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'staff-roles-who-sees-what',
        heading: 'Staff Roles — Who Sees What',
        content: (
          <div className="space-y-4">
            <p>Clerixs has four roles. Each role controls exactly which parts of the app the staff member can access.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Owner</h4>
            <p>The <strong>Owner</strong> is the person who created the Clerixs account. There is one Owner per clinic. The Owner has access to <strong>everything</strong> — all patients, all clinical features, all billing, all reports, staff management, and subscription settings.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Doctor</h4>
            <p><strong>Doctors</strong> can access:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Patient profiles (view and edit)</li><li>Write and view prescriptions</li><li>View and create appointments</li><li>View their own queue patients</li><li>Create and manage lab orders</li><li>View and manage their profile</li></ul>
            <p>Doctors <strong>cannot</strong> access: financial reports, subscription settings, or staff management.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Receptionist</h4>
            <p><strong>Receptionists</strong> can access:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Patient registration and search</li><li>Booking and managing appointments</li><li>Queue management (all doctors)</li><li>Creating invoices</li></ul>
            <p>Receptionists <strong>cannot</strong> access: prescription writing, lab result entry, financial reports, or staff management.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Lab Technician</h4>
            <p><strong>Lab Technicians</strong> can access <strong>only the Lab Dashboard</strong>:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>View assigned lab orders</li><li>Collect samples and enter barcodes</li><li>Enter test results</li><li>Submit results for doctor review</li></ul>
            <p>Lab Technicians <strong>cannot</strong> access patients, appointments, prescriptions, billing, or reports.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Always assign the most restrictive role that covers a staff member's actual job. This protects patient privacy and prevents accidental changes to data outside their responsibilities.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-staff-accept-an-invitation',
        heading: 'How Staff Accept an Invitation',
        content: (
          <div className="space-y-4">
            <p>After you click <strong>Send Invite</strong>, the staff member receives an email with subject: <strong>"You've been invited to join [Your Clinic Name]"</strong>.</p>
            <p>They follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the invitation email and click <strong>Accept Invitation</strong>.</li><li>They are taken to a page to set their <strong>password</strong>.</li><li>After setting the password, they can log in at <strong>app.clerixs.com</strong> with their email and new password.</li><li>On first login, they land on the dashboard with access matching their assigned role.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> The invitation link expires after <strong>48 hours</strong>. If the staff member does not activate their account within 48 hours, you need to send a new invitation from the Staff page.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'staff-plan-limits',
        heading: 'Staff Plan Limits',
        content: (
          <div className="space-y-4">
            <p>The number of staff you can invite depends on your subscription plan:</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Plan</th><th className="px-6 py-3">Maximum staff (including Owner)</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Basic</strong></td><td className="px-6 py-3.5">2</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Pro</strong></td><td className="px-6 py-3.5">5</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Enterprise</strong></td><td className="px-6 py-3.5">Unlimited</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> If you reach your staff limit, the <strong>Invite Member</strong> button will be disabled and you will see a prompt to upgrade your plan. Go to <strong>Settings → Subscription</strong> to upgrade. See <a href="11-subscription.md" className="text-blue-600 hover:underline font-semibold">Subscription & Billing</a>.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'editing-a-staff-members-role',
        heading: 'Editing a Staff Member\'s Role',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Staff</strong> in the sidebar.</li><li>Find the staff member in the list.</li><li>Click <strong>Open menu (⋮)</strong> next to their name.</li><li>Select <strong>Edit Role</strong>.</li><li>Choose the new role from the dropdown.</li><li>Save the change.</li></ol>
            <p>The role change takes effect immediately — the staff member sees the updated permissions on their next page load.</p>
          </div>
        )
      },
      {
        id: 'deactivating-a-staff-member',
        heading: 'Deactivating a Staff Member',
        content: (
          <div className="space-y-4">
            <p>When a staff member leaves your clinic or should no longer have access:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Staff</strong> in the sidebar.</li><li>Click <strong>Open menu (⋮)</strong> next to their name.</li><li>Select <strong>Deactivate</strong>.</li><li>Confirm the action.</li></ol>
            <p>The deactivated staff member <strong>cannot log in</strong> anymore. Their historical records (prescriptions written, lab results entered, etc.) are preserved — only their login access is removed.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Deactivation is reversible — you can reactivate a staff member later if needed. However, a deactivated account still counts against your staff plan limit until permanently removed.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Inviting with the wrong role</td><td className="px-6 py-3.5">Double-check the role before clicking Send Invite</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not warning staff to check Spam</td><td className="px-6 py-3.5">Tell every new staff member to check Spam for the invitation email</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Giving a receptionist the Doctor role</td><td className="px-6 py-3.5">Assign roles correctly — receptionists do not need clinical access</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Forgetting to deactivate a staff member who has left</td><td className="px-6 py-3.5">Deactivate immediately when someone leaves to protect patient data</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Hitting the staff limit without realising</td><td className="px-6 py-3.5">Check your plan's staff limit in Settings before inviting new team members</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="07-billing.md" className="text-blue-600 hover:underline font-semibold">07 — Billing & Invoices</a> | Next: <a href="09-reports.md" className="text-blue-600 hover:underline font-semibold">09 — Reports & Analytics</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'reports',
    title: '9. Reports & Analytics',
    desc: "",
    sections: [
      {
        id: 'what-is-the-reports-section',
        heading: 'What Is the Reports Section?',
        content: (
          <div className="space-y-4">
            <p><strong>Reports</strong> gives you charts and tables showing how your clinic is performing — revenue collected, patients registered, appointments completed, and more. Use reports to track growth and spot trends.</p>
            <p>Click <strong>Reports</strong> in the left sidebar to open the reports dashboard.</p>
            <MockBasicReportsScreenshot />
            <p>Clerixs has two levels of reports:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>Basic Reports</strong> — available on all plans.</li><li><strong>Advanced Reports</strong> — available on <strong>Pro and Enterprise plans only</strong>.</li></ul>
          </div>
        )
      },
      {
        id: 'basic-reports',
        heading: 'Basic Reports',
        content: (
          <div className="space-y-4">
            <p>Basic Reports give you the essential numbers for day-to-day clinic management.</p>
            <DocScreenshot src="/assets/Basic-Reports.png" alt="Basic Reports" url="app.clerixs.com/reports" />
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Report</th><th className="px-6 py-3">What it shows</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Revenue</strong></td><td className="px-6 py-3.5">Total billing collected over your selected date range. Shows as a bar or line chart</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patients</strong></td><td className="px-6 py-3.5">New patients registered over time — useful for tracking clinic growth</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Appointments</strong></td><td className="px-6 py-3.5">Appointments by status: how many were Completed vs Cancelled</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Top Treatments</strong></td><td className="px-6 py-3.5">Which treatments are billed most frequently — helps you see your clinic's most common procedures</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'advanced-reports-pro-plan',
        heading: 'Advanced Reports (Pro Plan)',
        content: (
          <div className="space-y-4">
            <p>Advanced Reports give you deeper business insights.</p>
            <DocScreenshot src="/assets/Advanced-Reports.png" alt="Advanced Reports" url="app.clerixs.com/reports?tab=advanced" />
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Report</th><th className="px-6 py-3">What it shows</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Revenue by Doctor</strong></td><td className="px-6 py-3.5">Breakdown of revenue generated per individual doctor. Useful for multi-doctor clinics</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Revenue Trends</strong></td><td className="px-6 py-3.5">Month-on-month comparison — see if your clinic is growing or declining</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Outstanding Payments</strong></td><td className="px-6 py-3.5">All invoices that are Issued or Partially Paid with the unpaid balance — your accounts receivable</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patient Retention</strong></td><td className="px-6 py-3.5">Ratio of new patients vs returning patients over the selected period</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Advanced Reports are not visible on the Basic plan. If you see a lock icon, your plan does not include this feature. Go to <strong>Settings → Subscription</strong> to upgrade to Pro.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'using-the-date-range-filter',
        heading: 'Using the Date Range Filter',
        content: (
          <div className="space-y-4">
            <p>All reports support custom date ranges.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>On the Reports page, click the <strong>Date Range</strong> picker (top of the page).</li><li>Select a preset period:</li></ol>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>Today</strong></li><li><strong>This Week</strong></li><li><strong>This Month</strong></li><li><strong>Last 30 Days</strong></li></ul>
            <p>— OR —</p>
            <p>Click <strong>Custom Range</strong> and pick a start date and end date.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>All charts and tables update immediately.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">At the end of each month, set the date range to that month and export a report for your records. This is much faster than manual accounting.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'exporting-reports-pro-plan',
        heading: 'Exporting Reports (Pro Plan)',
        content: (
          <div className="space-y-4">
            <p>Pro and Enterprise plans can export any report as a PDF or Excel file.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Set your date range and select the report you want.</li><li>Click <strong>Export</strong> (top right of the report section).</li><li>Choose:</li></ol>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>PDF</strong> — for printing and sharing with your accountant.</li><li><strong>Excel</strong> — for further analysis in a spreadsheet.</li></ul>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>The file downloads to your device immediately.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> The Export button is not available on the Basic plan.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'understanding-the-revenue-report',
        heading: 'Understanding the Revenue Report',
        content: (
          <div className="space-y-4">
            <p>The <strong>Revenue</strong> chart shows total billing <strong>collected</strong> (i.e., payments recorded), not just invoices issued. Only invoices with status <strong>Paid</strong> or <strong>Partially Paid</strong> contribute to the revenue figure.</p>
            <p>If you issue an invoice but do not record a payment, it appears in <strong>Outstanding Payments</strong> instead.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Check the Outstanding Payments report weekly. Follow up with patients who have a pending balance. A short SMS or call at the right time significantly improves collections.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Confusing issued invoices with collected revenue</td><td className="px-6 py-3.5">Revenue = payments received. Always record payments against invoices</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not using the date range filter</td><td className="px-6 py-3.5">Always set a date range — default view may not show the period you want</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Expecting Advanced Reports on the Basic plan</td><td className="px-6 py-3.5">Upgrade to Pro to unlock Revenue by Doctor, Outstanding Payments, and Trends</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not exporting monthly reports</td><td className="px-6 py-3.5">Export and save a monthly report — useful for tax filing and accountant reviews</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="08-staff.md" className="text-blue-600 hover:underline font-semibold">08 — Staff Management</a> | Next: <a href="10-settings.md" className="text-blue-600 hover:underline font-semibold">10 — Settings</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'settings',
    title: '10. Settings',
    desc: "",
    sections: [
      {
        id: 'opening-settings',
        heading: 'Opening Settings',
        content: (
          <div className="space-y-4">
            <p>Click <strong>Settings</strong> in the left sidebar to open the settings page.</p>
            <p>Settings is divided into several sections — scroll down to see all of them.</p>
            <DocScreenshot src="/assets/Opening Settings.png" alt="Opening Settings" url="app.clerixs.com/settings" />
          </div>
        )
      },
      {
        id: 'my-profile',
        heading: 'My Profile',
        content: (
          <div className="space-y-4">
            <p>The <strong>My Profile</strong> section is where you update your personal name, phone, and password.</p>
            <DocScreenshot src="/assets/My-Profile.png" alt="My Profile Settings" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>In the <strong>full_name</strong> field (placeholder: <em>Your Name</em>), update your display name.</li><li>In the <strong>phone</strong> field (placeholder: <em>e.g. +91 9876543210</em>), add or update your mobile number.</li><li>To change your password, enter your new password in <strong>new_password</strong> and repeat it in <strong>confirm_password</strong>.</li><li>Click <strong>Save Changes</strong>.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Your display name appears in the greeting on the dashboard (<em>Good morning, [Name]!</em>) and on all prescriptions you generate. Use your full professional name.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'clinic-settings',
        heading: 'Clinic Settings',
        content: (
          <div className="space-y-4">
            <p><strong>Clinic Settings</strong> controls how your clinic appears on all printed documents — prescriptions, invoices, and lab reports.</p>
            <DocScreenshot src="/assets/Clinic-Settings.png" alt="Clinic Settings" />
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Setting</th><th className="px-6 py-3">What it does</th><th className="px-6 py-3">Where it appears</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Clinic Name</strong></td><td className="px-6 py-3.5">Your clinic's official name</td><td className="px-6 py-3.5">All prescriptions, invoices, and lab reports</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Clinic Logo</strong></td><td className="px-6 py-3.5">PNG/JPG logo image</td><td className="px-6 py-3.5">Invoices and reports (alongside the name)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Digital Signature</strong></td><td className="px-6 py-3.5">Doctor's signature image</td><td className="px-6 py-3.5">Bottom of prescription PDFs under <em>Authorised Signature</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Clinic Letterhead</strong></td><td className="px-6 py-3.5">Wide banner image (recommended 1200×300 px)</td><td className="px-6 py-3.5">Top of every prescription PDF</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Default Currency</strong></td><td className="px-6 py-3.5">₹ INR (pre-set for India)</td><td className="px-6 py-3.5">All invoices and billing displays</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Default Timezone</strong></td><td className="px-6 py-3.5">Asia/Kolkata IST (pre-set)</td><td className="px-6 py-3.5">Appointment times and report timestamps</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>GST Number</strong></td><td className="px-6 py-3.5">Your clinic's GSTIN</td><td className="px-6 py-3.5">Tax invoices</td></tr>
    </tbody>
  </table>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Uploading a New Letterhead</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>In <strong>Clinic Settings</strong>, find the <strong>Clinic Letterhead</strong> row.</li><li>Click <strong>Upload</strong> or the current letterhead image area.</li><li>Select a PNG or JPG file. Best size: <strong>1200 × 300 pixels</strong>.</li><li>Click <strong>Save</strong>.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">The letterhead image should include your clinic name, address, phone, and logo within the image itself. Clerixs places it as-is at the top of every prescription.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Uploading a Digital Signature</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Find the <strong>Digital Signature</strong> row in Clinic Settings.</li><li>Click <strong>Upload</strong>.</li><li>Select a PNG image — transparent background works best so the signature looks clean on white paper.</li><li>Click <strong>Save</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> This signature applies to all prescriptions from your clinic. Individual doctors should upload their own signature from their personal profile page if your clinic has multiple doctors.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Adding Your GST Number</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Find the <strong>GST Number</strong> field.</li><li>Enter your 15-character GSTIN (e.g., <em>27AAAAA0000A1Z5</em>).</li><li>Click <strong>Save</strong>.</li></ol>
            <p>Once your GSTIN is saved, it appears on all issued invoices automatically.</p>
          </div>
        )
      },
      {
        id: 'price-catalog',
        heading: 'Price Catalog',
        content: (
          <div className="space-y-4">
            <p>The <strong>Price Catalog</strong> is your clinic's list of treatments and services — with prices. These items appear in the <strong>Billing</strong> section when you create an invoice.</p>
            <DocScreenshot src="/assets/Price Catalog.png" alt="Price Catalog Settings" />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Adding a Treatment or Service</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Scroll to <strong>Price Catalog</strong> in Settings.</li><li>Click <strong>Add Item</strong>.</li><li>Fill in:</li></ol>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Item Name</strong></td><td className="px-6 py-3.5">e.g., <em>Consultation</em>, <em>Full Mouth X-Ray</em>, <em>Root Canal (Single)</em>, <em>Blood Test — CBC</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Price (₹)</strong></td><td className="px-6 py-3.5">The standard price in rupees</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>GST Applicable</strong></td><td className="px-6 py-3.5">Toggle on if this item attracts GST. Off for most medical consultations</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Category</strong></td><td className="px-6 py-3.5">Optional grouping label (e.g., <em>Consultation</em>, <em>Diagnostics</em>, <em>Procedures</em>)</td></tr>
    </tbody>
  </table>
</div>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Save</strong>.</li></ol>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Editing a Price</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Find the item in the Price Catalog list.</li><li>Click the <strong>edit icon</strong> (pencil) next to it.</li><li>Update the name or price.</li><li>Click <strong>Save</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Editing a price in the catalog does <strong>not</strong> change any past invoices. It only affects new invoices created after the change.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Removing an Item</h4>
            <p>Click the <strong>delete icon</strong> (trash bin) next to an item to remove it. It will no longer appear in invoice item searches.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Deleting a catalog item does not affect old invoices that already used it — those remain intact.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Set up your complete Price Catalog before you start billing. It makes invoice creation much faster — instead of typing treatment names and prices manually each time, you just search and click.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'lab-catalog',
        heading: 'Lab Catalog',
        content: (
          <div className="space-y-4">
            <p>The <strong>Lab Catalog</strong> is your clinic's list of diagnostic tests. These tests appear when doctors create lab orders.</p>
            <DocScreenshot src="/assets/Lab Catalog.png" alt="Lab Catalog Settings" />
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Adding a Custom Test</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Scroll to <strong>Lab Catalog</strong> in Settings.</li><li>Click <strong>Add Test</strong>.</li><li>Fill in:</li></ol>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Field</th><th className="px-6 py-3">What to enter</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Test Name</strong></td><td className="px-6 py-3.5">e.g., <em>Complete Blood Count</em>, <em>HbA1c</em>, <em>Fasting Blood Glucose</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Category</strong></td><td className="px-6 py-3.5">e.g., <em>Haematology</em>, <em>Biochemistry</em>, <em>Endocrinology</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Normal Range</strong></td><td className="px-6 py-3.5">e.g., <em>4.0 – 5.6%</em> or <em>70 – 100 mg/dL</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Unit</strong></td><td className="px-6 py-3.5">e.g., <em>%</em>, <em>mg/dL</em>, <em>cells/μL</em>, <em>IU/L</em></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Price (₹)</strong></td><td className="px-6 py-3.5">Standard price for this test</td></tr>
    </tbody>
  </table>
</div>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Save</strong>.</li></ol>
            <p>The test is now available in all lab order forms.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Creating Test Packages</h4>
            <p>A <strong>Package</strong> groups multiple tests under one name and one price — for example, a <em>Diabetic Panel</em> = HbA1c + Fasting Glucose + Lipid Profile.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>In Lab Catalog, click <strong>Packages</strong> (or <strong>New Package</strong>).</li><li>Enter a package name (e.g., <em>Diabetic Panel</em>, <em>Thyroid Full Profile</em>).</li><li>Add tests from your catalog to the package.</li><li>Set a combined price.</li><li>Click <strong>Save Package</strong>.</li></ol>
            <p>The package appears as a single selectable item when doctors create lab orders.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Create packages for your clinic's most common test combinations. It reduces the time doctors spend clicking individual tests for each order.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'prescription-templates',
        heading: 'Prescription Templates',
        content: (
          <div className="space-y-4">
            <p>The <strong>Prescription Templates</strong> section shows all saved prescription templates your clinic has created.</p>
            <DocScreenshot src="/assets/Prescription Templates.png" alt="Prescription Templates Settings" />
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Action</th><th className="px-6 py-3">How to do it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>View a template</strong></td><td className="px-6 py-3.5">Click the template name</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Edit a template</strong></td><td className="px-6 py-3.5">Click <strong>Edit</strong> — update medicines, dosage, or advice, then save</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Delete a template</strong></td><td className="px-6 py-3.5">Click <strong>Delete</strong> — the template is permanently removed</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Deleting a template does not delete any prescriptions that were already generated using it. Only the reusable template is removed.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Templates can also be created directly while writing a prescription — click <strong>Save as Template</strong> during prescription creation. You do not need to build them in Settings manually.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Not setting up Price Catalog before billing</td><td className="px-6 py-3.5">Set it up on day one — billing is much harder without it</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Uploading a letterhead in the wrong size</td><td className="px-6 py-3.5">Use 1200×300 px — other sizes may look stretched or cropped on prescription PDFs</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Forgetting to save your GST number</td><td className="px-6 py-3.5">Invoices will not show GSTIN until it is saved — required for GST-compliant billing</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Deleting a Price Catalog item and wondering why it disappeared from billing search</td><td className="px-6 py-3.5">Deleted items are gone from the catalog — re-add them if needed</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="09-reports.md" className="text-blue-600 hover:underline font-semibold">09 — Reports & Analytics</a> | Next: <a href="11-subscription.md" className="text-blue-600 hover:underline font-semibold">11 — Subscription & Billing</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'subscription',
    title: '11. Subscription & Billing',
    desc: "",
    sections: [
      {
        id: 'plans-overview',
        heading: 'Plans Overview',
        content: (
          <div className="space-y-4">
            <p>Clerixs offers three subscription tiers. Choose the plan that matches your clinic size.</p>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Feature</th><th className="px-6 py-3">Basic</th><th className="px-6 py-3">Pro</th><th className="px-6 py-3">Enterprise</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Monthly Price</strong></td><td className="px-6 py-3.5">₹999 / month</td><td className="px-6 py-3.5">₹1,999 / month</td><td className="px-6 py-3.5">Contact sales</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Staff members</strong></td><td className="px-6 py-3.5">2 (including owner)</td><td className="px-6 py-3.5">5 (including owner)</td><td className="px-6 py-3.5">Unlimited</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Patients</strong></td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Prescriptions</strong></td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Invoices</strong></td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Lab Orders</strong></td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td><td className="px-6 py-3.5">Unlimited</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Advanced Reports</strong></td><td className="px-6 py-3.5">❌</td><td className="px-6 py-3.5">✅</td><td className="px-6 py-3.5">✅</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Export Reports (PDF/Excel)</strong></td><td className="px-6 py-3.5">❌</td><td className="px-6 py-3.5">✅</td><td className="px-6 py-3.5">✅</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Branches / Locations</strong></td><td className="px-6 py-3.5">1</td><td className="px-6 py-3.5">1</td><td className="px-6 py-3.5">Multiple</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Storage</strong></td><td className="px-6 py-3.5">5 GB</td><td className="px-6 py-3.5">10 GB</td><td className="px-6 py-3.5">Custom</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Priority Support</strong></td><td className="px-6 py-3.5">❌</td><td className="px-6 py-3.5">✅</td><td className="px-6 py-3.5">✅</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>WhatsApp Credits</strong></td><td className="px-6 py-3.5">Included</td><td className="px-6 py-3.5">Included</td><td className="px-6 py-3.5">Included</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'the-7-day-free-trial',
        heading: 'The 7-Day Free Trial',
        content: (
          <div className="space-y-4">
            <p>Every new Clerixs account starts with a <strong>free 7-day Pro trial</strong>. You can use every Pro feature during the trial — no credit card required.</p>
            <p><strong>How the trial works:</strong></p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Day 1–7: Full Pro access.</li><li>Day 5: Clerixs sends a reminder email.</li><li>Day 7 (end of trial): If you have not subscribed, your account moves to read-only mode. You can view existing records but cannot add new patients, appointments, prescriptions, or invoices.</li></ul>
            <p>Your data is <strong>never deleted</strong> when a trial expires. Subscribe at any time to regain full access.</p>
          </div>
        )
      },
      {
        id: 'how-to-upgrade-your-plan',
        heading: 'How to Upgrade Your Plan',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Settings</strong> in the left sidebar.</li><li>Scroll to the <strong>Subscription</strong> section — OR — click <strong>Pro</strong> in the left sidebar (the badge showing your trial or plan status).</li><li>Click <strong>Upgrade Plan</strong>.</li><li>Select <strong>Basic</strong> or <strong>Pro</strong>.</li><li>Enter your payment details (debit/credit card or UPI).</li><li>Click <strong>Confirm Payment</strong>.</li></ol>
            <p>Your plan activates immediately after successful payment.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Annual billing is available and gives you approximately 2 months free compared to paying monthly. Look for the <strong>Annual</strong> toggle on the upgrade page.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'storage-usage',
        heading: 'Storage Usage',
        content: (
          <div className="space-y-4">
            <p>Clerixs counts storage used by uploaded files — clinic logo, letterhead, digital signatures, prescription PDFs, lab reports, and external uploaded documents.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li><strong>Basic plan</strong>: 5 GB total.</li><li><strong>Pro plan</strong>: 10 GB total.</li></ul>
            <p>Your current usage appears in the <strong>left sidebar</strong> at the bottom — for example: <em>USED: 0.4 GB / TOTAL: 10 GB</em>.</p>
            <p>When you approach your storage limit, Clerixs sends a warning email. You can free up space by deleting old uploaded files, or upgrade your plan for more storage.</p>
          </div>
        )
      },
      {
        id: 'viewing-your-billing-history',
        heading: 'Viewing Your Billing History',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings → Subscription</strong>.</li><li>Scroll to <strong>Billing History</strong>.</li><li>All past subscription payments are listed — date, plan, amount.</li><li>Click <strong>Download Invoice</strong> next to any payment to get a GST-compliant receipt for your accounts.</li></ol>
          </div>
        )
      },
      {
        id: 'cancelling-your-subscription',
        heading: 'Cancelling Your Subscription',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings → Subscription</strong>.</li><li>Click <strong>Cancel Subscription</strong>.</li><li>Confirm the cancellation.</li></ol>
            <p><strong>What happens after cancellation:</strong></p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>You retain full access until the <strong>end of your current paid period</strong>.</li><li>After the period ends, your account switches to <strong>read-only mode</strong> — you can view existing data but not add new records.</li><li>Your data is retained for <strong>90 days</strong> after cancellation.</li><li>You can reactivate at any time by subscribing again.</li></ul>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> After 90 days of non-renewal, your data is permanently deleted. Export your patient list and important records before the 90-day window closes.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'auto-renewal',
        heading: 'Auto-Renewal',
        content: (
          <div className="space-y-4">
            <p>Your subscription renews automatically on the same date each month (or year, for annual plans). Clerixs charges your saved payment method and sends a receipt to your registered email.</p>
            <p><strong>To stop auto-renewal:</strong> Cancel your subscription (steps above). You keep access until the end of the paid period.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Update your payment details before they expire — if the auto-renewal charge fails, your account may switch to read-only mode until payment is completed.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-to-reactivate-after-trial-expiry',
        heading: 'How to Reactivate After Trial Expiry',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Log in to <strong>app.clerixs.com</strong> with your credentials.</li><li>You will see a <strong>subscription required</strong> banner.</li><li>Click <strong>Upgrade Now</strong> and choose a plan.</li><li>Complete payment — your account is fully restored immediately.</li></ol>
            <p>All your data — patients, appointments, prescriptions, invoices — is exactly as you left it.</p>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Not subscribing before the trial ends</td><td className="px-6 py-3.5">Subscribe on day 5 or 6 — do not wait until the last minute</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Letting payment details expire</td><td className="px-6 py-3.5">Update your card details in Subscription settings before expiry</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Waiting too long after cancellation to export data</td><td className="px-6 py-3.5">Export important records immediately after cancelling, not after 90 days</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not downloading monthly receipts</td><td className="px-6 py-3.5">Download and save receipts regularly for GST input credit claims</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="10-settings.md" className="text-blue-600 hover:underline font-semibold">10 — Settings</a> | Next: <a href="12-whatsapp.md" className="text-blue-600 hover:underline font-semibold">12 — WhatsApp Integration</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'whatsapp',
    title: '12. WhatsApp Integration',
    desc: "",
    sections: [
      {
        id: 'what-does-the-whatsapp-integration-do',
        heading: 'What Does the WhatsApp Integration Do?',
        content: (
          <div className="space-y-4">
            <p>Clerixs's WhatsApp integration lets you send a patient's prescription PDF directly to their WhatsApp number in one click. The patient receives a message with a link to view and download their prescription — no app installation needed on the clinic's side.</p>
            <p>This feature is used directly from the patient's Prescriptions tab. You do not need to open WhatsApp on your phone or desktop — Clerixs handles the sending automatically.</p>
          </div>
        )
      },
      {
        id: 'sending-a-prescription-via-whatsapp',
        heading: 'Sending a Prescription via WhatsApp',
        content: (
          <div className="space-y-4">
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click the <strong>Prescriptions</strong> tab.</li><li>Find the prescription you want to send.</li><li>Click the <strong>WhatsApp</strong> icon (WhatsApp logo button) next to that prescription.</li></ol>
            <DocScreenshot src="/assets/Sending a Prescription via WhatsApp.png" alt="Sending Prescription via WhatsApp" />
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>A dialog appears showing the patient's saved phone number.</li><li>Verify the number is correct.</li><li>Click <strong>Send via WhatsApp</strong>.</li></ol>
            <p>The patient receives a WhatsApp message within seconds. It contains a secure link to view and download their prescription PDF.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> The WhatsApp message is sent to the phone number saved in the patient's profile. If the patient's number is incorrect or outdated, the message will go to the wrong person. Always keep patient phone numbers up to date.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">If a patient changes their number, update it in their profile (<strong>Edit Patient</strong>) before sending any WhatsApp messages.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'whatsapp-credits',
        heading: 'WhatsApp Credits',
        content: (
          <div className="space-y-4">
            <p>Sending WhatsApp messages uses <strong>WhatsApp Credits</strong>. Each credit = one message sent.</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Your remaining credits are shown in the <strong>left sidebar</strong> under the storage usage indicator.</li><li>Both Basic and Pro plans come with a starting credit allocation.</li><li>Credits do not expire.</li></ul>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">What Happens When Credits Run Out?</h4>
            <p>When your credit balance reaches zero, the WhatsApp send button is disabled. You will see a prompt to purchase more credits.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Buying More Credits</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings</strong> in the left sidebar.</li><li>Find the <strong>WhatsApp Credits</strong> section.</li><li>Click <strong>Buy Credits</strong> and select a credit pack.</li><li>Complete payment.</li></ol>
            <p>Credits are added to your account immediately.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Buy credits in advance — do not wait until they run out. Running out mid-day means you cannot send prescriptions to patients who need them right away.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'viewing-whatsapp-message-history',
        heading: 'Viewing WhatsApp Message History',
        content: (
          <div className="space-y-4">
            <p>Click <strong>WhatsApp</strong> in the left sidebar to see a log of all WhatsApp messages sent from your clinic — date, patient, message type, and delivery status.</p>
            <DocScreenshot src="/assets/Viewing WhatsApp Message History.png" alt="Viewing WhatsApp Message History" />
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Patient not receiving the message</td><td className="px-6 py-3.5">Check that their phone number is saved with country code (+91 XXXXXXXXXX)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Sending to an old number</td><td className="px-6 py-3.5">Update the patient profile with the new number before sending</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Waiting until credits are zero</td><td className="px-6 py-3.5">Top up credits proactively — check the balance in the sidebar weekly</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Sending the wrong prescription</td><td className="px-6 py-3.5">Verify the prescription date and Rx number before clicking Send</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="11-subscription.md" className="text-blue-600 hover:underline font-semibold">11 — Subscription & Billing</a> | Next: <a href="13-branches.md" className="text-blue-600 hover:underline font-semibold">13 — Branches</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'branches',
    title: '13. Branches',
    desc: "",
    sections: [
      {
        id: 'what-are-branches',
        heading: 'What Are Branches?',
        content: (
          <div className="space-y-4">
            <p><strong>Branches</strong> let you run multiple clinic locations — each with its own staff, patients, appointments, and billing — from a single Clerixs account. Each branch has its own separate data. Staff at Branch A cannot see Branch B's patients.</p>
            <p>Your first location is created automatically and called <strong>Headquarters</strong> by default.</p>
            <p>The <strong>Branches</strong> section is visible in the left sidebar to clinic owners. However, the ability to create and activate additional branches is controlled by the Clerixs admin team — you cannot add a new branch on your own without admin approval.</p>
          </div>
        )
      },
      {
        id: 'how-to-get-a-new-branch-set-up',
        heading: 'How to Get a New Branch Set Up',
        content: (
          <div className="space-y-4">
            <p>Branch credentials are activated by Clerixs from the admin panel. To request a new branch:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Email <strong>support@clerixs.com</strong> from your registered owner email.</li><li>Include:</li></ol>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>The name of the new branch (e.g., <em>Koramangala Clinic</em>, <em>HSR Layout Branch</em>)</li><li>The full address of the new location</li><li>The name of the doctor or manager who will run it</li></ul>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>The Clerixs team activates the branch in the admin panel.</li><li>You receive a confirmation email when the branch is live.</li></ol>
            <p>After activation, the branch appears in your branch selector dropdown and in the <strong>Branches</strong> list page.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Do not attempt to create a branch without admin activation. The branch will appear in the list but will not have functioning credentials or staff login access until the admin panel enables it.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'switching-between-branches',
        heading: 'Switching Between Branches',
        content: (
          <div className="space-y-4">
            <p>Once your branch is activated, a <strong>branch selector dropdown</strong> appears at the top of the left sidebar (visible to clinic owners only).</p>
            <DocScreenshot src="/assets/Switching Between Branches.png" alt="Switching Between Branches" />
            <p>To switch branches:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click the branch selector at the top of the sidebar.</li><li>Choose from the list:</li></ol>
            <ul className="list-disc pl-6 space-y-2 text-slate-600"><li>Select a specific branch to see only that location's data.</li><li>Select <strong>All Branches</strong> to see combined data across all locations.</li></ul>
            <p>The entire app — patients, appointments, queue, billing, reports — switches to the selected branch immediately.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Staff members do not see the branch selector. They always see only their assigned branch. The dropdown is visible to clinic owners only.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'assigning-staff-to-a-branch',
        heading: 'Assigning Staff to a Branch',
        content: (
          <div className="space-y-4">
            <p>Each staff member is assigned a <strong>Primary Branch</strong> when you invite them. They can only see data from their assigned branch.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Click <strong>Staff</strong> in the left sidebar.</li><li>Click <strong>Invite Member</strong>.</li><li>In the <strong>Primary Branch</strong> dropdown, select the branch this staff member will work at.</li><li>Complete the invitation and click <strong>Send Invite</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> If a staff member is assigned to the wrong branch, they will not see the correct patients or appointments. Go to <strong>Staff</strong> → click <strong>Open menu (⋮)</strong> next to their name → <strong>Edit Role</strong> to fix the branch assignment.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-data-is-separated-between-branches',
        heading: 'How Data Is Separated Between Branches',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Data type</th><th className="px-6 py-3">Separate or shared?</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Patients</td><td className="px-6 py-3.5">Separate per branch</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Appointments</td><td className="px-6 py-3.5">Separate per branch</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Prescriptions</td><td className="px-6 py-3.5">Separate per branch</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Invoices & billing</td><td className="px-6 py-3.5">Separate per branch</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Lab orders</td><td className="px-6 py-3.5">Separate per branch</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Staff</td><td className="px-6 py-3.5">Assigned to one branch</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Settings (Clinic name, logo, letterhead)</td><td className="px-6 py-3.5">Shared across all branches</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Price Catalog</td><td className="px-6 py-3.5">Shared across all branches</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Lab Catalog</td><td className="px-6 py-3.5">Shared across all branches</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">WhatsApp Credits</td><td className="px-6 py-3.5">Shared pool across all branches</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">If the same patient visits two branches, they must be registered separately at each location. Patient records do not transfer automatically between branches.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'reports-across-branches',
        heading: 'Reports Across Branches',
        content: (
          <div className="space-y-4">
            <p>When <strong>All Branches</strong> is selected in the branch selector, the <strong>Reports</strong> section shows combined data for all locations.</p>
            <p>To see data for one specific branch, select that branch before opening Reports.</p>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Trying to create a branch without admin activation</td><td className="px-6 py-3.5">Contact support@clerixs.com first — branches must be activated by the Clerixs team</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Inviting staff to the wrong branch</td><td className="px-6 py-3.5">Double-check the Primary Branch dropdown before clicking Send Invite</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Expecting patients to be shared across branches</td><td className="px-6 py-3.5">Register the patient at each branch they visit</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Viewing reports without selecting the right branch</td><td className="px-6 py-3.5">Confirm your active branch (top of sidebar) before pulling any report</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="12-whatsapp.md" className="text-blue-600 hover:underline font-semibold">12 — WhatsApp Integration</a> | Next: <a href="14-shortcuts.md" className="text-blue-600 hover:underline font-semibold">14 — Keyboard Shortcuts</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'shortcuts',
    title: '14. Keyboard Shortcuts',
    desc: "",
    sections: [
      {
        id: 'what-are-keyboard-shortcuts',
        heading: 'What Are Keyboard Shortcuts?',
        content: (
          <div className="space-y-4">
            <p>Keyboard shortcuts let you open features, save forms, and navigate Clerixs without using your mouse. Learning even a few shortcuts saves significant time during a busy clinic day.</p>
            <p>Clerixs supports shortcuts on both Windows/Linux (using <strong>Ctrl</strong>) and Mac (using <strong>Cmd ⌘</strong>).</p>
          </div>
        )
      },
      {
        id: 'viewing-all-shortcuts-inside-the-app',
        heading: 'Viewing All Shortcuts Inside the App',
        content: (
          <div className="space-y-4">
            <p>Click <strong>⌨️ Shortcuts ⌘/</strong> at the bottom of the left sidebar to open the keyboard shortcuts overlay at any time.</p>
            <DocScreenshot src="/assets/bottom-Shortcuts.png" alt="Shortcuts link" />
            <DocScreenshot src="/assets/All Shortcuts.png" alt="All Shortcuts" />
            <p>The overlay lists every available shortcut grouped by category. Press <strong>Escape</strong> to close it.</p>
          </div>
        )
      },
      {
        id: 'complete-shortcut-reference',
        heading: 'Complete Shortcut Reference',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Navigation</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Shortcut (Windows)</th><th className="px-6 py-3">Shortcut (Mac)</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Ctrl + K</strong></td><td className="px-6 py-3.5"><strong>⌘ + K</strong></td><td className="px-6 py-3.5">Open Global Search — find any patient, appointment, or prescription instantly</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Ctrl + /</strong></td><td className="px-6 py-3.5"><strong>⌘ + /</strong></td><td className="px-6 py-3.5">Open the keyboard shortcuts overlay</td></tr>
    </tbody>
  </table>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Creating Records</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Shortcut (Windows)</th><th className="px-6 py-3">Shortcut (Mac)</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Ctrl + N</strong></td><td className="px-6 py-3.5"><strong>⌘ + N</strong></td><td className="px-6 py-3.5">Create a new record — opens the relevant "Add" dialog based on which page you are on</td></tr>
    </tbody>
  </table>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Forms and Dialogs</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Shortcut (Windows)</th><th className="px-6 py-3">Shortcut (Mac)</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Ctrl + S</strong></td><td className="px-6 py-3.5"><strong>⌘ + S</strong></td><td className="px-6 py-3.5">Save the current form or draft</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Ctrl + P</strong></td><td className="px-6 py-3.5"><strong>⌘ + P</strong></td><td className="px-6 py-3.5">Print PDF / Report (triggers the print button on the current page)</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Escape</strong></td><td className="px-6 py-3.5"><strong>Escape</strong></td><td className="px-6 py-3.5">Close the current modal or dialog without saving</td></tr>
    </tbody>
  </table>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Prescription — Voice to Text</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Shortcut (Windows)</th><th className="px-6 py-3">Shortcut (Mac)</th><th className="px-6 py-3">What it does</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Hold Ctrl + Shift</strong></td><td className="px-6 py-3.5"><strong>Hold ⌘ + Shift</strong></td><td className="px-6 py-3.5">Activate voice-to-text input while writing a prescription. Hold to speak, release to insert text</td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'how-to-use-global-search-ctrl-k-k',
        heading: 'How to Use Global Search (Ctrl + K / ⌘ + K)',
        content: (
          <div className="space-y-4">
            <p>Global Search is the fastest way to navigate Clerixs.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Press <strong>Ctrl + K</strong> (Windows) or <strong>⌘ + K</strong> (Mac) from anywhere in the app.</li><li>A search bar appears in the centre of the screen.</li><li>Start typing a patient name, appointment, or feature name.</li><li>Results appear instantly as you type.</li><li>Use the <strong>↑ ↓ arrow keys</strong> to move between results.</li><li>Press <strong>Enter</strong> to open the selected result.</li><li>Press <strong>Escape</strong> to close Global Search without navigating.</li></ol>
            <DocScreenshot src="/assets/Global Search (Ctrl + K : ⌘ + K).png" alt="Global Search" />
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Use Global Search instead of clicking the sidebar every time. Typing a patient's first name and pressing Enter is much faster than clicking Patients → searching → clicking the patient row.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'how-to-use-voice-to-text-in-prescriptions',
        heading: 'How to Use Voice-to-Text in Prescriptions',
        content: (
          <div className="space-y-4">
            <p>Voice-to-text is available in the prescription editor — useful when typing medicine instructions or advice quickly.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open a prescription (any patient → <strong>Prescriptions</strong> tab → create or edit).</li><li>Click inside a text field (e.g., the <strong>GENERAL ADVICE / NEXT STEPS</strong> area).</li><li>Hold <strong>Ctrl + Shift</strong> (Windows) or <strong>⌘ + Shift</strong> (Mac).</li><li>Speak clearly into your microphone.</li><li>Release the keys — your spoken text is inserted into the field.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Voice-to-text requires your browser to have microphone access. If nothing happens when you hold the shortcut, check that Clerixs has microphone permission in your browser settings.</p>
  </div>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Voice-to-text works best for dictating free-text areas like advice and diagnosis notes. For medicine names, use the <strong>Search medicine...</strong> autocomplete field — it is faster and avoids spelling errors.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'shortcut-tips-for-receptionists',
        heading: 'Shortcut Tips for Receptionists',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Task</th><th className="px-6 py-3">Shortcut to use</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Find a patient quickly</td><td className="px-6 py-3.5"><strong>Ctrl + K</strong> → type name</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Add a new appointment</td><td className="px-6 py-3.5"><strong>Ctrl + K</strong> → type patient → open profile, then <strong>Ctrl + N</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Close a popup that appeared by mistake</td><td className="px-6 py-3.5"><strong>Escape</strong></td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'shortcut-tips-for-doctors',
        heading: 'Shortcut Tips for Doctors',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Task</th><th className="px-6 py-3">Shortcut to use</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Jump to any patient</td><td className="px-6 py-3.5"><strong>Ctrl + K</strong> → type name</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Save a prescription draft</td><td className="px-6 py-3.5"><strong>Ctrl + S</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Dictate advice into prescription</td><td className="px-6 py-3.5">Hold <strong>Ctrl + Shift</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Close prescription template picker</td><td className="px-6 py-3.5"><strong>Escape</strong></td></tr>
    </tbody>
  </table>
</div>
          </div>
        )
      },
      {
        id: 'common-mistakes',
        heading: 'Common Mistakes',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Mistake</th><th className="px-6 py-3">How to avoid it</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">Pressing Ctrl + S on a browser — it saves the webpage instead</td><td className="px-6 py-3.5">Make sure you are clicked inside the Clerixs form before pressing Ctrl + S</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Holding Ctrl + Shift too briefly for voice-to-text</td><td className="px-6 py-3.5">Hold the keys for the entire time you are speaking, then release when done</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Closing a form with Escape before saving</td><td className="px-6 py-3.5">Always save first (Ctrl + S) before pressing Escape</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Not knowing shortcuts exist</td><td className="px-6 py-3.5">Bookmark this page — or press ⌘ / to see them inside the app anytime</td></tr>
    </tbody>
  </table>
</div>
            <p><em>Previous: <a href="13-branches.md" className="text-blue-600 hover:underline font-semibold">13 — Branches</a> | Next: <a href="15-faq.md" className="text-blue-600 hover:underline font-semibold">15 — Troubleshooting & FAQ</a></em></p>
          </div>
        )
      }
    ]
  },
  {
    id: 'faq',
    title: '15. Troubleshooting & FAQ',
    desc: "",
    sections: [
      {
        id: 'prescriptions-pdfs',
        heading: 'Prescriptions & PDFs',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Why is my prescription PDF not downloading?</h4>
            <p>Your browser is blocking the PDF popup. This is the most common reason.</p>
            <p><strong>Fix:</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Look for a <strong>popup blocked</strong> icon in your browser's address bar (top right).</li><li>Click it and select <strong>Always allow popups from app.clerixs.com</strong>.</li><li>Try generating the prescription again — the PDF will open in a new tab.</li></ol>
            <p>If you do not see a popup blocked icon, try a different browser. Clerixs works best on <strong>Google Chrome</strong> and <strong>Microsoft Edge</strong>.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">The prescription PDF shows "Not available" instead of my clinic letterhead.</h4>
            <p>Your clinic letterhead has not been uploaded yet, or it was uploaded in the wrong format.</p>
            <p><strong>Fix:</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings</strong> → <strong>Clinic Settings</strong>.</li><li>Upload a PNG or JPG letterhead image. Recommended size: <strong>1200 × 300 pixels</strong>.</li><li>Click <strong>Save</strong>.</li><li>Generate a new prescription — the letterhead now appears on the PDF.</li></ol>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Can I edit a prescription after generating it?</h4>
            <p>No. Once a prescription is generated (PDF created), it is locked. This protects the medical record.</p>
            <p>If you made a mistake, create a new prescription for the same patient with the corrected information. You can use the original as a reference — it remains visible in the patient's <strong>Prescriptions</strong> tab.</p>
          </div>
        )
      },
      {
        id: 'staff-invitations',
        heading: 'Staff & Invitations',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">A staff member did not receive the invitation email.</h4>
            <p>The email may have gone to their Spam or Promotions folder.</p>
            <p><strong>Steps to check:</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Ask the staff member to check their <strong>Spam</strong>, <strong>Junk</strong>, and <strong>Promotions</strong> folders.</li><li>Search for an email from <strong>noreply@clerixs.com</strong> or with subject <strong>"You've been invited to join [Clinic Name]"</strong>.</li></ol>
            <p>If the email is not there after 10 minutes:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Staff</strong> in the left sidebar.</li><li>Find the staff member's row.</li><li>Click <strong>Open menu (⋮)</strong> → <strong>Resend Invite</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Invitation links expire after <strong>48 hours</strong>. If the staff member did not activate within that time, resend the invitation — the old link no longer works.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">How do I reset my password?</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>app.clerixs.com</strong> and click <strong>Forgot Password ?</strong> on the login page.</li><li>Enter your registered email address.</li><li>Click the reset link sent to your email.</li><li>Set a new password.</li><li>Log in with your new password.</li></ol>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">If you do not receive the password reset email within 5 minutes, check your Spam folder and search for an email from <strong>noreply@clerixs.com</strong>.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">A staff member left the clinic. How do I remove their access immediately?</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Staff</strong> in the left sidebar.</li><li>Click <strong>Open menu (⋮)</strong> next to their name.</li><li>Select <strong>Deactivate</strong>.</li><li>Confirm the action.</li></ol>
            <p>Their login is blocked immediately. All records they created (prescriptions, lab results, appointments) are preserved — only their login access is removed.</p>
          </div>
        )
      },
      {
        id: 'account-subscription',
        heading: 'Account & Subscription',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">My free trial ended. Can I still access my data?</h4>
            <p>Yes. Your data is never deleted when a trial expires. Your account switches to <strong>read-only mode</strong> — you can view all existing records but cannot add new ones.</p>
            <p>To restore full access:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Log in to <strong>app.clerixs.com</strong>.</li><li>Click <strong>Upgrade Now</strong> on the subscription banner.</li><li>Select a plan and complete payment.</li></ol>
            <p>Everything is restored immediately — patients, prescriptions, invoices — exactly as you left them.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">I cancelled my subscription. How long do I have to export my data?</h4>
            <p>You have <strong>90 days</strong> from the cancellation date before your data is permanently deleted.</p>
            <p>During those 90 days, your account is in read-only mode. You can view and export all records.</p>
            <p><strong>To export your patient list:</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Patients</strong>.</li><li>Click <strong>Export</strong> (top right) — downloads a CSV of all patients.</li></ol>
            <p><strong>To export reports:</strong></p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Reports</strong>.</li><li>Set the date range to your full history.</li><li>Click <strong>Export</strong> → <strong>Excel</strong> or <strong>PDF</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Do not wait until day 89. Export immediately after cancelling to be safe.</p>
  </div>
</div>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">My payment failed and my account is in read-only mode. What do I do?</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings → Subscription</strong>.</li><li>Click <strong>Update Payment Method</strong>.</li><li>Enter your new card or UPI details.</li><li>Click <strong>Retry Payment</strong>.</li></ol>
            <p>Your account is restored to full access as soon as the payment succeeds.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Can I switch from monthly billing to annual billing?</h4>
            <p>Yes. Annual billing gives you approximately 2 months free.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings → Subscription</strong>.</li><li>Click <strong>Upgrade Plan</strong>.</li><li>Toggle <strong>Annual</strong> (instead of Monthly) on the upgrade page.</li><li>Complete payment.</li></ol>
            <p>Your billing cycle switches to annual from the next renewal date.</p>
          </div>
        )
      },
      {
        id: 'patients',
        heading: 'Patients',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Can I transfer a patient from one branch to another?</h4>
            <p>Patient records are tied to the branch they were registered in. There is no automatic transfer between branches.</p>
            <p>To make a patient available at another branch, register them again at that branch. Their history from the original branch is not copied — each branch keeps a separate record.</p>
            <p>For Enterprise accounts with a special requirement for patient transfer, contact <strong>enterprise@clerixs.com</strong>.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">A patient's phone number is wrong. Can I update it?</h4>
            <p>Yes.</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Open the patient's profile.</li><li>Click <strong>Open menu (⋮)</strong> → <strong>Edit Patient</strong>.</li><li>Update the phone number (format: <strong>+91 XXXXXXXXXX</strong>).</li><li>Click <strong>Save Patient</strong>.</li></ol>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-amber-900 text-sm">Warning</p>
    <p className="text-amber-800 text-xs mt-1">️ <strong>Warning:</strong> Update the phone number before sending any WhatsApp messages. Messages go to the number saved in the profile — if it's wrong, the message reaches the wrong person.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'browser-device-support',
        heading: 'Browser & Device Support',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Which browsers does Clerixs support?</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Browser</th><th className="px-6 py-3">Support</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Google Chrome</strong></td><td className="px-6 py-3.5">✅ Fully supported — recommended</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Microsoft Edge</strong></td><td className="px-6 py-3.5">✅ Fully supported</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Mozilla Firefox</strong></td><td className="px-6 py-3.5">✅ Supported</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Apple Safari</strong> (Mac/iPad)</td><td className="px-6 py-3.5">✅ Supported</td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900"><strong>Internet Explorer</strong></td><td className="px-6 py-3.5">❌ Not supported</td></tr>
    </tbody>
  </table>
</div>
            <p>Always keep your browser updated to the latest version for the best experience.</p>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">Can I use Clerixs on my phone?</h4>
            <p>Clerixs is designed for <strong>tablets and desktops</strong>. It works on mobile browsers but some features — particularly prescription writing and lab result entry — are easier on a larger screen.</p>
            <p>For the best mobile experience, use a tablet (iPad, Android tablet) in landscape mode.</p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">Receptionists can comfortably use Clerixs on a phone for quick tasks like checking the queue or booking appointments. Doctors writing full prescriptions should use a laptop or tablet.</p>
  </div>
</div>
          </div>
        )
      },
      {
        id: 'whatsapp',
        heading: 'WhatsApp',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">A patient says they did not receive the WhatsApp message.</h4>
            <p>Check the following in order:</p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li><strong>Phone number format</strong> — Open the patient profile and verify the number includes the country code: <strong>+91 XXXXXXXXXX</strong>. Without +91, the message cannot be delivered.</li><li><strong>WhatsApp active on that number</strong> — The patient must have WhatsApp installed and active on that phone number.</li><li><strong>Credit balance</strong> — Check the left sidebar for your WhatsApp credit balance. If it shows zero, you cannot send messages until you top up.</li><li><strong>Message history</strong> — Click <strong>WhatsApp</strong> in the left sidebar. Find the message in the history table and check the delivery status column.</li></ol>
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">My WhatsApp credit balance reached zero mid-day. What do I do?</h4>
            <ol className="list-decimal pl-6 space-y-2 text-slate-600"><li>Go to <strong>Settings</strong>.</li><li>Find the <strong>WhatsApp Credits</strong> section.</li><li>Click <strong>Buy Credits</strong> and select a credit pack.</li><li>Complete payment — credits are added immediately.</li></ol>
            <p>You can resume sending prescriptions right away.</p>
          </div>
        )
      },
      {
        id: 'getting-help',
        heading: 'Getting Help',
        content: (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm mt-6 mb-2">How do I contact Clerixs support?</h4>
            <div className="overflow-x-auto border rounded-xl shadow-sm bg-white my-4">
  <table className="w-full text-sm text-left">
    <thead className="bg-slate-50 text-slate-700 font-bold border-b">
      <tr>
        <th className="px-6 py-3">Query type</th><th className="px-6 py-3">Contact</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-600">
      <tr><td className="px-6 py-3.5 font-bold text-slate-900">General support</td><td className="px-6 py-3.5"><strong>support@clerixs.com</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Billing and subscriptions</td><td className="px-6 py-3.5"><strong>support@clerixs.com</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Enterprise and branch setup</td><td className="px-6 py-3.5"><strong>enterprise@clerixs.com</strong></td></tr><tr><td className="px-6 py-3.5 font-bold text-slate-900">Bugs and technical issues</td><td className="px-6 py-3.5"><strong>support@clerixs.com</strong> — include a screenshot and description of the problem</td></tr>
    </tbody>
  </table>
</div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-r-xl my-4 flex items-start gap-3">
  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
  <div>
    <p className="font-bold text-blue-900 text-sm">Tip</p>
    <p className="text-blue-800 text-xs mt-1">When reporting a bug, include: what you were trying to do, what happened instead, which browser you are using, and a screenshot. This helps the support team resolve your issue faster.</p>
  </div>
</div>
            <p><em>Previous: <a href="14-shortcuts.md" className="text-blue-600 hover:underline font-semibold">14 — Keyboard Shortcuts</a></em></p>
          </div>
        )
      }
    ]
  }
];
