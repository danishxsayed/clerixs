import { ShareButton } from '@/components/marketing/ShareButton';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Calendar, User, ArrowLeft, BookOpen, Share2, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60; // ISR cache revalidation every 60s

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Custom Markdown to HTML converter (mirrors the editor client compiler for consistency)
function renderMarkdown(md: string): string {
  if (!md) return '';
  
  let html = md;
  
  // 1. Escaping basic HTML to prevent injection
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // 2. Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-slate-900 text-slate-100 p-5 rounded-2xl my-6 overflow-x-auto text-xs font-mono shadow-inner border border-white/5">${code.trim()}</pre>`;
  });
  
  // 3. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // 4. Images (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-3xl border shadow-lg my-8 max-h-[500px] w-full object-cover mx-auto hover:shadow-2xl transition-all duration-300" />');
  
  // 5. Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 font-bold underline hover:text-blue-800 transition-colors">$1</a>');
  
  // 6. Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-3 text-slate-800 flex items-center gap-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black mt-10 mb-4 text-slate-900 border-b pb-2 border-slate-100">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black mt-12 mb-6 text-slate-900 tracking-tight">$1</h1>');
  
  // 7. Blockquotes (> text)
  html = html.replace(/^\s*&gt;\s?(.*$)/gim, '<blockquote class="border-l-4 border-blue-600 pl-6 py-2 my-6 bg-blue-50/40 rounded-r-2xl italic text-slate-700 font-medium">$1</blockquote>');
  
  // 8. Bullet lists (- list item)
  html = html.replace(/^\s*-\s(.*$)/gim, '<li class="list-disc ml-6 my-2 text-slate-700 font-semibold">$1</li>');
  
  // 9. Bold (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 10. Italic (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // 11. Paragraphs (split by double newlines)
  const lines = html.split(/\n\n+/);
  const formattedLines = lines.map(line => {
    if (
      line.trim().startsWith('<h') || 
      line.trim().startsWith('<pre') || 
      line.trim().startsWith('<blockquote') || 
      line.trim().startsWith('<li') ||
      line.trim().startsWith('<img')
    ) {
      return line;
    }
    return `<p class="my-4 text-slate-700 leading-relaxed font-semibold text-base">${line.replace(/\n/g, '<br />')}</p>`;
  });
  
  return formattedLines.join('\n');
}

const fallbackPostDetails: Record<string, any> = {
  "how-automation-is-reducing-doctor-burnout": {
    title: "How Automation is Reducing Doctor Burnout",
    excerpt: "Discover how modern EMR systems are cutting administrative time by 40% and allowing doctors to focus on clinical excellence.",
    author_name: "Dr. Sarah Jenkins",
    category: "Insights",
    cover_image_url: "/assets/auth-bg.png",
    slug: "how-automation-is-reducing-doctor-burnout",
    content: `# The Crisis of Burnout in Modern Medicine

Clinical burnout is at an all-time high, with over 50% of doctors reporting feelings of severe fatigue and administrative overload. Modern healthcare practitioners spend more time documenting than treating patients.

## Enter EMR Automation

By leveraging automated charting templates, smart prescriptions, and clinic queues, we can dramatically reduce the friction in medical workflows.

- **Electronic Health Records (EMR)**: Store details instantly without writing.
- **Smart Reminders**: WhatsApp triggers reduce patient no-show rates.
- **Dynamic Scheduling**: Minimizes clinic wait times and streamlines checkups.

> Reducing administrative workloads by just 20% increases patient face-to-face time by over 1.5 hours daily.

Technology shouldn't get in the way of care — it should enable it.`,
    published_at: new Date("2026-05-12").toISOString(),
  },
  "the-future-of-patient-communication": {
    title: "The Future of Patient Communication",
    excerpt: "From WhatsApp integration to AI-powered appointment reminders, learn how to keep your patients engaged and informed.",
    author_name: "Amit Sharma",
    category: "Technology",
    cover_image_url: "/assets/Mock-dash.png",
    slug: "the-future-of-patient-communication",
    content: `# Rethinking Patient Channels

Traditional patient communication relies on phone calls and paper slips. Today, over 90% of active mobile users prefer instant messenger channels like WhatsApp.

## Why WhatsApp Works for Clinics

Patient engagement is the key to clinical retention. By sending automated, friendly WhatsApp alerts:

- **Reduce No-Shows**: Automatic reminder triggers with confirm/cancel buttons.
- **Instant Digital Prescriptions**: Send PDF prescriptions straight to patient devices.
- **Billing Confirmations**: Clear, itemized invoices shared instantly.

> Engaging patients on their preferred channel results in a 65% reduction in appointment cancellations.`,
    published_at: new Date("2026-05-10").toISOString(),
  },
  "5-steps-to-modernize-your-dental-practice": {
    title: "5 Steps to Modernize Your Dental Practice",
    excerpt: "A comprehensive guide for dentists looking to transition from paper-based files to a fully digital workflow.",
    author_name: "Priya Singh",
    category: "Guides",
    cover_image_url: "/assets/patient-profile.png",
    slug: "5-steps-to-modernize-your-dental-practice",
    content: `# Transitioning to a Digital Dental Workflow

Many dental clinics still use paper charts, cardboard files, and analog scheduling boards. This slows down check-in and impacts clinic throughput.

## The 5 Crucial Modernization Steps

1. **Adopt a Cloud EMR**: Manage all appointments and records from any device safely.
2. **Digitize Treatment Plans**: Draw treatments and teeth records in a visual tooth-chart interface.
3. **Automate Appointment Reminders**: Never waste staff hours calling patients to confirm.
4. **Offer Online Booking**: Let patients reserve slots directly from your website or social media.
5. **Implement SMS/WhatsApp Billing**: Provide easy online payment methods.

> Going fully digital decreases clinic administrative overhead by 35% within the first month.`,
    published_at: new Date("2026-05-08").toISOString(),
  }
};

