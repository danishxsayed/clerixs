'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function DoctorQueueWidget({ 
  doctorMembershipId,
  organizationId 
}: { 
  doctorMembershipId: string;
  organizationId: string;
}) {
  const [entries, setEntries] = React.useState<any[]>([]);
  const supabase = createClient();

  const fetchQueue = React.useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('doctor_membership_id', doctorMembershipId)
      .gte('created_at', `${today}T00:00:00Z`)
      .order('queue_position', { ascending: true });
    
    if (data) setEntries(data);
  }, [doctorMembershipId, organizationId]);

  React.useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel(`doctor_queue_${doctorMembershipId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `doctor_membership_id=eq.${doctorMembershipId}`,
        },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorMembershipId, fetchQueue]);

  const inConsultation = entries.find(e => e.status === 'in_consultation');
  const waitingEntries = entries.filter(e => e.status === 'waiting');
  const nextUp = waitingEntries[0];
  const completedCount = entries.filter(e => e.status === 'completed').length;

  return (
    <Card className="border border-border shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
      <CardHeader className="py-3 px-4 bg-primary/5 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Live Queue
        </CardTitle>
        <Badge variant="outline" className="bg-white/50 text-[10px] py-0 h-5 font-bold">
          {waitingEntries.length} WAITING
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Currently Checking */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            In Consultation
          </p>
          {inConsultation ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
              <span className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">
                {inConsultation.patient_name}
              </span>
              <Badge className="bg-blue-600">Now</Badge>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic pl-3 border-l-2 border-l-slate-200">No active consultation</p>
          )}
        </div>

        {/* Next Up */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Next Patient
          </p>
          {nextUp ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
              <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                {nextUp.patient_name}
              </span>
              <span className="text-[10px] font-bold text-emerald-600">#{nextUp.queue_position}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic pl-3 border-l-2 border-l-slate-200">Queue is empty</p>
          )}
        </div>

        <Separator className="bg-slate-200/50" />

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Done</p>
                <p className="text-sm font-bold">{completedCount}</p>
             </div>
             <div className="text-center border-l pl-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Wait</p>
                <p className="text-sm font-bold">{waitingEntries.length}</p>
             </div>
           </div>
           
           <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold hover:bg-primary/5 hover:text-primary p-0">
             <Link href="/queue">
               Go to Queue <ChevronRight className="h-3 w-3 ml-1" />
             </Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full", className)} />;
}
