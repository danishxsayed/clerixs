import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { AboutClient } from '@/components/marketing/AboutClient';

export const metadata = {
  title: 'About Us | Clerixs',
  description: 'Learn about the mission, values, and the team behind Clerixs — the modern OS for healthcare.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col light">
      <Navbar />
      <main className="flex-1">
        <AboutClient />
      </main>
      <Footer />
    </div>
  );
}
