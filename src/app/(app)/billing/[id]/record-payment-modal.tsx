'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { recordPayment } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than zero'),
  payment_method: z.enum(['cash', 'upi', 'card', 'bank_transfer', 'razorpay', 'other']),
  payment_date: z.string().min(1, 'Payment date required'),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function RecordPaymentModal({ 
  invoiceId, 
  balanceDue,
}: { 
  invoiceId: string;
  balanceDue: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: balanceDue,
      payment_method: 'cash',
      payment_date: new Date().toISOString().slice(0, 10),
      reference_number: '',
      notes: '',
    },
  });

  // Keep the default amount in sync if balanceDue changes while closed
  React.useEffect(() => {
    if (open) {
      reset({
        amount: balanceDue,
        payment_method: 'cash',
        payment_date: new Date().toISOString().slice(0, 10),
        reference_number: '',
        notes: '',
      });
    }
  }, [open, balanceDue, reset]);

  const onSubmit = (data: PaymentFormValues) => {
    startTransition(async () => {
      try {
        if (data.amount > balanceDue) {
          toast.error("Payment cannot exceed the balance due.");
          return;
        }

        const result = await recordPayment(invoiceId, data);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Payment recorded successfully!');
          setOpen(false);
          router.refresh();
        }
      } catch (err) {
        toast.error('An unexpected error occurred.');
      }
    });
  };

  if (balanceDue <= 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="default" className="w-full sm:w-auto" />}>
        Record Payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Log a partial or full payment against this invoice. Outstanding balance: ₹{balanceDue.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received (₹) <span className="text-destructive">*</span></Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              max={balanceDue}
              {...register('amount', { valueAsNumber: true })} 
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Date <span className="text-destructive">*</span></Label>
              <Input id="payment_date" type="date" {...register('payment_date')} />
              {errors.payment_date && <p className="text-xs text-destructive">{errors.payment_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Method <span className="text-destructive">*</span></Label>
              <select 
                id="payment_method" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('payment_method')}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card / POS</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference ID / UTR (Optional)</Label>
            <Input id="reference_number" {...register('reference_number')} placeholder="e.g. 123456789" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} placeholder="Any internal notes" />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
