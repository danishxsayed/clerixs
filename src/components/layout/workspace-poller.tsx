'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function WorkspacePoller() {
  const router = useRouter();

  useEffect(() => {
    // Automatically poll the server every 2 seconds to check if workspace setup is complete
    const interval = setInterval(() => {
      router.refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
