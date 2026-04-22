'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  featureKey?: any; // any to avoid circular dependency or import hassle from SubscriptionContext
}

interface ListFilterProps {
  groups: FilterGroup[];
  onClear?: () => void;
  showDatePicker?: boolean;
}

import { useSubscription } from '@/contexts/SubscriptionContext';
import { FeatureLock } from '@/components/subscription/FeatureLock';

export function ListFilter({ groups, onClear, showDatePicker }: ListFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const { hasFeature } = useSubscription();

  // Parse current active filters
  const activeFilters = groups.reduce((acc, group) => {
    acc[group.id] = searchParams.get(group.id) || '';
    return acc;
  }, {} as Record<string, string>);

  const activeCount = Object.values(activeFilters).filter(Boolean).length;
  
  const dateStr = searchParams.get('date');
  const activeDate = React.useMemo(() => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }, [dateStr]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      params.set('date', `${year}-${month}-${day}`);
    } else {
      params.delete('date');
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
    // Keep popover open allowing multiple filter selections
  };

  const handleSelect = (groupId: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (activeFilters[groupId] === value) {
        // Toggle off
        params.delete(groupId);
    } else {
        params.set(groupId, value);
    }
    // Reset pagination to page 1 on filter change
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams);
    groups.forEach((g) => params.delete(g.id));
    params.delete('page');
    if (onClear) onClear();
    router.push(`?${params.toString()}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button variant="outline" className="h-10 border-input bg-background shadow-sm pr-2 pl-2.5">
          <Filter className="mr-2 h-4 w-4" />
          <span className="text-sm">Filters</span>
          {activeCount > 0 && (
            <>
              <div className="mx-2 h-4 w-[1px] bg-border" />
              <span className="rounded-sm bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                {activeCount}
              </span>
            </>
          )}
        </Button>
      } />
      <PopoverContent className="w-[320px] p-4" align="end">
        <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold leading-none">Filters</h4>
             {activeCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted" onClick={clearAll}>
                    Clear all
                </Button>
            )}
        </div>
        <div className="space-y-6">
          {showDatePicker && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Specific Date</span>
                {activeDate && (
                  <button onClick={() => handleDateSelect(undefined)} className="text-[10px] lowercase hover:underline text-muted-foreground flex items-center">
                    clear
                  </button>
                )}
              </Label>
              <div className="flex justify-center border rounded-md bg-transparent p-1">
                <Calendar
                  mode="single"
                  selected={activeDate}
                  onSelect={handleDateSelect}
                  className="rounded-md pointer-events-auto"
                />
              </div>
            </div>
          )}
          {groups.map((group) => {
            const isLocked = group.featureKey && !hasFeature(group.featureKey);
            
            return (
              <div key={group.id} className="space-y-3 relative">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                  <span>{group.label}</span>
                  {isLocked && <span className="text-[10px] text-blue-600 font-medium">Pro</span>}
                </Label>
                
                {isLocked ? (
                  <FeatureLock featureKey={group.featureKey}>
                    <div className="flex flex-wrap gap-2">
                       <Button variant="outline" size="sm" className="h-8 rounded-full border px-3 text-xs pointer-events-none">
                         Locked Option
                       </Button>
                       <Button variant="outline" size="sm" className="h-8 rounded-full border px-3 text-xs pointer-events-none">
                         Locked Option
                       </Button>
                    </div>
                  </FeatureLock>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isActive = activeFilters[group.id] === option.value;
                      return (
                        <Button
                          key={option.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelect(group.id, option.value)}
                          className={`h-8 rounded-full border px-3 text-xs transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                              : 'bg-transparent text-foreground hover:bg-muted'
                          }`}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
