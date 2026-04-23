'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, History, MessageSquare, Loader2 } from 'lucide-react';
import { addClinicalNote, deleteClinicalNote } from '../actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function ClinicalNotesView({ patientId, initialNotes, patientName }: { patientId: string, initialNotes: any[], patientName: string }) {
  const router = useRouter();
  const [newNote, setNewNote] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    startTransition(async () => {
      const res = await addClinicalNote(patientId, newNote);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Note added');
        setNewNote('');
        router.refresh();
      }
    });
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to remove this note?')) return;
    startTransition(async () => {
      const res = await deleteClinicalNote(noteId, patientId);
      if (res.error) toast.error(res.error);
      else {
        toast.success('Note removed');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add Medical Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddNote} className="space-y-3">
            <Textarea 
              placeholder={`Write a quick update for ${patientName}...`}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
              disabled={isPending}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isPending || !newNote.trim()} className="gap-2 min-w-[100px]">
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
                {isPending ? 'Saving...' : 'Add Note'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Timeline</h3>
        </div>

        {initialNotes.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed text-sm text-muted-foreground">
            No medical notes yet.
          </div>
        ) : (
          <div className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted/50">
            <AnimatePresence initial={false}>
              {initialNotes.map((note) => (
                <motion.div 
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-background border shadow-sm flex items-center justify-center z-10 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  <Card className="hover:shadow-sm transition-shadow group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                           <Avatar className="h-6 w-6">
                             <AvatarImage src={note.author_membership_id?.profile_id?.avatar_url} />
                             <AvatarFallback className="text-[10px] bg-primary/10 text-primary uppercase font-bold">
                               {note.author_membership_id?.profile_id?.full_name?.charAt(0) || 'D'}
                             </AvatarFallback>
                           </Avatar>
                           <div className="text-xs">
                             <span className="font-bold">{note.author_membership_id?.profile_id?.full_name || 'Clinic Staff'}</span>
                             <span className="text-muted-foreground mx-1">•</span>
                             <span className="text-muted-foreground">{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
                           </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          onClick={() => handleDelete(note.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </div>

                      <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-4">
                        {note.note_type}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
