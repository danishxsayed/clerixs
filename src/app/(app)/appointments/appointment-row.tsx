'use client';

import * as React from 'react';
import { ClickableTableRow } from '@/components/ui/clickable-table-row';
import { AppointmentRowActions } from './appointment-row-actions';

interface AppointmentRowProps {
  app: any;
}

export function AppointmentRow({ app }: AppointmentRowProps) {
  const [status, setStatus] = React.useState(app.status);

  if (status === 'deleted') {
    return null; // Instantly hide deleted rows
  }

  return (
    <ClickableTableRow 
      href={`/appointments/${app.id}`}
      className="hover:bg-muted/50 transition-colors"
    >
      <td className="px-6 py-4 font-medium">{app.appointment_date}</td>
      <td className="px-6 py-4">{app.start_time?.slice(0, 5)}</td>
      <td className="px-6 py-4 font-medium">{app.patients?.full_name}</td>
      <td className="px-6 py-4 text-muted-foreground">{app.treatment || 'Consultation'}</td>
      <td className="px-6 py-4">
        {app.organization_memberships?.profiles?.full_name 
          ? `Dr. ${app.organization_memberships.profiles.full_name}` 
          : 'Unassigned'}
      </td>
      <td className="px-6 py-4">
        <span 
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize 
            ${status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
            ${status === 'completed' ? 'bg-green-100 text-green-800' : ''}
            ${status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
            ${status === 'checked_in' ? 'bg-amber-100 text-amber-800' : ''}
            ${status === 'in-waiting' ? 'bg-emerald-100 text-emerald-800' : ''}
          `}
        >
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <AppointmentRowActions 
          appointmentId={app.id} 
          status={status} 
          onStatusChange={setStatus} 
        />
      </td>
    </ClickableTableRow>
  );
}
