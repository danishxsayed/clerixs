'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface StatusFilterProps {
  currentStatus: string;
}

export function StatusFilter({ currentStatus }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = React.useState(currentStatus);

  // Sync local state if it changes externally
  React.useEffect(() => {
    setLocalStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (status: string) => {
    if (status === localStatus) return;

    // 1. Update UI instantly
    setLocalStatus(status);

    // 2. Navigation in the background
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'All') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    
    // Always reset page on filter change
    params.delete('page');

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const statuses = ['All', 'Draft', 'Issued', 'Partially Paid', 'Paid'] as const;

  return (
    <div className="flex rounded-md shadow-sm bg-background relative overflow-hidden">
      {statuses.map((status) => {
        const isActive = localStatus === status;
        return (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`px-4 py-2 text-sm font-medium border transition-all whitespace-nowrap ${
              isActive
                ? 'bg-primary text-primary-foreground border-primary z-10'
                : 'bg-background text-muted-foreground border-input hover:bg-muted'
            } ${status === 'All' ? 'rounded-l-md' : ''} ${
              status === 'Paid' ? 'rounded-r-md' : ''
            } ${status !== 'All' ? '-ml-px' : ''} ${
              isPending ? 'opacity-80' : ''
            }`}
          >
            {status}
          </button>
        );
      })}
      {isPending && (
        <div className="absolute top-0 right-0 p-1">
          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
        </div>
      )}
    </div>
  );
}
