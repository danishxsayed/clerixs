'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const posts = [
  {
    title: "How Automation is Reducing Doctor Burnout",
    excerpt: "Discover how modern EMR systems are cutting administrative time by 40% and allowing doctors to focus on clinical excellence.",
    author: "Dr. Sarah Jenkins",
    date: "May 12, 2026",
    category: "Insights",
    image: "/assets/auth-bg.png"
  },
  {
    title: "The Future of Patient Communication",
    excerpt: "From WhatsApp integration to AI-powered appointment reminders, learn how to keep your patients engaged and informed.",
    author: "Amit Sharma",
    date: "May 10, 2026",
    category: "Technology",
    image: "/assets/Mock-dash.png"
  },
  {
    title: "5 Steps to Modernize Your Dental Practice",
    excerpt: "A comprehensive guide for dentists looking to transition from paper-based files to a fully digital workflow.",
    author: "Priya Singh",
    date: "May 08, 2026",
    category: "Guides",
    image: "/assets/patient-profile.png"
  }
];

export function BlogClient() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-20 pb-12 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl space-y-6">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900"
            >
              The Clerixs <span className="text-blue-600">Journal</span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-medium"
            >
              Expert perspectives on healthcare technology, practice management, and patient care in the digital age.
            </motion.p>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex items-center max-w-md bg-white border border-slate-200 rounded-full p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <Search className="h-5 w-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search articles..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm outline-none"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                Search
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col space-y-4"
              >
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600 shadow-sm">
                    {post.category}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
                    <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {post.excerpt}
                  </p>
                  <Link href="#" className="inline-flex items-center gap-2 text-blue-600 font-bold group/link">
                    Read Full Article
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
          
          <div className="mt-16 flex justify-center">
            <button className="px-8 py-3 rounded-full border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              Load More Stories
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden rounded-t-[40px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[80px]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Get the latest insights delivered.</h2>
            <p className="text-blue-100 font-medium">Join 5,000+ medical professionals who receive our weekly digest on clinic excellence.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-full px-6 py-4 bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-lg">
                Subscribe
              </button>
            </div>
            <p className="text-blue-200/60 text-xs">Zero spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
