import * as React from 'react';

export function LabSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-pulse">
      <div className="bg-muted/50 h-12 w-full border-b" />
      <div className="p-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex border-b last:border-0 h-16 items-center px-6 gap-4">
            <div className="h-4 w-20 bg-muted rounded font-mono" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="flex flex-col gap-2 flex-1">
               <div className="h-4 w-32 bg-muted rounded" />
               <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded-full" />
            <div className="h-8 w-24 bg-muted rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
