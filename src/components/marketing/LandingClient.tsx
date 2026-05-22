'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Receipt, ArrowRight, ShieldCheck, Zap, Stethoscope, LineChart, FileText, CheckCircle2 } from 'lucide-react';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export function LandingClient() {
  const { scrollYProgress } = useScroll();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mounted, setMounted] = useState(false);

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

  const testimonials = [
    {
      name: "Dr. Amit Sharma",
      role: "Orthodontist • Apex Dental",
      text: "Before Clerixs, measuring our daily metrics required matching physical papers with disjointed software. Now, I see patient throughput and cashflow simultaneously on my iPad while heading home.",
      avatar: "/assets/avatars/doctor-2.png"
    },
    {
      name: "Dr. Priya Singh",
      role: "Clinical Director • CarePlus Hub",
      text: "Their custom prescription builder and one-click WhatsApp summary generator completely eliminated waiting room queues. Patients walk out happier, and my staff is genuinely breathing easier.",
      avatar: "/assets/avatars/doctor-1.png"
    },
    {
      name: "Dr. Rohan Verma",
      role: "Chief Surgeon • SecureMed Group",
      text: "The granular staff permissions and Cashfree billing integrations make managing our 3 branches painless. I actually trust our data architecture for the first time in a decade.",
      avatar: "/assets/avatars/doctor-3.png"
    },
    {
      name: "Dr. Sarah Jenkins",
      role: "Medical Director • City Wellness",
      text: "Clerixs is the first platform that actually understands the clinical workflow. It's not just a database; it's an assistant that makes our practice run like a well-oiled machine.",
      avatar: "/assets/avatars/doctor-4.png"
    }
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <main className="flex-1 overflow-hidden">
      {/* 
        =========================================
        HERO SECTION
        =========================================
      */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-white overflow-hidden">
        {/* Dynamic Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-200/40 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '10s' }} />

        <div className="container relative z-10 mx-auto px-4 md:px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Hero Copy */}
            <motion.div
              className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-sm font-medium">
                <Zap className="h-4 w-4 fill-blue-600" />
                <span>The complete OS for modern clinics</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.15] lg:leading-[1.1]">
                Less paperwork. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  More patient care.
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-[550px]">
                Clerixs automates your scheduling, EMR, and billing so your team can focus entirely on what matters most — delivering exceptional healthcare.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button asChild size="lg" className="h-14 px-8 rounded-full text-base font-semibold shadow-[0_8px_30px_rgb(37,99,235,0.2)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] transition-all hover:-translate-y-1">
                  <Link href={getAppUrl('/auth/signup')}>
                    Start 7-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-base font-medium border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-1">
                  <Link href="#features">See How It Works</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative shadow-sm">
                      <Image 
                        src={`/assets/avatars/doctor-${i}.png`} 
                        alt={`Doctor ${i}`} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  ))}
                </div>
                <div>Trusted by <span className="text-slate-900 font-bold">500+</span> healthcare professionals</div>
              </motion.div>
            </motion.div>

            {/* Hero Dashboard Mockup - Realistic 3D Frame */}
            <motion.div
              className="relative w-full max-w-[600px] lg:max-w-none mx-auto lg:mx-0 mt-16 lg:mt-0 lg:pl-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative group perspective-[1500px] overflow-visible">
                {/* Dashboard Mockup - Responsive */}
                <motion.div 
                  className="relative z-10 w-full lg:scale-110 lg:origin-left rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/50 overflow-hidden bg-slate-950"
                  style={{ transform: 'perspective(1500px) rotateY(-5deg) rotateX(2deg)' }}
                >
                  {/* Mac Browser Frame */}
                  <div className="h-8 md:h-10 bg-[#2d2d2d] border-b border-slate-800 flex items-center px-4 gap-4">
                    <div className="flex gap-1.5 md:gap-2 shrink-0">
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#ff5f56]" />
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto">
                      <div className="bg-[#1a1a1a] rounded-md h-5 md:h-6 flex items-center justify-center px-3 text-[8px] md:text-[10px] text-slate-500 font-mono truncate">
                        app.clerixs.com/dashboard
                      </div>
                    </div>
                    <div className="w-8 md:w-12 shrink-0" />
                  </div>

                  {/* Dashboard Image - Preserve Aspect Ratio */}
                  <div className="relative bg-slate-900">
                    <Image 
                      src="/assets/Mock-dash.png" 
                      alt="Clerixs Dashboard Mockup" 
                      width={1200}
                      height={750}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                </motion.div>

                {/* Proof Cards - Responsive positioning */}
                <div className="relative mt-8 md:mt-0 md:absolute md:inset-0 md:pointer-events-none md:z-30">
                   {[
                    { 
                      icon: CheckCircle2, 
                      text: '✅ Prescription sent via WhatsApp', 
                      color: 'emerald', 
                      sub: 'Patient: Rahul Mehta',
                      pos: 'md:top-[-30px] md:right-[-60px]',
                      delay: 0
                    },
                    { 
                      icon: FileText, 
                      text: '🧪 Lab report ready — Priya Shah', 
                      color: 'indigo', 
                      sub: 'Status: Verified by Lab Head',
                      pos: 'md:top-[60%] md:left-[-100px]',
                      delay: 1
                    },
                    { 
                      icon: Receipt, 
                      text: '₹2,500 payment received', 
                      color: 'blue', 
                      sub: 'Invoice #4829 • Priya Shah',
                      pos: 'md:bottom-[-40px] md:right-[-40px]',
                      delay: 2
                    }
                  ].map((card, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: [0, -10, 0]
                      }}
                      transition={{ 
                        opacity: { delay: 0.8 + (i * 0.1) },
                        scale: { delay: 0.8 + (i * 0.1) },
                        y: { 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: card.delay 
                        }
                      }}
                      className={`
                        bg-white/95 backdrop-blur-md p-4 md:px-5 md:py-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-4
                        w-full md:w-[300px] relative md:absolute ${card.pos} mb-4 md:mb-0 md:pointer-events-auto
                      `}
                    >
                      <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0`}>
                        {i === 2 ? <span className="text-blue-600 font-bold text-lg">₹</span> : <card.icon className={`h-5 w-5 text-${card.color}-600`} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-tight">{card.text}</span>
                        <span className="text-[12px] text-slate-500 font-medium mt-0.5">{card.sub}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 
        =========================================
        MARQUEE SECTION
        =========================================
      */}
      <section className="w-full border-y border-slate-200 bg-slate-50 py-10 overflow-hidden flex flex-col items-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Empowering leading clinics across the country</p>
        <div className="relative w-full flex overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap items-center gap-16 md:gap-32 px-16"
            animate={{ x: [0, -1035] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {/* Doubling items for seamless looping */}
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xl grayscale opacity-50"><Stethoscope className="w-6 h-6" /> Apex Dental</div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xl grayscale opacity-50"><CheckCircle2 className="w-6 h-6" /> CarePlus Hub</div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xl grayscale opacity-50"><Users className="w-6 h-6" /> Family Health</div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xl grayscale opacity-50"><ShieldCheck className="w-6 h-6" /> SecureMed Group</div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 
        =========================================
        BENTO GRID SECTION
        =========================================
      */}
      <section id="features" className="w-full py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="flex flex-col items-center text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl max-w-2xl text-slate-900">
              Everything required to scale your medical practice.
            </h2>
            <p className="max-w-[700px] text-lg text-slate-500 leading-relaxed font-medium">
              We've engineered a lightning-fast suite of tools that intuitively replace your messy spreadsheets, lost paper files, and fragmented software.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 max-w-6xl mx-auto md:auto-rows-[300px]">

            {/* Bento 1: Large Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-100/50 rounded-3xl p-6 md:p-8 flex flex-col md:justify-between group overflow-hidden relative transition-all hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="relative z-10 max-w-md">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Intelligent Patient CRM</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Consolidate robust patient histories, treatment plans, clinical notes, and encrypted consent documents into instantly accessible, gorgeous profiles.
                </p>
              </div>

              {/* Real Screenshot Replacement - Responsive Positioning */}
              <div className="relative mt-8 md:mt-0 md:absolute md:right-0 md:bottom-0 w-full md:w-3/4 h-64 md:h-2/3 overflow-hidden rounded-2xl md:rounded-tr-none md:rounded-tl-2xl border md:border-t md:border-l border-slate-200 shadow-2xl translate-y-4 md:translate-y-8 translate-x-4 md:translate-x-8 group-hover:translate-y-2 md:group-hover:translate-y-4 transition-transform duration-500 bg-white">
                <Image 
                  src="/assets/patient-profile.png" 
                  alt="Intelligent Patient CRM" 
                  width={1000}
                  height={800}
                  className="w-full h-full object-cover object-top"
                />
                {/* Bottom Gradient Fade */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white via-white/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Bento 2: Top Right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border rounded-3xl p-6 md:p-8 hover:border-slate-300 transition-colors group flex flex-col justify-center min-h-[200px] md:min-h-0"
            >
              <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                <Calendar className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Scheduling</h3>
              <p className="text-slate-500 text-sm font-medium">Coordinate multiple doctors, eliminate manual double-booking, and visually manage chair availability.</p>
            </motion.div>

            {/* Bento 3: Bottom Right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 text-white border-slate-800 rounded-3xl p-6 md:p-8 group relative overflow-hidden flex flex-col justify-center min-h-[200px] md:min-h-0"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Billing</h3>
                <p className="text-slate-400 text-sm font-medium border-l-2 border-indigo-500 pl-3">Generate GST-compliant invoices natively, record partial payments effortlessly, and monitor real-time cashflow analytics instantly.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      {/* 
        =========================================
        TESTIMONIALS & TRUST
        =========================================
      */}
      <section className="w-full py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
              Loved by doctors everywhere
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto relative px-4">
            <div className="relative h-[400px] md:h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="flex text-amber-400 gap-1 text-xl">{'★'.repeat(5)}</div>
                  
                  <blockquote className="text-xl md:text-2xl font-medium text-slate-800 italic leading-relaxed">
                    "{testimonials[activeTestimonial].text}"
                  </blockquote>

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl overflow-hidden relative">
                      <Image 
                        src={testimonials[activeTestimonial].avatar} 
                        alt={testimonials[activeTestimonial].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{testimonials[activeTestimonial].name}</div>
                      <div className="text-sm font-medium text-slate-500">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === i ? 'bg-blue-600 w-8' : 'bg-slate-200'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 
        =========================================
        SECURITY BANNER
        =========================================
      */}
      <section className="w-full bg-slate-950 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl mx-auto">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full" />
              <ShieldCheck className="h-24 w-24 text-blue-500 relative z-10" strokeWidth={1} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Bank-Grade Infrastructure</h3>
              <p className="text-slate-400 font-medium">Your clinic's data is secured behind strict AES-256 encryption thresholds and compliant Row-Level Security policies. We safeguard your practice so you can protect your patients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        =========================================
        FINAL CTA
        =========================================
      */}
      <section className="relative w-full py-24 md:py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-8 text-center bg-blue-600 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden">
            {/* Decals */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-20 rounded-full blur-[80px]" />

            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white max-w-3xl">
              Ready to leap into the future of clinic management?
            </h2>
            <p className="max-w-[600px] text-blue-100/90 md:text-xl font-medium">
              Join visionary professionals trading paperwork for peak efficiency. Your 7-day unrestricted trial awaits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-white text-blue-600 hover:bg-slate-50 transition-transform hover:scale-105 shadow-xl shadow-black/10">
                <Link href={getAppUrl('/auth/signup')}>Start Free Trial Now</Link>
              </Button>
            </div>
            <p className="text-blue-200/60 text-sm mt-4">No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </section>

    </main>
  );
}
