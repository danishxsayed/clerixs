import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDateRangeBounds(filterValue: string): { start?: Date; end?: Date } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  todayEnd.setMilliseconds(todayEnd.getMilliseconds() - 1);

  // If the filter is a specific date like "2024-03-26"
  if (/^\d{4}-\d{2}-\d{2}$/.test(filterValue)) {
    const [year, month, day] = filterValue.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + 1);
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start, end };
  }

  // If the filter is a custom range like "YYYY-MM-DD_YYYY-MM-DD"
  if (filterValue.includes('_')) {
    const [startStr, endStr] = filterValue.split('_');
    const start = new Date(startStr);
    const end = new Date(endStr);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  switch (filterValue) {
    case 'today':
      return { start: todayStart, end: todayEnd };
    case 'upcoming': {
      const next7 = new Date(todayStart);
      next7.setDate(next7.getDate() + 7);
      return { start: todayStart, end: next7 };
    }
    case 'last7': {
      const past7 = new Date(todayStart);
      past7.setDate(past7.getDate() - 7);
      return { start: past7, end: todayEnd };
    }
    case 'this-week': {
      // Start of current week (assuming Monday start for typical clinic reports, or Sunday)
      const weekStart = new Date(todayStart);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      weekStart.setDate(diff);
      return { start: weekStart, end: todayEnd };
    }
    case 'this-month':
    case 'month':
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: todayEnd };
    case 'last-3-months': {
      const past3Mo = new Date(todayStart);
      past3Mo.setMonth(past3Mo.getMonth() - 3);
      return { start: past3Mo, end: todayEnd };
    }
    case 'last-6-months': {
      const past6Mo = new Date(todayStart);
      past6Mo.setMonth(past6Mo.getMonth() - 6);
      return { start: past6Mo, end: todayEnd };
    }
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1), end: todayEnd };
    case 'past':
      return { end: todayStart };
    default:
      return {};
  }
}
