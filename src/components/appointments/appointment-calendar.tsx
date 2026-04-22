'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppointmentCalendarProps {
  appointments: any[];
}

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getAppointmentsForDay = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === formattedDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'cancelled':
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'confirmed':
      case 'checked_in':
      case 'in_progress':
      case 'scheduled':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold tracking-tight capitalize">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-x-auto min-w-[700px]">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-muted/10">
          {days.map((day, idx) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-1 border-r border-b last-in-row:border-r-0 flex flex-col gap-1 transition-colors relative group ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                } hover:bg-muted/50`}
              >
                {/* Clickable area for empty cell to add appointment */}
                <div 
                   className="absolute inset-0 z-0 cursor-pointer"
                   onClick={() => router.push(`/appointments/new?appointment_date=${format(day, 'yyyy-MM-dd')}`)}
                   title="Click to schedule an appointment for this day"
                />

                {/* Day Header */}
                <div className="flex justify-between items-start pt-1 px-1 z-10 pointer-events-none">
                  <span
                    className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                      isCurrentDay
                        ? 'bg-primary text-primary-foreground'
                        : !isCurrentMonth
                        ? 'text-muted-foreground/50'
                        : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {dayAppointments.length} apt{dayAppointments.length !== 1 && 's'}
                    </span>
                  )}
                </div>

                {/* Appointment Cards */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-1 pb-1 z-10">
                  {dayAppointments.slice(0, 4).map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/appointments/${apt.id}`}
                      className={`text-xs px-2 py-1.5 rounded-md border flex flex-col transition-colors cursor-pointer ${getStatusColor(apt.status)}`}
                      title={`${apt.patients?.full_name} - ${apt.chief_complaint || 'Consultation'}`}
                    >
                      <div className="flex justify-between items-center gap-1 font-semibold truncate leading-none">
                        <span className="truncate">{apt.start_time?.slice(0, 5)}</span>
                      </div>
                      <div className="font-medium truncate mt-0.5 leading-tight">
                        {apt.patients?.full_name}
                      </div>
                    </Link>
                  ))}
                  {dayAppointments.length > 4 && (
                    <div className="text-[10px] text-muted-foreground font-medium text-center py-0.5 bg-background border rounded-md shadow-sm pointer-events-none">
                      +{dayAppointments.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
