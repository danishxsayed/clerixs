'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, LogIn } from 'lucide-react';
import { checkInToQueue } from '@/app/(app)/queue/actions';
import { toast } from 'sonner';

interface AppointmentActionButtonsProps {
  appointmentId: string;
  currentStatus: string;
}

export function AppointmentActionButtons({ appointmentId, currentStatus }: AppointmentActionButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState(currentStatus);

  React.useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleUpdateStatus = (newStatus: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        const result = await response.json();
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(`Appointment marked as ${newStatus}.`);
          setStatus(newStatus);
        }
      } catch (error) {
        console.error('Update error:', error);
        toast.error('Failed to update appointment status.');
      }
    });
  };

  const handleCheckIn = () => {
    startTransition(async () => {
      const result = await checkInToQueue(appointmentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Patient checked in to queue.`);
        setStatus('checked_in');
      }
    });
  };

  if (status === 'completed' || status === 'cancelled') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
       {status === 'scheduled' && (
         <Button 
           variant="outline" 
           className="border-primary text-primary hover:bg-primary/5"
           onClick={handleCheckIn}
           disabled={isPending}
         >
           <LogIn className="mr-2 h-4 w-4" /> 
           {isPending ? 'Checking In...' : 'Check In'}
         </Button>
       )}

       {/* If it's just 'scheduled', we might want to mark it as 'completed' directly for now */}
       <Button 
         variant="default" 
         className="bg-green-600 hover:bg-green-700"
         onClick={() => handleUpdateStatus('completed')}
         disabled={isPending}
       >
         <CheckCircle className="mr-2 h-4 w-4" /> 
         {isPending ? 'Updating...' : 'Mark Completed'}
       </Button>
       
       <Button 
         variant="destructive"
         onClick={() => {
           if (window.confirm('Are you sure you want to completely cancel this appointment?')) {
             handleUpdateStatus('cancelled');
           }
         }}
         disabled={isPending}
       >
         <XCircle className="mr-2 h-4 w-4" /> 
         Cancel
       </Button>
    </div>
  );
}
