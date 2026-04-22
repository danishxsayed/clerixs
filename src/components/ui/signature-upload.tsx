'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, PenTool } from 'lucide-react';
import { toast } from 'sonner';

interface SignatureUploadProps {
  userId: string;
  initialUrl?: string;
  onUploadComplete?: (url: string) => void;
}

export function SignatureUpload({ userId, initialUrl, onUploadComplete }: SignatureUploadProps) {
  const supabase = createClient();
  const [signatureUrl, setSignatureUrl] = React.useState<string | undefined>(initialUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `signature-${Math.random()}.${fileExt}`;
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
      setSignatureUrl(url);
      
      if (onUploadComplete) {
        onUploadComplete(url);
      }
      
      toast.success('Signature uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading signature');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium text-sm">Doctor Signature (Used for PDF Prescriptions)</h4>
      <div className="relative group w-64 h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
        
        {signatureUrl ? (
          <img src={signatureUrl} alt="Signature" className="object-contain w-full h-full p-2 bg-white" />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <PenTool className="h-6 w-6 mb-2 opacity-50" />
            <span className="text-xs font-medium uppercase tracking-wider">No Signature</span>
          </div>
        )}
        
        <label 
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Upload signature image"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Upload File</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground max-w-sm">
        Upload a transparent PNG or white-background JPG of your physical signature to automatically sign medical documents.
      </p>
    </div>
  );
}
