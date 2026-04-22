'use client';

import * as React from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PastAppointmentsTable({ appointments }: { appointments: any[] }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredAppointments = React.useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.title?.toLowerCase().includes(search.toLowerCase()) || false;
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      return (!search || matchesSearch) && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set(appointments.map(a => a.status || 'unknown'));
    return Array.from(statuses) as string[];
  }, [appointments]);

  if (appointments.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map(status => (
              <SelectItem key={status} value={status}>
                <span className="capitalize">{status}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="sticky top-0 bg-background z-10">Date & Time</TableHead>
              <TableHead className="sticky top-0 bg-background z-10">Title</TableHead>
              <TableHead className="sticky top-0 bg-background z-10">Status</TableHead>
              <TableHead className="text-right text-muted-foreground sticky top-0 bg-background z-10">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No past appointments match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((apt: any) => (
                <TableRow key={apt.id}>
                  <TableCell className="text-muted-foreground font-medium">
                    {format(new Date(`${apt.appointment_date}T${apt.start_time}`), 'PPp')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{apt.title || 'Consultation'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-muted-foreground">
                      {apt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <Link href={`/appointments/${apt.id}/summary`} target="_blank" title="Visit Summary">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span>Visit Summary</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/appointments/${apt.id}/edit`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
