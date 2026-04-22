'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';

export function InvoicePrintActions() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!isClient) {
     return (
        <div className="flex gap-2">
            <button disabled className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-background h-10 px-4 py-2 shadow-sm text-muted-foreground">
                <Printer className="mr-2 h-4 w-4" /> Print Invoice
            </button>
        </div>
     );
  }

  return (
    <div className="flex gap-2 print:hidden">
      <button 
        onClick={handlePrint}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Invoice
      </button>
    </div>
  );
}
