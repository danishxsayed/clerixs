'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Users, Search, Filter } from 'lucide-react';
import { PatientQueueCard } from './patient-queue-card';
import { AddWalkinDialog } from './add-walkin-dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function QueueClient({ 
  initialDoctors, 
  initialEntries,
  organizationId
}: { 
  initialDoctors: any[], 
  initialEntries: any[],
  organizationId: string
}) {
  const [entries, setEntries] = React.useState(initialEntries);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    const channel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the full entry with patient details
            const { data: newEntry } = await supabase
              .from('queue_entries')
              .select('*, patients(*)')
              .eq('id', payload.new.id)
              .single();
            if (newEntry) setEntries(prev => [...prev, newEntry]);
          } else if (payload.eventType === 'UPDATE') {
            setEntries(prev => prev.map(e => e.id === payload.new.id ? { ...e, ...payload.new } : e));
          } else if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(e => e.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  const doctorColors = [
    'border-t-blue-500 bg-blue-50/30',
    'border-t-emerald-500 bg-emerald-50/30',
    'border-t-purple-500 bg-purple-50/30',
    'border-t-orange-500 bg-orange-50/30',
    'border-t-pink-500 bg-pink-50/30',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          data-shortcut="new"
          title="Add Walk-in (⌘N)"
          onClick={() => setIsAddOpen(true)} 
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Walk-in
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {initialDoctors.map((doctor, index) => {
          const doctorQueue = entries
            .filter(e => e.doctor_membership_id === doctor.id)
            .sort((a, b) => {
              // Priority: 1. Status (in_consultation first), 2. Position
              const statusOrder = { 'in_consultation': 0, 'waiting': 1, 'skipped': 2, 'completed': 3 };
              if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
              return a.queue_position - b.queue_position;
            });

          return (
            <div key={doctor.id} className="flex flex-col h-[calc(100vh-250px)]">
              <Card className={cn(
                "border-t-4 shadow-sm h-full flex flex-col",
                doctorColors[index % doctorColors.length]
              )}>
                <CardHeader className="py-4 px-5 border-b bg-white/50">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">Dr. {doctor.profiles.full_name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full font-normal">
                      {doctorQueue.filter(e => e.status !== 'completed').length} Waiting
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full px-4 py-4">
                    <div className="space-y-3">
                      {doctorQueue.length > 0 ? (
                        doctorQueue.map((entry, idx) => (
                          <PatientQueueCard 
                            key={entry.id} 
                            entry={entry} 
                            isFirst={entry.status === 'waiting' && !doctorQueue.some(e => e.status === 'in_consultation' && e.id !== entry.id) && (doctorQueue.findIndex(e => e.status === 'waiting') === idx)}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-60">
                          <Users className="h-10 w-10 mb-3" />
                          <p className="text-sm">No patients in queue.</p>
                          <p className="text-[10px]">Add walk-in or check in appointments.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <AddWalkinDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        doctors={initialDoctors} 
      />
    </div>
  );
}