// Next.js Dynamic SEO Metadata generator
export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  let blog = null;
  try {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .eq('is_published', true)
      .maybeSingle();
    blog = data;
  } catch (e) {
    console.error(e);
  }

  // Fallback to mock posts if not in database
  if (!blog) {
    blog = fallbackPostDetails[resolvedParams.slug];
  }

  if (!blog) {
    return {
      title: 'Not Found | Clerixs',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${blog.meta_title || blog.title} | Clerixs Blog`,
    description: blog.meta_description || blog.excerpt,
    keywords: blog.keywords || [],
    openGraph: {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt,
      type: 'article',
      publishedTime: blog.published_at || blog.created_at,
      authors: [blog.author_name],
      images: [
        {
          url: blog.cover_image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
          width: 800,
          height: 600,
          alt: blog.title,
        }
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  let blog = null;
  try {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .eq('is_published', true)
      .maybeSingle();
    blog = data;
  } catch (e) {
    console.error(e);
  }

  // Fallback to mock posts if not found in database
  if (!blog) {
    blog = fallbackPostDetails[resolvedParams.slug];
  }

  if (!blog) {
    notFound();
  }

  const coverImage = blog.cover_image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop';
  const formattedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(blog.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Structured JSON-LD Schema markup for Google Rich Search Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": coverImage,
    "datePublished": blog.published_at || blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "author": {
      "@type": "Person",
      "name": blog.author_name
    },
    "description": blog.excerpt,
    "publisher": {
      "@type": "Organization",
      "name": "Clerixs",
      "logo": {
        "@type": "ImageObject",
        "url": "https://clerixs.com/assets/logo.png"
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col light bg-white">
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 py-12 bg-slate-50/50">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          
          {/* Back Nav Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mb-8 cursor-pointer group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to Journal</span>
          </Link>

          {/* Glassmorphic Blog Shell */}
          <article className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            {/* Featured Image */}
            <div className="relative aspect-[21/9] w-full border-b border-slate-100 bg-slate-100 overflow-hidden">
              <Image
                src={coverImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
                unoptimized={coverImage.startsWith('http')}
              />
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-blue-600 shadow-sm border border-white/20">
                {blog.category}
              </div>
            </div>

            {/* Content Container */}
            <div className="p-8 md:p-12 space-y-8">
              
              {/* Floating Meta Headers */}
              <div className="space-y-4 border-b border-slate-100 pb-8">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  {blog.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-300" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-300" />
                    <span>{blog.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-slate-300" />
                    <span>5 Min Read</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Styled Markdown Content */}
              <div 
                className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:font-semibold prose-p:text-slate-700 prose-p:leading-relaxed prose-li:font-semibold prose-li:text-slate-700 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
              />

              {/* Footer Section: Tags & Share */}
              {((blog.tags && blog.tags.length > 0) || (blog.keywords && blog.keywords.length > 0)) && (
                <div className="border-t border-slate-100 pt-8 mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag size={16} className="text-slate-400 mr-1" />
                    {(blog.tags || blog.keywords || []).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <ShareButton />
                  </div>
                </div>
              )}

            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
