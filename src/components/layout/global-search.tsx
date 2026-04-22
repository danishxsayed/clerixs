'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { globalSearch, SearchResult } from '@/lib/actions/search';
import { useDebounce } from '@/hooks/use-debounce';

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isPending, startTransition] = React.useTransition();

  const debouncedQuery = useDebounce(query, 300);

  // Toggle Command Palette with Cmd+K or Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch results when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      startTransition(async () => {
        const { data, error } = await globalSearch(debouncedQuery);
        if (!error && data) {
          setResults(data);
        } else {
          setResults([]);
        }
      });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(url);
  };

  const patients = results.filter((r) => r.type === 'patient');
  const appointments = results.filter((r) => r.type === 'appointment');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative w-full max-w-lg flex items-center h-10 px-4 rounded-full border border-input bg-muted/40 text-sm shadow-sm transition-colors hover:bg-muted/60",
          "text-muted-foreground justify-between"
        )}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search patients, appointments...</span>
        </div>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type to search..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isPending ? (
              <div className="flex items-center justify-center py-6 text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : query.length < 2 ? (
              "Type at least 2 characters to search"
            ) : (
              "No results found."
            )}
          </CommandEmpty>

          {patients.length > 0 && (
            <CommandGroup heading="Patients">
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.title}
                  onSelect={() => handleSelect(patient.url)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium leading-none">{patient.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">{patient.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {appointments.length > 0 && patients.length > 0 && <CommandSeparator />}

          {appointments.length > 0 && (
            <CommandGroup heading="Appointments">
              {appointments.map((apt) => (
                <CommandItem
                  key={apt.id}
                  value={apt.title}
                  onSelect={() => handleSelect(apt.url)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium leading-none">{apt.title || 'Consultation'}</span>
                    <span className="text-xs text-muted-foreground mt-1">{apt.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
