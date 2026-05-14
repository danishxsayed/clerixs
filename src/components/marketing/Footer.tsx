import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Instagram, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0f1117] text-white pt-20 pb-10 relative overflow-hidden">
      {/* Brand Gradient Top Border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-teal-400 to-indigo-600 opacity-80" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6 col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px]">
                <Image
                  src="/assets/logo.jpg"
                  alt="Clerixs Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">Clerixs</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              The complete OS for modern clinics. Automate scheduling, EMR, and billing with ease.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Instagram, href: '#' }
              ].map((social, i) => (
                <Link 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary transition-all active:scale-95 border border-slate-700/50"
                >
                  <social.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-5 col-span-1">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Product</h3>
            <div className="flex flex-col gap-3">
              {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                <Link key={item} href={item === 'Pricing' ? '/pricing' : '/#features'} className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold w-fit">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-5 col-span-1">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Company</h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'About', href: '/about' },
                { name: 'Blog', href: '/blog' },
                { name: 'Careers', href: '/careers' },
                { name: 'Contact', href: '/contact' }
              ].map((item) => (
                <Link key={item.name} href={item.href} className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold w-fit">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-5 col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Legal</h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Privacy Policy', href: '/privacy-policy' },
                { name: 'Terms of Service', href: '/terms-of-service' },
                { name: 'Cookie Policy', href: '/cookie-policy' }
              ].map((item) => (
                <Link key={item.name} href={item.href} className="text-slate-400 hover:text-primary transition-colors text-sm font-semibold w-fit">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-bold">
            © {currentYear} Clerixs. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
            Made with <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" /> in India
          </div>
        </div>
      </div>
    </footer>
  );
}
