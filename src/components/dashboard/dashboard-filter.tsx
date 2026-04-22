'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'month';

  const handleValueChange = (val: string | null) => {
    if (!val) return;
    const params = new URLSearchParams(searchParams);
    if (val === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', val);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentFilter} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[150px] bg-white h-9">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month">This Month</SelectItem>
        <SelectItem value="year">This Year</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  );
}
