'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ClinicalNotesEditorProps {
  appointmentId: string;
  initialChiefComplaint: string;
  initialNotes: string;
  isActive: boolean;
}

export function ClinicalNotesEditor({ 
  appointmentId, 
  initialChiefComplaint, 
  initialNotes,
  isActive 
}: ClinicalNotesEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [chiefComplaint, setChiefComplaint] = React.useState(initialChiefComplaint || '');
  const [notes, setNotes] = React.useState(initialNotes || '');
  const [isPending, startTransition] = React.useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            treatment: chiefComplaint,
            notes: notes
          }),
        });
        const res = await response.json();

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success('Clinical notes updated');
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Save notes error:', error);
        toast.error('Failed to update clinical notes.');
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="space-y-8 flex-1">
        <div className="group relative space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Chief Complaint / Reason for Visit
            </h4>
            {isActive && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
            )}
          </div>
          <div className="pl-3.5">
            <p className="text-muted-foreground whitespace-pre-wrap">{chiefComplaint || 'No specific reason provided.'}</p>
          </div>
        </div>

        <div className="group relative space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary/80 rounded-full"></span>
              Additional Notes / Observations
            </h4>
            {isActive && !isEditing && (
               <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
            )}
          </div>
          <div className="pl-3.5">
            <p className="text-muted-foreground whitespace-pre-wrap">{notes || 'No additional notes recorded.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chief Complaint</label>
        <Textarea 
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Enter reason for visit..."
          className="min-h-[80px] focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Notes</label>
        <Textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record clinical observations, vitals, etc..."
          className="min-h-[150px] focus-visible:ring-secondary"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
          <X className="h-3 w-3 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="h-3 w-3 mr-1" /> {isPending ? 'Saving...' : 'Save Notes'}
        </Button>
      </div>
    </div>
  );
}
