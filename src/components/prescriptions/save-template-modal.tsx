'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { savePrescriptionTemplate } from '@/app/(app)/patients/[id]/prescriptions/template-actions';

const templateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
});

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionData: {
    diagnosis: string;
    instructions?: string;
    medicines: any[];
  };
}

// No category list needed anymore

export function SaveTemplateModal({
  open,
  onOpenChange,
  prescriptionData,
}: SaveTemplateModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof templateSchema>) {
    setIsSubmitting(true);
    try {
      const result = await savePrescriptionTemplate({
        name: values.name,
        diagnosis: prescriptionData.diagnosis,
        medicines: prescriptionData.medicines,
        generalAdvice: prescriptionData.instructions,
      });

      if (result.error) throw new Error(result.error);

      toast.success('Template saved successfully!');
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Give this prescription protocol a name so you can reuse it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard Fever Protocol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Template Preview</h4>
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700">Diagnosis</p>
                <p className="text-xs text-slate-600 italic">
                  {prescriptionData.diagnosis || 'No diagnosis provided'}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700">Medicines ({prescriptionData.medicines.length})</p>
                <div className="flex flex-wrap gap-1">
                  {prescriptionData.medicines.map((med, i) => (
                    <span key={i} className="text-[10px] bg-white border px-1.5 py-0.5 rounded-md text-slate-500">
                      {med.medicine_name}
                    </span>
                  ))}
                  {prescriptionData.medicines.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">No medicines added</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
