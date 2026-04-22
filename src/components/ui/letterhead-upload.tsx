'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface LetterheadUploadProps {
  userId: string;
  initialUrl?: string;
  onUploadComplete?: (url: string) => void;
}

export function LetterheadUpload({ userId, initialUrl, onUploadComplete }: LetterheadUploadProps) {
  const supabase = createClient();
  const [letterheadUrl, setLetterheadUrl] = React.useState<string | undefined>(initialUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];
      await processUpload(file);
    } catch (error: any) {
      toast.error(error.message || 'Error uploading letterhead');
      console.error(error);
      setIsUploading(false);
    }
  };

  const processUpload = async (file: File) => {
    try {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        throw new Error('Only Images and PDFs are supported.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `letterhead-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const url = data.publicUrl;
      setLetterheadUrl(url);
      
      if (onUploadComplete) {
        onUploadComplete(url);
      }
      
      toast.success('Letterhead uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading letterhead');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const isPdf = letterheadUrl?.toLowerCase().includes('.pdf');

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium text-sm">Clinic Letterhead / Header</h4>
      <div 
        className={`relative group w-full max-w-xl h-40 border-2 border-dashed rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        
        {letterheadUrl ? (
          isPdf ? (
            <div className="flex flex-col items-center justify-center text-primary h-full w-full bg-white">
              <FileText className="h-10 w-10 mb-2" />
              <span className="text-sm font-medium">PDF Letterhead Uploaded</span>
            </div>
          ) : (
            <img src={letterheadUrl} alt="Letterhead" className="object-contain w-full h-full p-2 bg-white" />
          )
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs font-medium uppercase tracking-wider">No Letterhead</span>
          </div>
        )}
        
        <label 
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Upload letterhead image"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="h-8 w-8 mb-1" />
              <span className="text-sm font-medium">Upload File</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*,application/pdf" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground max-w-xl">
        Upload a wide image (e.g., 2000x400 pixels) or PDF that will appear at the top of your printed Prescriptions and Invoices. Drag and drop is supported!
      </p>
    </div>
  );
}
