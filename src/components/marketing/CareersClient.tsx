'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, ArrowRight, Zap, Heart, Rocket, Coffee, Sun } from 'lucide-react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const jobs = [
  {
    title: "Senior Product Designer",
    dept: "Design",
    type: "Remote / Hybrid",
    location: "Bangalore, India"
  },
  {
    title: "Fullstack Engineer (Next.js & Go)",
    dept: "Engineering",
    type: "Remote",
    location: "Global"
  },
  {
    title: "Customer Success Lead",
    dept: "Operations",
    type: "On-site",
    location: "Mumbai, India"
  }
];

export function CareersClient() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b_0%,#0f172a_100%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
            >
              <Rocket className="h-4 w-4" />
              <span>We're Hiring!</span>
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-black tracking-tight leading-tight"
            >
              Build the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">future of health.</span>
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-xl text-slate-400 leading-relaxed max-w-xl font-medium"
            >
              Join a team of bold thinkers and builders redefining how healthcare is delivered and managed across the globe.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex gap-4"
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-blue-900/20">
                View Open Roles
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Perks & Benefits</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto italic">We take care of our team so they can focus on solving the world's toughest healthcare problems.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Modern Tech Stack", desc: "Work with the latest tools like Next.js, Go, and AI." },
              { icon: Heart, title: "Full Health Coverage", desc: "Premium health and dental insurance for you and your family." },
              { icon: Sun, title: "Flexible Time Off", desc: "We value output over hours. Take time when you need it." },
              { icon: Coffee, title: "Continuous Learning", desc: "Generous budget for books, courses, and conferences." }
            ].map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4 text-center p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <perk.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900">{perk.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Current Openings</h2>
            
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-300 transition-all group"
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.dept}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 font-bold group/btn">
                    Apply Now
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center pt-8">
              <p className="text-slate-500 font-medium">Don't see a role that fits? <Link href="#" className="text-blue-600 font-bold hover:underline">Send us an open application.</Link></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
