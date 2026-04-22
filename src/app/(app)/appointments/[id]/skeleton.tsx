import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';

export function AppointmentSkeleton() {
  return (
    <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full animate-pulse">
      {/* Navigation Header */}
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Appointments</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground font-medium">Details</span>
      </div>

      {/* Main Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-9 w-48 bg-muted rounded" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-6 w-24 bg-muted rounded-full" />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 w-32 bg-muted rounded-md" />
          <div className="h-10 w-40 bg-muted rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-muted/30">
              <div className="h-5 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-6 w-full bg-muted rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="h-px bg-muted w-full" />
              <div className="h-3 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-20 w-full bg-muted rounded" />
              </div>
              <div className="h-px bg-muted w-full" />
              <div className="space-y-4">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-20 w-full bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
