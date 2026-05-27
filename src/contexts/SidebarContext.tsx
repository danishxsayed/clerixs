'use client';

import * as React from 'react';

interface SidebarContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Load state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('clerixs_sidebar_open');
      if (saved === 'true') {
        setIsMobileOpen(true);
      }
    } catch (err) {
      console.warn('Failed to load sidebar state from localStorage:', err);
    }
  }, []);

  const handleSetIsMobileOpen = (open: boolean) => {
    console.log('SidebarContext: handleSetIsMobileOpen called with:', open);
    setIsMobileOpen(open);
    try {
      localStorage.setItem('clerixs_sidebar_open', String(open));
    } catch (err) {
      console.warn('Failed to save sidebar state to localStorage:', err);
    }
  };

  const toggleMobileSidebar = () => {
    console.log('SidebarContext: toggleMobileSidebar called. Viewport width:', typeof window !== 'undefined' ? window.innerWidth : 'SSR');
    setIsMobileOpen(prev => {
      const next = !prev;
      console.log('SidebarContext: Toggling isMobileOpen state from', prev, 'to', next);
      try {
        localStorage.setItem('clerixs_sidebar_open', String(next));
      } catch (err) {
        console.warn('Failed to save sidebar state to localStorage:', err);
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider 
      value={{ 
        isMobileOpen, 
        setIsMobileOpen: handleSetIsMobileOpen, 
        toggleMobileSidebar 
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
