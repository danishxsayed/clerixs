import * as React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { LandingClient } from '@/components/marketing/LandingClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Clerixs — Less Paperwork. More Patient Care.',
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col light">
      <Navbar />
      <LandingClient />
      <Footer />
    </div>
  );
}
