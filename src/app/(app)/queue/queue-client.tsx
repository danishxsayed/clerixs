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

  const handleUpdateStatus = (id: string, status: any) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const handleRemove = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    setEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (!entry) return prev;
      
      const doctorEntries = prev
        .filter(e => e.doctor_membership_id === entry.doctor_membership_id && e.status === 'waiting')
        .sort((a, b) => a.queue_position - b.queue_position);

      const idx = doctorEntries.findIndex(e => e.id === id);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      
      if (swapIdx < 0 || swapIdx >= doctorEntries.length) return prev;
      
      const otherEntry = doctorEntries[swapIdx];
      
      return prev.map(e => {
        if (e.id === entry.id) return { ...e, queue_position: otherEntry.queue_position };
        if (e.id === otherEntry.id) return { ...e, queue_position: entry.queue_position };
        return e;
      });
    });
  };

  React.useEffect(() => {
    console.log('Registering Realtime listener for queue_entries, org:', organizationId);
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
          console.log('Realtime event received for queue_entries:', payload);
          if (payload.eventType === 'INSERT') {
            // Fetch the full entry with patient details
            const { data: newEntry } = await supabase
              .from('queue_entries')
              .select(`
                *,
                patients (
                  id,
                  full_name,
                  patient_code
                ),
                appointment_id
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (newEntry) {
              console.log('Realtime INSERT: Adding new entry:', newEntry);
              setEntries(prev => {
                if (prev.some(e => e.id === newEntry.id)) return prev;
                return [...prev, newEntry];
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the full updated entry with patient details to ensure DOM updates correctly
            const { data: updatedEntry } = await supabase
              .from('queue_entries')
              .select(`
                *,
                patients (
                  id,
                  full_name,
                  patient_code
                ),
                appointment_id
              `)
              .eq('id', payload.new.id)
              .single();

            if (updatedEntry) {
              console.log('Realtime UPDATE: Updating entry:', updatedEntry);
              setEntries(prev => prev.map(e => e.id === payload.new.id ? updatedEntry : e));
            }
          } else if (payload.eventType === 'DELETE') {
            console.log('Realtime DELETE: Removing entry ID:', payload.old.id);
            setEntries(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up Realtime listener for queue_entries');
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  const doctorColors = [
    'border-t-blue-500 bg-blue-50/30 dark:bg-blue-950/10',
    'border-t-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10',
    'border-t-purple-500 bg-purple-50/30 dark:bg-purple-950/10',
    'border-t-orange-500 bg-orange-50/30 dark:bg-orange-950/10',
    'border-t-pink-500 bg-pink-50/30 dark:bg-pink-950/10',
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
        {initialDoctors.map((doctor, index) => {
          const doctorQueue = entries
            .filter(e => e.doctor_membership_id === doctor.id)
            .sort((a, b) => {
              // Priority: 1. Status (in_consultation first), 2. Position
              const statusOrder: Record<string, number> = { 'in_consultation': 0, 'waiting': 1, 'skipped': 2, 'completed': 3 };
              if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
              return a.queue_position - b.queue_position;
            });

          return (
            <div key={doctor.id} className="flex flex-col h-[60vh] min-h-[400px] md:h-[calc(100vh-250px)] min-w-0">
              <Card className={cn(
                "border-t-4 shadow-sm h-full flex flex-col min-w-0",
                doctorColors[index % doctorColors.length]
              )}>
                <CardHeader className="py-4 px-5 border-b bg-white/50 dark:bg-zinc-900/50">
                  <CardTitle className="text-lg flex items-center justify-between min-w-0 gap-2">
                    <span className="truncate flex-1">Dr. {doctor.profiles.full_name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full font-normal shrink-0">
                      {doctorQueue.filter(e => e.status !== 'completed').length} Waiting
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-3 p-2 sm:p-4">
                      {doctorQueue.length > 0 ? (
                        doctorQueue.map((entry, idx) => (
                           <PatientQueueCard 
                            key={entry.id} 
                            entry={entry} 
                            isFirst={entry.status === 'waiting' && !doctorQueue.some(e => e.status === 'in_consultation' && e.id !== entry.id) && (doctorQueue.findIndex(e => e.status === 'waiting') === idx)}
                            onUpdateStatus={handleUpdateStatus}
                            onRemove={handleRemove}
                            onReorder={handleReorder}
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
        onAddEntry={(newEntry) => {
          console.log('Optimistic / Direct walk-in entry added:', newEntry);
          setEntries(prev => {
            if (prev.some(e => e.id === newEntry.id)) return prev;
            return [...prev, newEntry];
          });
        }}
      />
    </div>
  );
}
