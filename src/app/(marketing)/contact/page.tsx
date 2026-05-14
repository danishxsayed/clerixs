import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { ContactClient } from '@/components/marketing/ContactClient';

export const metadata = {
  title: 'Contact Us | Clerixs',
  description: 'Have questions or need support? Reach out to our team at Clerixs.',
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col light">
      <Navbar />
      <main className="flex-1">
        <ContactClient />
      </main>
      <Footer />
    </div>
  );
}
