'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreVertical, 
  Play, 
  X, 
  SkipForward, 
  CheckCircle2,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  updateQueueStatus, 
  reorderQueue, 
  removeFromQueue 
} from './actions';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export function PatientQueueCard({ entry, isFirst }: { entry: any, isFirst: boolean }) {
  const [isPending, setIsPending] = React.useState(false);

  const handleStatus = async (status: any) => {
    setIsPending(true);
    const result = await updateQueueStatus(entry.id, status);
    if (result.error) toast.error(result.error);
    setIsPending(false);
  };

  const handleReorder = async (direction: 'up' | 'down') => {
    setIsPending(true);
    const result = await reorderQueue(entry.id, direction);
    if (result.error) toast.error(result.error);
    setIsPending(false);
  };

  const handleRemove = async () => {
    if (!confirm('Remove this patient from the queue?')) return;
    setIsPending(true);
    const result = await removeFromQueue(entry.id);
    if (result.error) toast.error(result.error);
    setIsPending(false);
  };

  const statusStyles = {
    waiting: 'border-l-4 border-l-slate-300 bg-white hover:border-l-slate-400',
    in_consultation: 'border-blue-500 bg-blue-50 shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:bg-blue-900/10',
    completed: 'opacity-60 bg-slate-50 border-slate-200 grayscale-[0.5]',
    skipped: 'border-l-4 border-l-orange-400 bg-orange-50/30'
  };

  const isCompleted = entry.status === 'completed';
  const isInConsultation = entry.status === 'in_consultation';

  return (
    <div className={cn(
      "relative group p-2 sm:p-4 rounded-xl border transition-all duration-300",
      statusStyles[entry.status as keyof typeof statusStyles],
      isFirst && entry.status === 'waiting' && "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20",
      isPending && "opacity-50 pointer-events-none"
    )}>
      <div className="flex items-start justify-between gap-1 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 min-w-0">
            <span className={cn(
              "text-[9px] sm:text-xs font-bold w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shrink-0",
              isCompleted ? "bg-slate-200 text-slate-500 line-through" : "bg-primary/10 text-primary"
            )}>
              {entry.queue_position}
            </span>
            <p className={cn(
              "font-bold truncate text-[11px] sm:text-sm",
              isCompleted && "text-slate-500"
            )}>
              {entry.patient_name || entry.patients?.full_name}
            </p>
            {entry.is_walkin && (
              <Badge variant="secondary" className="text-[8px] sm:text-[10px] py-0 px-1 h-3 sm:h-4 bg-orange-100 text-orange-700 border-orange-200 uppercase font-bold tracking-tighter shrink-0">
                Walk-in
              </Badge>
            )}
            {isFirst && entry.status === 'waiting' && (
              <Badge variant="default" className="text-[8px] sm:text-[10px] py-0 px-1 h-3 sm:h-4 bg-emerald-500 uppercase font-bold tracking-tighter shrink-0">
                Next
              </Badge>
            )}
            {isInConsultation && (
               <span className="flex h-1 w-1 sm:h-2 sm:w-2 relative shrink-0">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-1 w-1 sm:h-2 sm:w-2 bg-blue-500"></span>
               </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 text-[9px] sm:text-[11px] text-muted-foreground">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
              <span>Checked in {formatDistanceToNow(new Date(entry.checked_in_at))} ago</span>
            </div>
            {entry.status === 'waiting' && isFirst && (
               <div className="flex items-center gap-0.5 sm:gap-1 font-semibold text-emerald-600">
                 <Play className="h-2 w-2 sm:h-3 sm:w-3 fill-emerald-600" />
                 <span>Doctor is ready</span>
               </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-0.5 sm:gap-1 shrink-0">
          {!isCompleted && (
            <div className="flex items-center gap-0.5 sm:gap-1">
               {entry.status === 'waiting' && (
                 <>
                   <Button 
                     size="icon" 
                     variant="ghost" 
                     className="h-5 w-5 sm:h-7 sm:w-7 rounded-full text-slate-400 hover:text-slate-600"
                     onClick={() => handleReorder('up')}
                   >
                     <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                   </Button>
                   <Button 
                     size="icon" 
                     variant="ghost" 
                     className="h-5 w-5 sm:h-7 sm:w-7 rounded-full text-slate-400 hover:text-slate-600"
                     onClick={() => handleReorder('down')}
                   >
                     <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                   </Button>
                 </>
               )}
               
               <DropdownMenu>
                 <DropdownMenuTrigger render={
                    <Button size="icon" variant="ghost" className="h-5 w-5 sm:h-7 sm:w-7 rounded-full">
                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                 } />
                 <DropdownMenuContent align="end">
                   {entry.status === 'waiting' && isFirst && (
                     <DropdownMenuItem onClick={() => handleStatus('in_consultation')} className="text-emerald-600 font-bold">
                       <Play className="h-4 w-4 mr-2" /> Call Next
                     </DropdownMenuItem>
                   )}
                   {entry.status === 'in_consultation' && (
                     <DropdownMenuItem onClick={() => handleStatus('completed')} className="text-primary font-bold">
                       <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
                     </DropdownMenuItem>
                   )}
                   {entry.status === 'waiting' && !isFirst && (
                      <DropdownMenuItem onClick={() => handleStatus('in_consultation')}>
                        <Play className="h-4 w-4 mr-2" /> Move & Call
                      </DropdownMenuItem>
                   )}
                   {entry.status !== 'skipped' && entry.status !== 'completed' && (
                     <DropdownMenuItem onClick={() => handleStatus('skipped')}>
                       <SkipForward className="h-4 w-4 mr-2" /> Skip Patient
                     </DropdownMenuItem>
                   )}
                   <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                     <X className="h-4 w-4 mr-2" /> Remove from Queue
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          )}
          
          {entry.status === 'waiting' && isFirst && (
             <Button 
               size="sm" 
               className="h-5.5 sm:h-7 px-1.5 sm:px-3 text-[9px] sm:text-[11px] bg-emerald-600 hover:bg-emerald-700 shadow-sm animate-pulse-subtle"
               onClick={() => handleStatus('in_consultation')}
             >
               Call Next
             </Button>
          )}
        </div>
      </div>
      
      {entry.status === 'completed' && (
        <div className="absolute right-3 bottom-2">
           <CheckCircle2 className="h-5 w-5 text-slate-300" />
        </div>
      )}
    </div>
  );
}
