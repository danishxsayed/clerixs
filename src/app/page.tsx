import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { LandingClient } from '@/components/marketing/LandingClient';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col light">
      <Navbar />
      <LandingClient />
      <Footer />
    </div>
  );
}
