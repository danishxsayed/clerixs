'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { bulkImportPatients } from './actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ImportPatientsModal() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'upload' | 'preview' | 'importing' | 'result'>('upload');
  const [parsedData, setParsedData] = React.useState<any[]>([]);
  const [file, setFile] = React.useState<File | null>(null);
  const [results, setResults] = React.useState<any>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const resetModal = () => {
    setStep('upload');
    setParsedData([]);
    setFile(null);
    setResults(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && step === 'importing') return; // prevent close during import
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(resetModal, 300);
    }
  };

  const downloadTemplate = () => {
    // Basic CSV template
    const headers = 'full_name,phone,email,date_of_birth,gender,age,blood_group,emergency_contact,address\n';
    const row1 = 'John Doe,+1234567890,john@example.com,1990-01-01,male,34,O+,+1987654321,123 Main St\n';
    const row2 = 'Jane Smith,+1987654321,jane@example.com,1985-05-15,female,39,A-,+1234567890,456 Oak Ave\n';
    
    const blob = new Blob([headers + row1 + row2], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'patient_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      const lines = text.split('\n');
      if (lines.length < 2) return; // Need at least headers and 1 row
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma, but ignore commas inside quotes
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || '';
        });
        rows.push(obj);
      }
      
      setParsedData(rows);
      setStep('preview');
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      processFile(droppedFile);
    } else if (droppedFile) {
      toast.error('Please upload a valid CSV file.');
    }
  };

  const handleImport = async () => {
    setStep('importing');
    const res = await bulkImportPatients(parsedData);
    if (res.error) {
      toast.error(res.error);
      setStep('preview');
    } else {
      setResults(res.results);
      setStep('result');
      toast.success('Import completed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button variant="outline" className="h-10 px-4 py-2 bg-background w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
      } />
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Patients</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file to add multiple patients at once.'}
            {step === 'preview' && 'Review the first few rows before confirming import.'}
            {step === 'importing' && 'Please wait while we process the records...'}
            {step === 'result' && 'Import process completed.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="grid gap-6 py-4">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center space-y-4 p-8 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out cursor-pointer",
                isDragging 
                  ? "border-primary bg-primary/5 scale-[1.02] shadow-sm" 
                  : "bg-muted/30 border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/40"
              )}
            >
              <div className={cn(
                "p-4 rounded-full transition-colors duration-200",
                isDragging ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground shadow-sm"
              )}>
                <FileSpreadsheet className="h-10 w-10" />
              </div>
              <div className="text-center space-y-1">
                <p className={cn("text-base font-medium", isDragging && "text-primary")}>
                  {isDragging ? 'Drop your CSV right here!' : 'Drag and drop your CSV file here'}
                </p>
                <p className="text-sm text-muted-foreground">or click to browse your computer</p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="csv-upload"
                onChange={handleFileUpload}
              />
              <Button asChild variant={isDragging ? 'default' : 'secondary'} className="mt-2 transition-all">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  Select CSV File
                </label>
              </Button>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p className="font-semibold">Need the correct format?</p>
                <p>Your CSV file must include specific column headers like full_name, phone, and age.</p>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="mt-2 bg-white dark:bg-transparent border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Phone</th>
                      <th className="px-4 py-3 text-left font-medium">Age</th>
                      <th className="px-4 py-3 text-left font-medium">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y relative">
                    {parsedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors bg-background">
                        <td className="px-4 py-3">{row.full_name || '-'}</td>
                        <td className="px-4 py-3">{row.phone || '-'}</td>
                        <td className="px-4 py-3">{row.age || '-'}</td>
                        <td className="px-4 py-3 capitalize">{row.gender || '-'}</td>
                      </tr>
                    ))}
                    {parsedData.length > 5 && (
                       <tr className="bg-muted/30">
                         <td colSpan={4} className="px-4 py-2 text-center text-xs text-muted-foreground">
                           + {parsedData.length - 5} more rows
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg flex items-start gap-3 border border-amber-200 dark:border-amber-900/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-semibold">Duplicate Check Enabled</p>
                <p>During import, the system will automatically skip any rows with a phone number that already exists in your clinic.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
              <Button onClick={handleImport}>
                Start Import ({parsedData.length} records)
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-lg font-medium">Importing your patients...</div>
            <div className="text-sm text-muted-foreground">This may take a moment depending on the size of your file.</div>
          </div>
        )}

        {step === 'result' && results && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h3 className="text-xl font-bold">Import Complete</h3>
              <p className="text-muted-foreground">
                Successfully processed your patient list.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/30 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{results.added}</div>
                <div className="text-sm text-green-800 dark:text-green-200">Added</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{results.skipped}</div>
                <div className="text-sm text-amber-800 dark:text-amber-200">Duplicates Skipped</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-500">{results.errors}</div>
                <div className="text-sm text-red-800 dark:text-red-200">Row Errors</div>
              </div>
            </div>

            {results.errorLog?.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium text-sm border-b">
                  Error Log
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y relative">
                      {results.errorLog.map((log: any, i: number) => (
                        <tr key={i} className="bg-background">
                          <td className="px-4 py-2 font-medium whitespace-nowrap">Row {log.row}</td>
                          <td className="px-4 py-2 text-muted-foreground truncate max-w-[120px]">{log.name}</td>
                          <td className="px-4 py-2 text-red-500">{log.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
