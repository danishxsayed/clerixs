'use client';

import * as React from 'react';

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = React.useState('');

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // We use suppressHydrationWarning visually to avoid server/client mismatch alerts in dev,
  // but since we only render after useEffect mounts, returning the generic text initially is safe.
  return (
    <h2 className="text-3xl font-bold tracking-tight">
      {greeting ? `${greeting}, ${name}!` : `Welcome, ${name}!`}
    </h2>
  );
}
