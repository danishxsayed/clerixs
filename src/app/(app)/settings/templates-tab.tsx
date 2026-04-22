'use client';

import * as React from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  Edit, 
  Loader2, 
  Stethoscope,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { listPrescriptionTemplates, deletePrescriptionTemplate, updateTemplateInfo } from '@/app/(app)/patients/[id]/prescriptions/template-actions';

export function TemplatesTab() {
  const [loading, setLoading] = React.useState(true);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // States for Edit/Delete
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const [editTemplate, setEditTemplate] = React.useState<any | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editName, setEditName] = React.useState('');

  const fetchTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPrescriptionTemplates();
      if (result.templates) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = templates.filter((t) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        (t.diagnosis && t.diagnosis.toLowerCase().includes(query))
      );
    }
    return true;
  });

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deletePrescriptionTemplate(deleteId);
      if (result.error) throw new Error(result.error);
      toast.success('Template deleted successfully');
      setTemplates(prev => prev.filter(t => t.id !== deleteId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleUpdate() {
    if (!editTemplate) return;
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateTemplateInfo(editTemplate.id, editName);
      if (result.error) throw new Error(result.error);
      
      toast.success('Template updated');
      setTemplates(prev => prev.map(t => 
        t.id === editTemplate.id ? { ...t, name: editName } : t
      ));
      setEditTemplate(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update template');
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(template: any) {
    setEditTemplate(template);
    setEditName(template.name);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-lg font-semibold leading-none tracking-tight">Prescription Templates</h3>
        <p className="text-sm text-muted-foreground">
          Manage your clinic's reusable prescription protocols and dosing schedules.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates by name or diagnosis..." 
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-white" onClick={fetchTemplates}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[40%]">Template Name</TableHead>
              <TableHead>Medicines</TableHead>
              <TableHead className="text-center">Usage</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    <p className="text-sm text-muted-foreground font-medium">Loading your templates...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="bg-slate-100 p-4 rounded-full">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">No templates found</p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Templates you save during a prescription will appear here for management.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => (
                <TableRow key={template.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className="font-bold text-slate-900">{template.name}</span>
                      {template.diagnosis && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[300px]">{template.diagnosis}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-slate-700">
                         {Array.isArray(template.medicines) ? template.medicines.length : 0} Meds
                       </span>
                       <div className="flex -space-x-1">
                         {Array.isArray(template.medicines) && template.medicines.slice(0, 2).map((_, i) => (
                           <div key={i} className="h-4 w-4 rounded-full border-2 border-white bg-primary/20" />
                         ))}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg text-amber-700 border border-amber-100/50">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold leading-none">{template.usage_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {template.created_by?.profiles?.full_name || 'System'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(template)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(template.id)} 
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Doctors will no longer be able to load this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTemplate} onOpenChange={(open) => !open && setEditTemplate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Template Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
               <label className="text-sm font-medium">Template Name</label>
               <Input 
                 value={editName} 
                 onChange={(e) => setEditName(e.target.value)}
                 placeholder="Template Name"
               />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
