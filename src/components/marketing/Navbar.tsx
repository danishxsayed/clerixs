'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);
  const supabase = createClient();

  const getAppUrl = (path: string) => {
    if (!mounted) {
      return process.env.NODE_ENV === 'development' ? path : `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.clerixs.com'}${path}`;
    }
    if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
      return path;
    }
    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clerixs.com';
    return `${appBase}${path}`;
  };

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };

    window.addEventListener('scroll', handleScroll);
    checkUser();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [supabase]);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] border-b border-slate-200/50 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px]">
            <Image
              src="/assets/logo.jpg"
              alt="Clerixs Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Clerixs</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="relative text-sm font-bold text-slate-600 hover:text-primary transition-colors group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button asChild className="rounded-full px-6 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link href={getAppUrl('/dashboard')} className="flex items-center gap-2">
                Dashboard
                <ArrowRight size={16} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full px-6 font-bold text-slate-600 hover:text-primary">
                <Link href={getAppUrl('/auth/login')}>Sign In</Link>
              </Button>
              <Button asChild className="rounded-full px-6 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95">
                <Link href={getAppUrl('/auth/signup')} className="flex items-center gap-2">
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-[72px] z-40 bg-white md:hidden overflow-y-auto"
          >
            <div className="flex flex-col p-6 space-y-6">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="text-2xl font-bold text-slate-900 hover:text-primary transition-colors py-2 border-b border-slate-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-4 pt-6">
                {user ? (
                  <Button asChild size="lg" className="rounded-2xl font-bold bg-primary w-full h-14">
                    <Link href={getAppUrl('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="lg" className="rounded-2xl font-bold text-slate-900 border-slate-200 w-full h-14">
                      <Link href={getAppUrl('/auth/login')} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild size="lg" className="rounded-2xl font-bold bg-primary w-full h-14">
                      <Link href={getAppUrl('/auth/signup')} onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
