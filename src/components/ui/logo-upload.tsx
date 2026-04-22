'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface LogoUploadProps {
  userId: string;
  initialUrl?: string;
  onUploadComplete?: (url: string) => void;
}

export function LogoUpload({ userId, initialUrl, onUploadComplete }: LogoUploadProps) {
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(initialUrl);
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
      const fileName = `logo-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`; // Use user id to pass RLS for avatars bucket

      // Upload to avatars bucket as it exists and has RLS policies
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const url = data.publicUrl;
      setLogoUrl(url);
      
      if (onUploadComplete) onUploadComplete(url);
      
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative group w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        )}
        
        {/* Hover Overlay */}
        <label 
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Change logo"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Camera className="h-6 w-6" />
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
      <div className="flex flex-col">
        <h4 className="font-medium text-sm">Clinic Logo</h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
          JPG or PNG. Will be displayed on receipts and header.
        </p>
      </div>
    </div>
  );
}
