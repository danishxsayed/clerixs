'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Paperclip, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CategoryType =
  | 'Technical Support'
  | 'Billing & Subscription'
  | 'Feature Request'
  | 'Sales Inquiry'
  | 'Enterprise / Branches'
  | 'Bug Report'
  | 'Other';

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: CategoryType;
}

export function SupportModal({ open, onOpenChange, initialCategory = 'Technical Support' }: SupportModalProps) {
  // Modal states
  const [submitting, setSubmitting] = React.useState(false);
  const [errorBanner, setErrorBanner] = React.useState<string | null>(null);
  const [successData, setSuccessData] = React.useState<{ ticketNumber: string; name: string; email: string } | null>(null);

  // Form states
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [clinicName, setClinicName] = React.useState('');
  const [category, setCategory] = React.useState<CategoryType>(initialCategory);
  
  // Category-dependent fields
  const [pageUrl, setPageUrl] = React.useState('');
  const [stepsToReproduce, setStepsToReproduce] = React.useState('');
  const [branchesCount, setBranchesCount] = React.useState('1');
  const [patientVolume, setPatientVolume] = React.useState('Under 100');
  
  // Standard fields
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [priority, setPriority] = React.useState<'Normal' | 'Urgent' | 'Critical'>('Normal');
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null);

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync category with initialCategory on mount or open
  React.useEffect(() => {
    if (open) {
      setCategory(initialCategory);
      // Reset errors & success states on re-open
      setErrorBanner(null);
      setSuccessData(null);
    }
  }, [open, initialCategory]);

  const isSalesFlow = category === 'Sales Inquiry' || category === 'Enterprise / Branches';

  // Attachment validation
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAttachmentError(null);
    if (!file) {
      setAttachment(null);
      return;
    }

    // Check size limit: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setAttachmentError('File is too large. Max size is 5MB.');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check file type: Images or PDFs only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setAttachmentError('Only images (JPEG, PNG, WEBP) and PDFs are allowed.');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    // Basic Client validation
    if (!name.trim()) return setErrorBanner('Full Name is required.');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return setErrorBanner('Please enter a valid email address.');
    if (!subject.trim() || subject.length > 100) return setErrorBanner('Subject is required (max 100 characters).');
    if (!message.trim() || message.length < 20 || message.length > 1000) {
      return setErrorBanner('Message must be between 20 and 1000 characters.');
    }
    if (phone.trim() && !/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      return setErrorBanner('Please enter a valid phone number.');
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('name', name);
      payload.append('email', email);
      payload.append('phone', phone);
      payload.append('clinicName', clinicName);
      payload.append('category', category);
      payload.append('subject', subject);
      payload.append('message', message);
      payload.append('priority', priority);
      
      // Category-dependent appends
      if (category === 'Bug Report') {
        payload.append('pageUrl', pageUrl);
        payload.append('stepsToReproduce', stepsToReproduce);
      }
      if (isSalesFlow) {
        payload.append('branchesCount', branchesCount);
        payload.append('patientVolume', patientVolume);
      }
      
      if (attachment) {
        payload.append('attachment', attachment);
      }

      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        body: payload,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to submit support ticket.');
      }

      // Success
      setSuccessData({
        ticketNumber: responseData.ticketNumber,
        name,
        email,
      });

      // Clear form
      setName('');
      setEmail('');
      setPhone('');
      setClinicName('');
      setSubject('');
      setMessage('');
      setPageUrl('');
      setStepsToReproduce('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to send message. Please try again or email us directly at support@clerixs.com');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !successData} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl transition-all max-h-[90vh] flex flex-col">
          {/* Subtle header brand bar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 shrink-0 flex items-center justify-between">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="relative h-7 w-7 overflow-hidden rounded-md bg-white p-0.5 shrink-0">
                  <Image src="/assets/logo.jpg" alt="Clerixs" fill className="object-contain" />
                </div>
                <DialogTitle className="text-white text-lg font-black tracking-tight">
                  {isSalesFlow ? 'Talk to our Sales Team' : 'How can we help you?'}
                </DialogTitle>
              </div>
              <DialogDescription className="text-blue-100/90 text-xs mt-1.5 font-medium leading-relaxed max-w-md">
                We typically respond within 2-4 hours during business hours (9AM-6PM IST).
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Content container scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Error Banner */}
            {errorBanner && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200/60 p-3 rounded-2xl flex items-start gap-2.5"
              >
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 font-semibold leading-relaxed">
                  {errorBanner}
                </p>
              </motion.div>
            )}

            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="support-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="support-name"
                  placeholder="e.g. Danish Sayed"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl h-10 font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="e.g. danish@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl h-10 font-medium"
                  required
                />
              </div>
            </div>

            {/* Row 2: Phone and Clinic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="support-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number <span className="text-slate-400 font-medium">(Optional)</span>
                </Label>
                <Input
                  id="support-phone"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl h-10 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support-clinic" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Clinic Name <span className="text-slate-400 font-medium">(Optional)</span>
                </Label>
                <Input
                  id="support-clinic"
                  placeholder="e.g. City Dental Care"
                  value={clinicName}
                  onChange={e => setClinicName(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl h-10 font-medium"
                />
              </div>
            </div>

            {/* Row 3: Category */}
            <div className="space-y-1.5">
              <Label htmlFor="support-category" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={(val: CategoryType | null) => { if (val) setCategory(val); }}>
                <SelectTrigger id="support-category" className="bg-slate-50 border-slate-200 text-xs rounded-xl h-10 font-medium">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical Support" className="text-xs font-medium">Technical Support</SelectItem>
                  <SelectItem value="Billing & Subscription" className="text-xs font-medium">Billing & Subscription</SelectItem>
                  <SelectItem value="Feature Request" className="text-xs font-medium">Feature Request</SelectItem>
                  <SelectItem value="Sales Inquiry" className="text-xs font-medium">Sales Inquiry</SelectItem>
                  <SelectItem value="Enterprise / Branches" className="text-xs font-medium">Enterprise / Branches</SelectItem>
                  <SelectItem value="Bug Report" className="text-xs font-medium">Bug Report</SelectItem>
                  <SelectItem value="Other" className="text-xs font-medium">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 4: Category is Bug Report */}
            {category === 'Bug Report' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="support-bug-page" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Page/Feature where bug occurred <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="support-bug-page"
                    placeholder="e.g. Queue page, Invoice generation"
                    value={pageUrl}
                    onChange={e => setPageUrl(e.target.value)}
                    className="bg-white border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl h-10 font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="support-bug-steps" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Steps to reproduce <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="support-bug-steps"
                    placeholder="Describe how to trigger the bug..."
                    rows={2}
                    value={stepsToReproduce}
                    onChange={e => setStepsToReproduce(e.target.value)}
                    className="bg-white border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl font-medium"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Row 5: Category is Sales Inquiry or Enterprise / Branches */}
            {isSalesFlow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="support-branches" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Number of Branches <span className="text-red-500">*</span>
                  </Label>
                  <Select value={branchesCount} onValueChange={(val) => setBranchesCount(val || '1')}>
                    <SelectTrigger id="support-branches" className="bg-white border-slate-200 text-xs rounded-xl h-10 font-medium">
                      <SelectValue placeholder="Select Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="text-xs font-medium">1 branch</SelectItem>
                      <SelectItem value="2-5" className="text-xs font-medium">2 - 5 branches</SelectItem>
                      <SelectItem value="6-10" className="text-xs font-medium">6 - 10 branches</SelectItem>
                      <SelectItem value="10+" className="text-xs font-medium">10+ branches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="support-volume" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Monthly patient volume <span className="text-red-500">*</span>
                  </Label>
                  <Select value={patientVolume} onValueChange={(val) => setPatientVolume(val || 'Under 100')}>
                    <SelectTrigger id="support-volume" className="bg-white border-slate-200 text-xs rounded-xl h-10 font-medium">
                      <SelectValue placeholder="Select Patient Volume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under 100" className="text-xs font-medium">Under 100 patients</SelectItem>
                      <SelectItem value="100-500" className="text-xs font-medium">100 - 500 patients</SelectItem>
                      <SelectItem value="500+" className="text-xs font-medium">500+ patients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Row 6: Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="support-subject" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="support-subject"
                placeholder="Brief summary of your query"
                maxLength={100}
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl h-10 font-medium"
                required
              />
            </div>

            {/* Row 7: Message */}
            <div className="space-y-1">
              <Label htmlFor="support-message" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="support-message"
                placeholder="Please enter your request details (minimum 20 characters)"
                rows={4}
                maxLength={1000}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600/20 text-xs rounded-xl font-medium"
                required
              />
              <div className="flex justify-end text-[10px] font-bold text-slate-400">
                {message.length} / 1000
              </div>
            </div>

            {/* Row 8: Priority Switch (Non-sales only) */}
            {!isSalesFlow && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Priority
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'Normal', desc: 'Normal — I can wait 2-4 hrs' },
                    { key: 'Urgent', desc: 'Urgent — Affects patient care' },
                    { key: 'Critical', desc: 'Critical — System completely down' },
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPriority(item.key as any)}
                      className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                        priority === item.key
                          ? item.key === 'Critical'
                            ? 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/20'
                            : item.key === 'Urgent'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                            : 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {item.key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Row 9: Attachment */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attach screenshot or document <span className="text-slate-400 font-medium">(Optional)</span>
              </Label>
              
              {!attachment ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200/80 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-blue-50/10 transition-all select-none"
                >
                  <Paperclip className="h-5 w-5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500">
                    Click to attach file (Images and PDFs only, max 5MB)
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-blue-50/30 border border-blue-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate">{attachment.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                      ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg flex items-center justify-center shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAttachmentChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              
              {attachmentError && (
                <p className="text-[10px] font-bold text-red-500 pl-1">{attachmentError}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting || !!attachmentError}
                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-600/10 rounded-2xl flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={!!successData} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[480px] p-8 text-center bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl overflow-hidden">
          <div className="space-y-6">
            {/* Green Tick Animation Container */}
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Thank you <strong className="text-slate-800 font-black">{successData?.name}</strong>. We have received your message and will respond to <strong className="text-slate-800 font-black">{successData?.email}</strong> within 2-4 hours.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Your Ticket Reference
              </span>
              <span className="text-lg font-black text-blue-600 tracking-tight font-mono">
                #{successData?.ticketNumber}
              </span>
            </div>

            <Button
              onClick={handleClose}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
