'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { updateAppointment } from './actions';
import { toast } from 'sonner';

interface AppointmentActionButtonsProps {
  appointmentId: string;
  currentStatus: string;
}

export function AppointmentActionButtons({ appointmentId, currentStatus }: AppointmentActionButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleUpdateStatus = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateAppointment(appointmentId, { status: newStatus });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Appointment marked as ${newStatus}.`);
        router.refresh(); // Refresh the server component to pull new status badge
      }
    });
  };

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
       {/* If it's just 'scheduled', we might want to mark it as 'completed' directly for now, 
           or you could add 'checked_in' and 'in_progress' states later */}
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
