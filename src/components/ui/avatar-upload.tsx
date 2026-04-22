'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface AvatarUploadProps {
  userId: string;
  initials: string;
  initialUrl?: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({ userId, initials, initialUrl, onUploadComplete }: AvatarUploadProps) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(initialUrl);
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
      // Ensure unique filename to prevent browser caching old avatars
      const fileName = `profile-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload picture to Supabase Storage avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of the newly uploaded avatar
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const url = data.publicUrl;
      setAvatarUrl(url);
      
      if (onUploadComplete) {
        onUploadComplete(url);
      }
      
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading avatar');
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset input so they can upload the exact same file again if they want
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
          <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        
        {/* Hover Overlay */}
        <label 
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer overflow-hidden"
          title="Change picture"
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
        <h4 className="font-medium">Profile Picture</h4>
        <p className="text-sm text-muted-foreground mt-1">
          JPG, GIF or PNG. 1MB max.
        </p>
      </div>
    </div>
  );
}
