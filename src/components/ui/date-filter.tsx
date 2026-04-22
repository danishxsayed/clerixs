'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateFilterProps {
  paramName?: string;
  placeholder?: string;
}

export function DateFilter({ paramName = 'date', placeholder = 'Pick a date' }: DateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get(paramName);
  
  // Try to parse the URL parameter as a Date
  const dateValue = React.useMemo(() => {
    if (!dateParam) return undefined;
    const parsed = new Date(dateParam);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [dateParam]);

  const handleSelect = (selectedDate: Date | undefined) => {
    const params = new URLSearchParams(searchParams);
    if (selectedDate) {
      // Format as YYYY-MM-DD in local time
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      params.set(paramName, `${year}-${month}-${day}`);
    } else {
      params.delete(paramName);
    }
    // Remove group/filter options if 'date' is used so they don't combat each other
    if (paramName === 'date' && searchParams.get('date')) {
        // Assuming if param is date it conflicts with predefined 'date' group options
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant={'outline'}
          className={cn(
            'h-10 justify-start text-left font-normal border-input shadow-sm bg-background min-w-[200px]',
            !dateValue && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, 'PPP') : <span>{placeholder}</span>}
          {dateValue && (
            <div 
              role="button" 
              onClick={clearDate} 
              className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear date</span>
            </div>
          )}
        </Button>
      } />
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
