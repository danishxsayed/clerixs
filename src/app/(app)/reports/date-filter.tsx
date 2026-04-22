'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ReportDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRange = searchParams.get('range') || 'this-month';
  const isCustom = rawRange === 'custom' || rawRange.includes('_');
  const [isOpen, setIsOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (rawRange.includes('_')) {
      const [startStr, endStr] = rawRange.split('_');
      return { from: new Date(startStr), to: new Date(endStr) };
    }
    return undefined;
  });

  const handleChange = (val: string | null) => {
    if (!val) return;
    const params = new URLSearchParams(searchParams);
    if (val === 'custom') {
      params.set('range', 'custom');
      setIsOpen(true);
      router.push(`?${params.toString()}`);
    } else {
      params.set('range', val);
      setDate(undefined);
      setIsOpen(false);
      router.push(`?${params.toString()}`);
    }
  };

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
      const start = format(newDate.from, 'yyyy-MM-dd');
      const end = format(newDate.to, 'yyyy-MM-dd');
      const params = new URLSearchParams(searchParams);
      params.set('range', `${start}_${end}`);
      router.push(`?${params.toString()}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
      <Select value={isCustom ? 'custom' : rawRange} onValueChange={handleChange}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Select Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          <SelectItem value="last-6-months">Last 6 Months</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger render={
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a continuous date range</span>
              )}
            </Button>
          } />
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
