import * as React from 'react';

export function AppointmentsSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-pulse">
      <div className="bg-muted/50 h-12 w-full border-b" />
      <div className="p-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex border-b last:border-0 h-16 items-center px-6 gap-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-4 flex-1 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
