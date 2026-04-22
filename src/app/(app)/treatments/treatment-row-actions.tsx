'use client';

import * as React from 'react';
import { MoreHorizontal, Edit, Trash, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteTreatment, updateTreatment } from './actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TreatmentRowActionsProps {
  treatmentId: string;
  status: string;
}

export function TreatmentRowActions({ treatmentId, status }: TreatmentRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this treatment record?')) {
      startTransition(async () => {
        const result = await deleteTreatment(treatmentId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Treatment deleted.');
        }
      });
    }
  };

  const updateStatus = (newStatus: 'planned' | 'in_progress' | 'completed' | 'cancelled') => {
    startTransition(async () => {
      const result = await updateTreatment(treatmentId, { status: newStatus });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Treatment marked as ${newStatus.replace('_', ' ')}.`);
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
        
        {status === 'planned' && (
          <DropdownMenuItem onClick={() => updateStatus('in_progress')} disabled={isPending} className="cursor-pointer text-blue-600 focus:text-blue-700">
            <Clock className="mr-2 h-4 w-4" /> Start Treatment
          </DropdownMenuItem>
        )}
        
        {status === 'in_progress' && (
          <DropdownMenuItem onClick={() => updateStatus('completed')} disabled={isPending} className="cursor-pointer text-green-600 focus:text-green-700">
            <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
          </DropdownMenuItem>
        )}

        {status !== 'cancelled' && status !== 'completed' && <DropdownMenuSeparator />}
        
        <DropdownMenuItem onClick={() => router.push(`/treatments/${treatmentId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" /> Edit Details
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDelete}
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
