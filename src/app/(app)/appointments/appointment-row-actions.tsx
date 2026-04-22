'use client';

import * as React from 'react';
import { MoreHorizontal, Edit, Trash, CheckCircle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteAppointment, updateAppointment } from './actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentRowActionsProps {
  appointmentId: string;
  status: string;
}

export function AppointmentRowActions({ appointmentId, status }: AppointmentRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to cancel and delete this appointment?')) {
      startTransition(async () => {
        const result = await deleteAppointment(appointmentId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Appointment deleted.');
        }
      });
    }
  };

  const markCompleted = () => {
    startTransition(async () => {
      const result = await updateAppointment(appointmentId, { status: 'completed' });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Appointment marked as completed.');
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted transition-colors">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {status !== 'completed' && status !== 'cancelled' && (
          <>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); markCompleted(); }} 
              disabled={isPending} 
              className="cursor-pointer text-green-600 focus:text-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/appointments/${appointmentId}`); }}>
          <Edit className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          disabled={isPending}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <Trash className="mr-2 h-4 w-4" /> 
          {isPending ? 'Processing...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
