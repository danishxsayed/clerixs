'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cancelSubscription } from './actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CancelSubscriptionButtonProps {
  currentPeriodEnd: string;
}

export function CancelSubscriptionButton({ currentPeriodEnd }: CancelSubscriptionButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await cancelSubscription();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Subscription cancelled successfully.');
      setOpen(false);
    } catch (err: any) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = format(new Date(currentPeriodEnd), 'MMM dd, yyyy');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="w-full flex justify-center sm:justify-start text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive h-10 px-4 py-2 bg-transparent rounded-md text-sm font-medium border items-center cursor-pointer">
          Cancel Subscription
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Subscription?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your plan? Your subscription will remain fully active until <strong className="text-foreground">{formattedDate}</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Yes, Cancel Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
