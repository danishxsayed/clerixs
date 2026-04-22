'use client';

import * as React from 'react';
import { MoreHorizontal, Edit, Trash, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deletePatient } from './actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PatientRowActionsProps {
  patientId: string;
}

export function PatientRowActions({ patientId }: PatientRowActionsProps) {
  const router = useRouter();
  const [isDeleting, startDelete] = React.useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      startDelete(async () => {
        const result = await deletePatient(patientId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Patient deleted successfully.');
        }
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted transition-colors">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => router.push(`/patients/${patientId}`)}>
          <User className="mr-2 h-4 w-4" /> View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/patients/${patientId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <Trash className="mr-2 h-4 w-4" /> 
          {isDeleting ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
