'use client';

import * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AutoRenewalToggleProps {
  subscriptionId: string;
  initialEnabled: boolean;
}

export function AutoRenewalToggle({ subscriptionId, initialEnabled }: AutoRenewalToggleProps) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/toggle-auto-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, enabled: checked }),
      });

      if (!response.ok) throw new Error('Failed to update auto-renewal');

      setEnabled(checked);
      toast.success(checked ? 'Auto-renewal enabled' : 'Auto-renewal disabled');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update auto-renewal settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-background border px-4 py-3 rounded-lg shadow-sm">
      <Switch 
        id="auto-renewal" 
        checked={enabled} 
        onCheckedChange={handleToggle} 
        disabled={loading}
      />
      <div className="flex flex-col">
        <Label htmlFor="auto-renewal" className="font-bold text-sm flex items-center gap-1.5 cursor-pointer">
          Auto-Renewal
          {loading && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
        </Label>
        <p className="text-[11px] text-muted-foreground font-medium">
          {enabled ? 'Automatically renew access' : 'Manual renewal required'}
        </p>
      </div>
    </div>
  );
}
