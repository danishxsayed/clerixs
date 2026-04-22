'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ThemeToggle({ isCollapsed }: { isCollapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-10 w-full bg-muted/20 animate-pulse rounded-xl" />;

  const modes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ] as const;

  if (isCollapsed) {
    const activeMode = modes.find(m => m.id === theme) || modes[2];
    const Icon = activeMode.icon;
    
    return (
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <Icon className="h-5 w-5" />
        </button>
    );
  }

  return (
    <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
      {modes.map((mode) => {
        const isActive = theme === mode.id;
        const Icon = mode.icon;
        
        return (
          <button
            key={mode.id}
            onClick={() => setTheme(mode.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              isActive 
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
            <span>{mode.label}</span>
          </button>
        )
      })}
    </div>
  );
}
