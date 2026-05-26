'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { updateInvoice } from '../../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description required'),
  quantity: z.coerce.number().min(1, 'Qty > 0 required'),
  unit_price: z.coerce.number().min(0, 'Price cannot be negative'),
});

const invoiceSchema = z.object({
  patient_id: z.string().min(1, 'Patient selection is required.'),
  appointment_id: z.string().optional().nullable(),
  issue_date: z.string().min(1, 'Issue date is required.'),
  due_date: z.string().optional(),
  status: z.enum(['draft', 'issued', 'partially_paid', 'paid', 'void']),
  notes: z.string().optional(),
  amount_paid: z.coerce.number().min(0, 'Amount paid cannot be negative').optional(),
  discount_amount: z.coerce.number().min(0, 'Discount cannot be negative').optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const CatalogCombobox = ({ 
  index, 
  catalogItems, 
  watch, 
  setValue, 
  formValues,
  register
}: {
  index: number;
  catalogItems: { name: string; category: string; price: number }[];
  watch: any;
  setValue: any;
  formValues: any;
  register: any;
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const currentDesc = watch(`items.${index}.description`);

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !currentDesc && "text-muted-foreground"
            )}
          >
            <span className="truncate">{currentDesc || "Search catalog..."}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        } />
        <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search items..." 
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setValue(`items.${index}.description`, search, { shouldValidate: true, shouldDirty: true });
                  setOpen(false);
                }
              }}
            />
            <CommandList>
              <CommandEmpty className="p-2 text-sm text-muted-foreground text-center">
                No items found. Press Enter to use "{search}".
              </CommandEmpty>
              <CommandGroup>
                {catalogItems.map((item, idx) => (
                  <CommandItem
                    key={idx}
                    value={item.name}
                    onSelect={(currentValue) => {
                      setValue(`items.${index}.description`, currentValue, { shouldValidate: true, shouldDirty: true });
                      
                      const currentPrice = formValues.items?.[index]?.unit_price;
                      if (!currentPrice || currentPrice === 0) {
                        setValue(`items.${index}.unit_price`, Number(item.price), { shouldValidate: true, shouldDirty: true });
                      }
                      
                      setSearch(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentDesc === item.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.category} • ₹{item.price}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" {...register(`items.${index}.description` as const)} />
    </div>
  );
};

export function InvoiceEditForm({ 
  invoice,
  patients,
  catalogItems = [],
}: { 
  invoice: any,
  patients: {id: string, full_name: string}[],
  catalogItems?: any[],
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      patient_id: invoice.patient_id || '',
      appointment_id: invoice.appointment_id || '',
      issue_date: invoice.issue_date ? new Date(invoice.issue_date).toISOString().slice(0, 10) : '',
      due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().slice(0, 10) : '',
      status: invoice.status || 'draft',
      notes: invoice.notes || '',
      amount_paid: 0,
      discount_amount: invoice.discount_amount || 0,
      items: invoice.invoice_items && invoice.invoice_items.length > 0
        ? invoice.invoice_items.map((i: any) => ({
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
          }))
        : [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const formValues = useWatch({ control });

  const totals = React.useMemo(() => {
    let subtotal = 0;
    const currentItems = formValues.items || [];
    currentItems.forEach((item: any) => {
      const q = Number(item?.quantity) || 0;
      const p = Number(item?.unit_price) || 0;
      subtotal += q * p;
    });

    const discount = Number(formValues.discount_amount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const sgst = taxableAmount * 0.025;
    const cgst = taxableAmount * 0.025;
    const tax = sgst + cgst;

    return { subtotal, discount, sgst, cgst, tax, total: taxableAmount + tax };
  }, [formValues.items, formValues.discount_amount]);

  const formatCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format;

  const onSubmit = (data: InvoiceFormValues) => {
    if (totals.discount > totals.subtotal) {
      toast.error(`Discount cannot exceed the invoice total of ${formatCurrency(totals.subtotal)}`);
      return;
    }
    startTransition(async () => {
      try {
        const result = await updateInvoice(invoice.id, data);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Invoice updated successfully!');
          router.push(`/billing/${invoice.id}`);
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  const isReadOnly = invoice.status === 'paid' || invoice.status === 'void';

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-0 relative">
      
      {isReadOnly && (
        <div className="absolute inset-x-0 top-0 bg-yellow-50 text-yellow-800 p-3 text-sm text-center font-medium border-b border-yellow-200 z-10">
          This invoice is marked as '{invoice.status}'. Saving modifications will trigger balance recalculations and may affect associated reports. Proceed with caution.
        </div>
      )}

      {/* Top Section: Master Details */}
      <div className={`p-6 space-y-6 ${isReadOnly ? 'pt-16' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="patient_id">Bill To (Patient) <span className="text-destructive">*</span></Label>
            <select 
              id="patient_id" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('patient_id')}
            >
              <option value="">Select a patient</option>
              {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue_date">Issue Date <span className="text-destructive">*</span></Label>
            <Input id="issue_date" type="date" {...register('issue_date')} />
            {errors.issue_date && <p className="text-xs text-destructive">{errors.issue_date.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" {...register('due_date')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
                <select 
                id="status" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('status')}
                >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="void">Void</option>
                </select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label>Add Payment (₹)</Label>
                <Input type="number" step="0.01" disabled={isReadOnly} {...register('amount_paid')} placeholder="0.00" />
                <p className="text-xs text-muted-foreground mt-1">Previous paid: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.amount_paid || 0)}</p>
                {errors.amount_paid && <p className="text-xs text-red-500">{errors.amount_paid.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes / Terms</Label>
                <Input id="notes" placeholder="e.g. Please pay within 15 days." {...register('notes')} />
            </div>
        </div>
      </div>

      {/* Middle Section: Line Items */}
      <div className="border-t bg-muted/20 p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center justify-between">
            Line Items
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
              className="text-sm font-normal text-primary hover:underline flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </button>
        </h3>
        
        {errors.items?.message && <p className="text-sm text-destructive">{errors.items.message}</p>}

        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-background p-4 rounded-lg border relative">
            
            <div className="flex-1 w-full space-y-2">
              <Label className="sm:hidden">Description</Label>
              <CatalogCombobox 
                index={index} 
                catalogItems={catalogItems} 
                watch={watch} 
                setValue={setValue} 
                formValues={formValues} 
                register={register} 
              />
              {errors.items?.[index]?.description && <p className="text-xs text-destructive">{errors.items[index]?.description?.message}</p>}
            </div>

            <div className="w-full sm:w-24 space-y-2">
               <Label className="sm:hidden">Qty</Label>
              <Input 
                type="number"
                placeholder="Qty" 
                {...register(`items.${index}.quantity` as const)} 
              />
               {errors.items?.[index]?.quantity && <p className="text-xs text-destructive">{errors.items[index]?.quantity?.message}</p>}
            </div>

            <div className="w-full sm:w-32 space-y-2">
               <Label className="sm:hidden">Price (₹)</Label>
              <Input 
                type="number"
                step="0.01"
                placeholder="Price" 
                {...register(`items.${index}.unit_price` as const)} 
              />
               {errors.items?.[index]?.unit_price && <p className="text-xs text-destructive">{errors.items[index]?.unit_price?.message}</p>}
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors absolute sm:relative top-2 right-2 sm:top-auto sm:right-auto"
                title="Remove Item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-end pt-4 gap-6">
          <div className="w-full sm:w-64 space-y-4 text-sm bg-background p-4 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Global Discount (₹)</Label>
              <Input id="discount_amount" type="number" step="0.01" min="0" {...register('discount_amount')} placeholder="0.00" />
              {errors.discount_amount && <p className="text-xs text-destructive">{errors.discount_amount.message}</p>}
              {totals.discount > totals.subtotal && (
                <p className="text-xs text-destructive font-medium mt-1">
                  Discount cannot exceed the invoice total of {formatCurrency(totals.subtotal)}
                </p>
              )}
            </div>
            <div className="flex justify-between items-center text-muted-foreground pt-2">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground">
              <span>SGST (2.5%):</span>
              <span>{formatCurrency(totals.sgst)}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>CGST (2.5%):</span>
              <span>{formatCurrency(totals.cgst)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold text-base text-zinc-900">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Section: Actions */}
      <div className="p-6 flex justify-end gap-4 border-t bg-background">
        <Link href={`/billing/${invoice.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted h-10 px-4 py-2 border">
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={isPending} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 min-w-[150px]"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
