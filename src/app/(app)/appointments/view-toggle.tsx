'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface ViewToggleProps {
  currentView: string;
  query?: string;
  statusFilter?: string;
}

export function ViewToggle({ currentView, query, statusFilter }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localView, setLocalView] = React.useState(currentView);

  // Sync local state with URL if it changes externally
  React.useEffect(() => {
    setLocalView(currentView);
  }, [currentView]);

  const handleViewChange = (view: string) => {
    if (view === localView) return;
    
    // 1. Update UI instantly
    setLocalView(view);
    
    // 2. Navigation in the background
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex bg-muted p-1 rounded-lg relative overflow-hidden">
      <button
        onClick={() => handleViewChange('list')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all z-10 ${
          localView !== 'calendar' 
            ? 'bg-background shadow-sm text-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        disabled={isPending && localView === 'list'}
      >
        List
      </button>
      <button
        onClick={() => handleViewChange('calendar')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all z-10 ${
          localView === 'calendar' 
            ? 'bg-background shadow-sm text-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        disabled={isPending && localView === 'calendar'}
      >
        Calendar
      </button>
      {isPending && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center animate-pulse" />
      )}
    </div>
  );
}
