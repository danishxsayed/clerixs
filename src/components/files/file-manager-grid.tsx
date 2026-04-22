'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { listFiles, deleteFile, StorageFile } from '@/app/(app)/files/actions';
import { registerFileUsage, unregisterFileUsage } from '@/app/(app)/files/server-actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Copy, Trash2, Loader2, UploadCloud, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function FileManagerGrid({ userId }: { userId: string }) {
  const [files, setFiles] = React.useState<StorageFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [deletingFile, setDeletingFile] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchFiles = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await listFiles(userId);
    if (error) {
      toast.error(error);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }, [userId]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async () => {
    if (!deletingFile) return;
    const { error } = await deleteFile(userId, deletingFile);
    if (error) {
      toast.error(error);
    } else {
      // Unregister from database too
      const filePath = `${userId}/${deletingFile}`;
      await unregisterFileUsage(filePath);
      
      toast.success('File deleted successfully');
      fetchFiles();
    }
    setDeletingFile(null);
  };

  const processUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const supabase = createClient();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `upload-${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Register in database for storage tracking
      const res = await registerFileUsage({
        fileName: file.name,
        storagePath: filePath,
        fileSize: file.size,
        fileType: file.type
      });

      if (res.error) {
        console.warn('File uploaded but tracking failed:', res.error);
      }

      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processUpload(event.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const isImage = (url: string) => url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Manager</h2>
          <p className="text-muted-foreground text-sm">
            Manage your clinic's digital assets, letterheads, and signatures.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFiles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
            Upload File
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center text-muted-foreground py-6">
          <UploadCloud className={`h-10 w-10 mb-4 ${isDragging ? 'text-primary' : ''}`} />
          <h3 className="font-semibold text-lg text-foreground">Drag & Drop files here</h3>
          <p className="text-sm mt-1">Supports Images (PNG, JPG) and PDFs.</p>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-muted animate-pulse rounded-xl h-48 w-full" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl bg-muted/20">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
          <h3 className="text-lg font-medium text-foreground">No files uploaded yet</h3>
          <p className="text-muted-foreground text-sm">Upload your first file to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {files.map((file) => (
            <Card key={file.name} className="overflow-hidden flex flex-col group relative border border-border shadow-sm">
              <div className="aspect-square bg-muted/50 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-muted/80 transition-colors">
                {isImage(file.url) ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-contain" />
                ) : (
                  <FileText className="h-16 w-16 text-primary/40" />
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => window.open(file.url, '_blank')} title="View File">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => copyToClipboard(file.url)} title="Copy Link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-card border-t flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-semibold truncate text-foreground" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => setDeletingFile(file.name)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingFile} onOpenChange={(open) => !open && setDeletingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingFile}</strong>? This action cannot be undone and will break any images in the app currently using this URL.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingFile(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
