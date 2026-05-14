'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function ContactClient() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative py-20 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative text-center space-y-4">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight"
          >
            How can we <span className="text-blue-600">help</span> you?
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto"
          >
            Whether you're a clinic owner, an engineer, or just curious about our mission, we'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-blue-900/5 border border-slate-100"
            >
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                    <input
                      type="email"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                      placeholder="john@clinic.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Topic</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-700">
                    <option>General Inquiry</option>
                    <option>Product Demo Request</option>
                    <option>Sales & Partnerships</option>
                    <option>Technical Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Info Column */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">Direct Contacts</h3>
                <div className="space-y-6">
                  {[
                    { icon: MessageSquare, title: "Support Chat", value: "Available 24/7 in-app", color: "blue" },
                    { icon: Mail, title: "Email Us", value: "hello@clerixs.com", color: "indigo" },
                    { icon: Clock, title: "Working Hours", value: "Mon-Sat: 9:00 AM - 7:00 PM", color: "amber" }
                  ].map((info, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-5"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-${info.color}-50 flex items-center justify-center text-${info.color}-600`}>
                        <info.icon size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{info.title}</div>
                        <div className="text-slate-900 font-bold">{info.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-slate-900">Our Headquarters</h3>
                <div className="relative rounded-[40px] overflow-hidden bg-slate-100 aspect-video group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-white/50">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Bangalore, India</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global HQ</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                    <Globe className="w-64 h-64 text-blue-600" strokeWidth={1} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Simple */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-slate-500 font-medium">Looking for something else? <button className="text-blue-600 font-bold hover:underline">Browse our Help Center</button></p>
        </div>
      </section>
    </div>
  );
}
