"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HelpCircle, Search, Scan, Key, Shield } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full">
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-cyan-400" /> Help Center & FAQ
            </h1>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <h3 className="font-bold text-white text-sm">How does Sarath Lens Search work?</h3>
                <p className="text-zinc-400">Click the Lens button on the search bar to upload an image or take a photo. Sarath Lens extracts OCR text and performs visual search.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <h3 className="font-bold text-white text-sm">How do I verify domain ownership in Search Console?</h3>
                <p className="text-zinc-400">Navigate to Search Console → Domain Verification. Choose between Meta Tag verification, HTML File upload, or DNS TXT records.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <h3 className="font-bold text-white text-sm">How to enable OpenRouter AI key?</h3>
                <p className="text-zinc-400">Set `OPENROUTER_API_KEY` in `.env.local` to enable real-time Llama-3.3-70B AI Overview summaries.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
