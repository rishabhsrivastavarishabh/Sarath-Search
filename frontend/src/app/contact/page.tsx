"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Mail, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-400" /> Contact Support & Team
            </h1>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" /> Thank you! Your message has been sent to Sarath Search Team.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Your Name</label>
                  <input required type="text" placeholder="John Doe" className="w-full bg-zinc-950 border border-white/15 rounded-2xl px-4 py-2.5 text-white outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Email Address</label>
                  <input required type="email" placeholder="john@example.com" className="w-full bg-zinc-950 border border-white/15 rounded-2xl px-4 py-2.5 text-white outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Message</label>
                  <textarea required rows={4} placeholder="How can we help you?" className="w-full bg-zinc-950 border border-white/15 rounded-2xl p-4 text-white outline-none focus:border-purple-400" />
                </div>
                <button type="submit" className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold transition-all hover:brightness-110 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
