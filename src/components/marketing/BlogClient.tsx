'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Search, BookOpen, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

interface BlogClientProps {
  blogs: any[];
}

export function BlogClient({ blogs }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter posts dynamically in real-time
  const filteredPosts = blogs.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Search className="h-5 w-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-sm outline-none font-medium text-slate-800 placeholder:text-slate-400"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-20 min-h-[400px]">
        <div className="container mx-auto px-4 md:px-6">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, i) => {
                const coverImage = post.cover_image_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop';
                const formattedDate = post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.1, 0.5) }}
                    className="group flex flex-col space-y-4"
                  >
                    <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-xl transition-all duration-500 block cursor-pointer">
                      <Image
                        src={coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={coverImage.startsWith('http')}
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600 shadow-sm">
                        {post.category}
                      </div>
                    </Link>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formattedDate}</span>
                        <span className="flex items-center gap-1.5"><User size={14} /> {post.author_name}</span>
                      </div>
                      
                      <Link href={`/blog/${post.slug}`} className="block">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight cursor-pointer">
                          {post.title}
                        </h2>
                      </Link>
                      
                      <p className="text-slate-600 leading-relaxed font-semibold line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-blue-600 font-bold group/link cursor-pointer">
                        Read Full Article
                        <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl max-w-xl mx-auto px-6 border border-slate-100 shadow-inner">
              <div className="h-16 w-16 bg-white border rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AlertCircle size={28} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching articles found</h3>
              <p className="text-sm font-semibold text-slate-400 mt-1">
                Try searching for other healthcare topics or check back later for new articles.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-blue-600 relative overflow-hidden rounded-t-[40px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[80px]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">Get the latest insights delivered.</h2>
            <p className="text-blue-100 font-semibold text-sm">Join 5,000+ medical professionals who receive our weekly digest on clinic excellence.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 rounded-full px-6 py-4 bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white/30 transition-all font-semibold"
              />
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-lg cursor-pointer">
                Subscribe
              </button>
            </div>
            <p className="text-blue-200/60 text-xs font-bold uppercase tracking-wider">Zero spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
