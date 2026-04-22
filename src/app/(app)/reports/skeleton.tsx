import * as React from 'react';

export function ReportSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border bg-muted/20" />
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 h-[400px] rounded-xl border bg-muted/20" />
        <div className="col-span-3 h-[400px] rounded-xl border bg-muted/20" />
      </div>
    </div>
  );
}
