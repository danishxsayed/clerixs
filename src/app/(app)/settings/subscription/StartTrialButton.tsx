'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { startFreeTrial } from './actions';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';

export function StartTrialButton() {
  const [isPending, setIsPending] = React.useState(false);

  const handleStartTrial = async () => {
    setIsPending(true);
    try {
      const result = await startFreeTrial();
      if (result.success) {
        toast.success('Your 7-day free trial has started!');
        // Use hard redirect to dashboard to ensure middleware sees the new metadata
        window.location.href = '/dashboard';
      } else if ('error' in result && result.error) {
        toast.error(result.error);
      }
    } catch (error) {

      toast.error('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button onClick={handleStartTrial} disabled={isPending} className="w-full sm:w-auto">
      <Rocket className="mr-2 h-4 w-4" />
      {isPending ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
    </Button>
  );
}
