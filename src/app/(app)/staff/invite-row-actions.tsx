'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteInvite } from './actions';
import { toast } from 'sonner';

interface InviteRowActionsProps {
  inviteId: string;
}

export function InviteRowActions({ inviteId }: InviteRowActionsProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return;
    
    startTransition(async () => {
      const result = await deleteInvite(inviteId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Invitation token revoked');
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
      disabled={isPending}
      onClick={handleDelete}
      title="Revoke Invitation"
    >
      <span className="sr-only">Revoke</span>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
