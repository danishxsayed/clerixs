import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PatientSkeleton() {
  return (
    <div className="flex-1 space-y-8 max-w-7xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-muted rounded-full" />
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-10 w-32 bg-muted rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column Skeleton */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-4 w-4 bg-muted rounded mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column Skeleton */}
        <div className="md:col-span-2 space-y-6">
          <div className="h-10 w-full bg-muted rounded-lg" />
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="h-12 w-full bg-muted/50 rounded-lg" />
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
