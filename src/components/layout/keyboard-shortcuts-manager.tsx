'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Keyboard, Command, Save, Printer, X, HelpCircle, Plus } from 'lucide-react';

export function KeyboardShortcutsManager() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;

      // Escape - Close modals (works everywhere)
      if (e.key === 'Escape') {
        // Most modals handles Escape naturally via headless UI/Radix, 
        // but we can trigger a global click on close buttons if needed
        return;
      }

      // Ctrl+S - Save current form (works everywhere)
      if (isMod && e.key === 's') {
        e.preventDefault();
        const activeForm = document.querySelector('form');
        if (activeForm) {
          const submitBtn = activeForm.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitBtn) {
            submitBtn.click();
            toast.success('Saving changes...', { duration: 1000 });
          }
        }
        return;
      }

      // Skip other shortcuts if typing in input
      if (isInput) return;

      // Ctrl+N - Contextual New
      if (isMod && e.key === 'n') {
        e.preventDefault();
        
        // Priority 1: Trigger specific button if it exists
        const addBtn = document.querySelector('[data-shortcut="new"]') as HTMLElement;
        if (addBtn) {
          addBtn.click();
          return;
        }

        // Priority 2: Semantic navigation based on pathname
        if (pathname.includes('/appointments')) {
          router.push('/appointments/new');
        } else if (pathname.includes('/patients')) {
          router.push('/patients/new');
        } else if (pathname.includes('/treatments')) {
          router.push('/treatments/new');
        } else if (pathname.includes('/branches')) {
          router.push('/branches/new');
        } else if (pathname.includes('/lab')) {
          router.push('/lab/new');
        } else if (pathname.endsWith('prescriptions')) {
           // If on patient prescriptions list, go to new
           router.push(`${pathname}/new`);
        }
        return;
      }

      // Ctrl+P - Print
      if (isMod && e.key === 'p') {
        const printBtn = document.querySelector('[data-shortcut="print"]') as HTMLElement || document.querySelector('button:contains("Print")') as HTMLElement;
        if (printBtn) {
          e.preventDefault();
          printBtn.click();
          toast.info('Preparing document for print...');
        }
        return;
      }

      // Ctrl+/ - Help
      if (isMod && e.key === '/') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }
    };

    const handleOpenHelp = () => setIsHelpOpen(true);
    window.addEventListener('open-shortcuts-help', handleOpenHelp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-shortcuts-help', handleOpenHelp);
    };
  }, [pathname, router]);

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" /> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <ShortcutRow 
            icon={<Plus className="h-4 w-4" />} 
            label="New (Appointment / Patient)" 
            keys={['⌘/Ctrl', 'N']} 
          />
          <ShortcutRow 
            icon={<Save className="h-4 w-4" />} 
            label="Save Changes" 
            keys={['⌘/Ctrl', 'S']} 
          />
          <ShortcutRow 
            icon={<Printer className="h-4 w-4" />} 
            label="Print PDF / Report" 
            keys={['⌘/Ctrl', 'P']} 
          />
          <ShortcutRow 
            icon={<Command className="h-4 w-4" />} 
            label="Global Search" 
            keys={['⌘/Ctrl', 'K']} 
          />
          <ShortcutRow 
            icon={<X className="h-4 w-4" />} 
            label="Close Modal" 
            keys={['Esc']} 
          />
          <ShortcutRow 
            icon={<HelpCircle className="h-4 w-4" />} 
            label="Show this help" 
            keys={['⌘/Ctrl', '/']} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ icon, label, keys }: { icon: React.ReactNode, label: string, keys: string[] }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd key={key} className="pointer-events-none h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 flex min-w-[24px] justify-center">
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
