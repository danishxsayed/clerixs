'use client';

import * as React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" disabled className="bg-primary hover:bg-primary/90 text-transparent opacity-50">
        <Printer className="mr-2 h-4 w-4" /> Print PDF
      </Button>
    );
  }

  return (
    <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90">
      <Printer className="mr-2 h-4 w-4" /> Print PDF
    </Button>
  );
}
