'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addCatalogItem, updateCatalogItem } from './price-catalog-actions';

const catalogSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.any(),
  duration_minutes: z.any().optional(),
  notes: z.string().optional(),
});

type CatalogFormValues = z.infer<typeof catalogSchema>;

const DEFAULT_CATEGORIES = [
  'Consultation',
  'Procedure',
  'Lab Test',
  'Medicine',
  'Imaging',
  'Other',
];

interface PriceCatalogFormProps {
  initialData?: any | null;
  onSuccess: (item?: any) => void;
  onCancel: () => void;
}

export function PriceCatalogForm({ initialData, onSuccess, onCancel }: PriceCatalogFormProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'Consultation',
      price: initialData?.price || 0,
      duration_minutes: initialData?.duration_minutes ? String(initialData.duration_minutes) : '',
      notes: initialData?.notes || '',
    },
  });

  async function onSubmit(values: CatalogFormValues) {
    setLoading(true);
    try {
      const data = {
        ...values,
        duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : null,
      };

      if (initialData?.id) {
        const result = await updateCatalogItem(initialData.id, data);
        if (result?.error) throw new Error(result.error);
        toast.success('Catalog item updated');
        onSuccess(result.item);
      } else {
        const result = await addCatalogItem(data);
        if (result?.error) throw new Error(result.error);
        toast.success('Catalog item added');
        onSuccess(result.item);
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment / Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Initial Consultation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration in Minutes (Optional)</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="e.g. 30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any instructions or codes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
