'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadExternalLabReport } from '@/app/(app)/lab/actions';

export function ExternalReportForm({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [labName, setLabName] = React.useState('');
  const [reportDate, setReportDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }
    
    setLoading(true);

    // Convert file to base64 or push directly via FormData if action supports it
    // Using FormData for server action file upload
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('lab_name', labName);
    formData.append('report_date', reportDate);
    formData.append('notes', notes);
    formData.append('file', file);

    const res = await uploadExternalLabReport(formData);

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success('External lab report uploaded safely!');
      router.push(`/patients/${patientId}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>External Lab Name</Label>
            <Input 
              value={labName} 
              onChange={e => setLabName(e.target.value)} 
              placeholder="e.g. Dr. Lal PathLabs"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Report Date</Label>
            <Input 
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload Report Document (PDF/Image)</Label>
          <Input 
            type="file" 
            accept=".pdf,image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            required
          />
          <p className="text-xs text-muted-foreground">Max file size: 5MB.</p>
        </div>

        <div className="space-y-2">
          <Label>Comments / Test Summary</Label>
          <Input 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            placeholder="Briefly describe what tests are in this report..." 
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Save External Report'}
        </Button>
      </div>
    </form>
  );
}
