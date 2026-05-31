'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteTreatment, updateTreatment } from './actions';
import { MoreHorizontal, Eye, Plus, Check, Edit, Trash } from 'lucide-react';
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

  const showAddSession = status === 'planned' || status === 'in_progress';
  const showMarkComplete = status === 'planned' || status === 'in_progress';

  return (
    <div className="flex items-center justify-end gap-2">
      
      {/* 1. Quick Action: View */}
      <button
        onClick={() => router.push(`/treatments/${treatmentId}`)}
        className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-semibold hover:bg-muted hover:text-accent-foreground transition-all gap-1 cursor-pointer"
        title="View details"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>View</span>
      </button>

      {/* 2. Quick Action: Add Session */}
      {showAddSession && (
        <button
          onClick={() => router.push(`/treatments/${treatmentId}?add_session=true`)}
          className="inline-flex h-8 items-center justify-center rounded-md bg-primary text-primary-foreground px-2.5 text-xs font-semibold hover:bg-primary/90 transition-all gap-1 cursor-pointer"
          title="Add Session"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+ Session</span>
        </button>
      )}

      {/* 3. Dropdown Menu for secondary operations */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted transition-colors focus-visible:outline-none">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          
          {/* Quick Action: Mark Complete */}
          {showMarkComplete && (
            <DropdownMenuItem 
              onClick={() => updateStatus('completed')} 
              disabled={isPending} 
              className="cursor-pointer text-emerald-600 focus:text-emerald-700 font-semibold"
            >
              <Check className="mr-2 h-4 w-4" /> Mark Complete
            </DropdownMenuItem>
          )}

          {status === 'planned' && (
            <DropdownMenuItem 
              onClick={() => updateStatus('in_progress')} 
              disabled={isPending} 
              className="cursor-pointer text-blue-600 focus:text-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Start Progress
            </DropdownMenuItem>
          )}

          {status !== 'cancelled' && status !== 'completed' && <DropdownMenuSeparator />}
          
          <DropdownMenuItem onClick={() => router.push(`/treatments/${treatmentId}/edit`)} className="cursor-pointer">
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

    </div>
  );
}
