import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BlogClient } from '@/components/marketing/BlogClient';

export const metadata = {
  title: 'Blog | Clerixs',
  description: 'Insights, guides, and news about modern clinic management and healthcare technology.',
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col light">
      <Navbar />
      <main className="flex-1">
        <BlogClient />
      </main>
      <Footer />
    </div>
  );
}
