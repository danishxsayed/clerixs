'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export function ClickableTableRow({ 
  href, 
  children, 
  className 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Basic check to ensure we don't navigate if clicking on an interactive element 
    // inside the row (like buttons, links, or dropdown menu items which typically are divs with role="menuitem")
    if (e.target instanceof Element) {
      if (
        e.target.closest('button') || 
        e.target.closest('a') || 
        e.target.closest('[role="menuitem"]') ||
        e.target.closest('[role="menu"]') ||
        e.target.closest('[role="dialog"]') ||
        e.target.closest('form')
      ) {
        return;
      }
    }
    
    router.push(href);
  };

  return (
    <tr 
      onClick={handleClick} 
      className={`cursor-pointer ${className || ''}`}
    >
      {children}
    </tr>
  );
}
