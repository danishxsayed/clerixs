'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Shield, Heart, Zap, Globe } from 'lucide-react';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export function AboutClient() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              <span>Our Story</span>
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900"
            >
              We're on a mission to <span className="text-blue-600">humanize</span> healthcare.
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto"
            >
              Clerixs was born out of a simple observation: doctors spend more time on paperwork than on patients. We're here to change that.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              {
                icon: Heart,
                title: "Patient-First Focus",
                desc: "Every feature we build is designed to give doctors more quality time with their patients.",
                color: "rose"
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                desc: "We treat medical data with the highest level of encryption and privacy standards.",
                color: "blue"
              },
              {
                icon: Zap,
                title: "Relentless Innovation",
                desc: "We're constantly pushing the boundaries of what's possible in clinic management.",
                color: "amber"
              }
            ].map((value, i) => (
              <motion.div key={i} variants={fadeInUp} className="space-y-4 group">
                <div className={`w-12 h-12 rounded-2xl bg-${value.color}-50 flex items-center justify-center text-${value.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 opacity-20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Clinics", value: "500+" },
              { label: "Patient Visits", value: "1M+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Support Response", value: "< 2h" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="text-4xl md:text-5xl font-black text-white">{stat.value}</div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Vision CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-slate-50 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 border border-slate-100">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                Driven by a vision of seamless healthcare delivery.
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Our diverse team of engineers, designers, and medical professionals work together to solve the most complex challenges in clinic management.
              </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-200 overflow-hidden relative shadow-lg">
                  <Image src={`/assets/avatars/doctor-${i}.png`} alt="Team" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
