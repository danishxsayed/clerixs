'use client';

import * as React from 'react';
import { MoreHorizontal, FileText, Trash, Send, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteInvoice, updateInvoiceStatus } from './actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvoiceRowActionsProps {
  invoiceId: string;
  status: string;
}

export function InvoiceRowActions({ invoiceId, status }: InvoiceRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this invoice?')) {
      startTransition(async () => {
        const result = await deleteInvoice(invoiceId);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Invoice deleted.');
        }
      });
    }
  };

  const updateStatus = (newStatus: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'void') => {
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, newStatus);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Invoice marked as ${newStatus.replace('_', ' ')}.`);
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
        
        <DropdownMenuItem onClick={() => router.push(`/billing/${invoiceId}`)}>
          <FileText className="mr-2 h-4 w-4" /> View Invoice
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {status === 'draft' && (
          <DropdownMenuItem onClick={() => updateStatus('issued')} disabled={isPending} className="cursor-pointer text-blue-600 focus:text-blue-700">
            <Send className="mr-2 h-4 w-4" /> Mark as Issued
          </DropdownMenuItem>
        )}
        
        {(status === 'draft' || status === 'issued' || status === 'partially_paid') && (
          <DropdownMenuItem onClick={() => updateStatus('paid')} disabled={isPending} className="cursor-pointer text-green-600 focus:text-green-700">
            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
          </DropdownMenuItem>
        )}

        {status !== 'void' && status !== 'paid' && (
          <DropdownMenuItem onClick={() => updateStatus('void')} disabled={isPending} className="cursor-pointer text-orange-600 focus:text-orange-700">
             <XCircle className="mr-2 h-4 w-4" /> Void Invoice
          </DropdownMenuItem>
        )}
        
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
