import * as React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BlogClient } from '@/components/marketing/BlogClient';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Blog | Clerixs',
  description: 'Insights, guides, and news about modern clinic management and healthcare technology.',
};

export const revalidate = 60; // Revalidate cache every 60 seconds (Incremental Static Regeneration)

const fallbackPosts = [
  {
    id: "mock-1",
    title: "How Automation is Reducing Doctor Burnout",
    excerpt: "Discover how modern EMR systems are cutting administrative time by 40% and allowing doctors to focus on clinical excellence.",
    author_name: "Dr. Sarah Jenkins",
    category: "Insights",
    cover_image_url: "/assets/auth-bg.png",
    slug: "how-automation-is-reducing-doctor-burnout",
    created_at: new Date("2026-05-12").toISOString(),
    published_at: new Date("2026-05-12").toISOString(),
    is_published: true,
  },
  {
    id: "mock-2",
    title: "The Future of Patient Communication",
    excerpt: "From WhatsApp integration to AI-powered appointment reminders, learn how to keep your patients engaged and informed.",
    author_name: "Amit Sharma",
    category: "Technology",
    cover_image_url: "/assets/Mock-dash.png",
    slug: "the-future-of-patient-communication",
    created_at: new Date("2026-05-10").toISOString(),
    published_at: new Date("2026-05-10").toISOString(),
    is_published: true,
  },
  {
    id: "mock-3",
    title: "5 Steps to Modernize Your Dental Practice",
    excerpt: "A comprehensive guide for dentists looking to transition from paper-based files to a fully digital workflow.",
    author_name: "Priya Singh",
    category: "Guides",
    cover_image_url: "/assets/patient-profile.png",
    slug: "5-steps-to-modernize-your-dental-practice",
    created_at: new Date("2026-05-08").toISOString(),
    published_at: new Date("2026-05-08").toISOString(),
    is_published: true,
  }
];

export default async function BlogPage() {
  const supabase = await createClient();
  
  let blogs: any[] = [];
  try {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
      
    if (data && data.length > 0) {
      blogs = data;
    } else {
      blogs = fallbackPosts;
    }
  } catch (e) {
    console.error('Failed to load blogs from Supabase, using fallbacks:', e);
    blogs = fallbackPosts;
  }

  return (
    <div className="flex min-h-screen flex-col light bg-white">
      <Navbar />
      <main className="flex-1">
        <BlogClient blogs={blogs} />
      </main>
      <Footer />
    </div>
  );
}
