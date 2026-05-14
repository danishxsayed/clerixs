import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CareersClient } from '@/components/marketing/CareersClient';

export const metadata = {
  title: 'Careers | Clerixs',
  description: 'Join the team building the future of healthcare technology. Explore open roles and life at Clerixs.',
};

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col light">
      <Navbar />
      <main className="flex-1">
        <CareersClient />
      </main>
      <Footer />
    </div>
  );
}
