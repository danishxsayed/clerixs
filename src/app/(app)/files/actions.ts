'use client';

import { createClient } from '@/lib/supabase/client';

export type StorageFile = {
  name: string;
  url: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
};

export async function listFiles(userId: string): Promise<{ data?: StorageFile[], error?: string }> {
  try {
    const supabase = createClient();
    
    // List files inside the user's folder
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Storage list error:', error);
      return { error: 'Failed to list files.' };
    }

    if (!files) return { data: [] };

    // Get public URL for each file
    const filesWithUrls = files
      .filter(file => file.name !== '.emptyFolderPlaceholder') // Ignore placeholders
      .map(file => {
        const filePath = `${userId}/${file.name}`;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        return {
          name: file.name,
          url: publicUrl,
          created_at: file.created_at,
          metadata: file.metadata
        } as StorageFile;
      });

    return { data: filesWithUrls };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteFile(userId: string, fileName: string): Promise<{ success?: boolean, error?: string }> {
  try {
    const supabase = createClient();
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return { error: 'Failed to delete file.' };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred.' };
  }
}
