'use client';

import * as React from 'react';
import { MoreHorizontal, UserX, UserCheck, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { updateStaffStatus, removeStaff } from './actions';
import { toast } from 'sonner';

interface StaffRowActionsProps {
  membership: {
    id: string;
    role: string;
    status: string;
    profiles: {
      id: string;
      full_name: string;
    };
  };
  currentUserRole: string; // Only org_owners can mutate
}

export function StaffRowActions({ membership, currentUserRole }: StaffRowActionsProps) {
  const [isPending, startTransition] = React.useTransition();
  const isOwner = currentUserRole === 'org_owner';

  const handleStatusChange = (newStatus: 'active' | 'disabled') => {
    startTransition(async () => {
      const result = await updateStaffStatus(membership.id, newStatus);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`User access ${newStatus === 'active' ? 'restored' : 'disabled'}`);
    });
  };

  const handleRemove = () => {
    if (!confirm('Are you sure you want to permanently remove this user from the organization?')) return;
    
    startTransition(async () => {
      const result = await removeStaff(membership.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('User removed from workspace');
    });
  };

  if (!isOwner) return null; // Hide actions if the current user is not an owner

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      } />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {membership.status === 'active' ? (
             <DropdownMenuItem onClick={() => handleStatusChange('disabled')} className="text-orange-600">
               <UserX className="mr-2 h-4 w-4" />
               Disable Access
             </DropdownMenuItem>
          ) : (
             <DropdownMenuItem onClick={() => handleStatusChange('active')} className="text-emerald-600">
               <UserCheck className="mr-2 h-4 w-4" />
               Restore Access
             </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={handleRemove}
            className="text-destructive focus:bg-destructive focus:!text-white [&>svg]:focus:!text-white group"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="group-focus:text-white">Remove from Clinic</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
