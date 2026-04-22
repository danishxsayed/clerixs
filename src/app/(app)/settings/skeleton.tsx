import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-muted rounded" />
        <div className="h-10 w-40 bg-muted rounded" />
      </div>

      <div className="space-y-6">
        <div className="h-10 w-full max-w-md bg-muted rounded-lg" />
        
        <Card>
          <CardHeader className="border-b">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
