import * as React from 'react';

export function BillingSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-pulse">
      <div className="bg-muted/50 h-10 w-full border-b" />
      <div className="p-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex border-b last:border-0 h-14 items-center px-6 gap-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 flex-1 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded ml-auto text-right" />
            <div className="h-4 w-24 bg-muted rounded text-right" />
            <div className="h-5 w-20 bg-muted rounded-full mx-auto" />
            <div className="h-8 w-10 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
