'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface VerificationOverlayProps {
  redirectPath?: string;
}

export function VerificationOverlay({ redirectPath }: VerificationOverlayProps) {
  const { isExpired, subscription } = useSubscription();

  if (!isExpired) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
      
      <Card className="relative w-full max-w-lg shadow-2xl border-2 border-primary/20 animate-in zoom-in-95 duration-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Subscription Required</CardTitle>
          <CardDescription>
            Your access to premium features has been restricted because your subscription is inactive or has expired.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 border border-dashed text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Current Status: <span className="capitalize">{subscription?.status || 'Expired'}</span></p>
                <p className="text-muted-foreground leading-relaxed">
                  To continue using WhatsApp Management, Bulk Import, and Advanced Reporting, please renew your subscription.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto shadow-lg shadow-primary/20">
            <Link href="/pricing">
              <Rocket className="mr-2 h-4 w-4" />
              Upgrade Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
