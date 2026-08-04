"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Download,
  Star,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Share2,
  HardDrive,
  Laptop,
  Terminal,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

export default function AppOpenPage() {
  const router = useRouter();
  const [installed, setInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'reviews'>('overview');

  const handleRunApp = () => {
    setInstalled(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern font-sans">
      {/* Top Header */}
      <div className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-glass border-b border-white/10 backdrop-blur-xl">
        <button
          onClick={() => router.push('/')}
          className="p-2.5 rounded-full bg-glass-card hover:bg-glass border border-white/10 text-zinc-400 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
          <Laptop className="w-4 h-4" /> Local App Store
        </div>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <main className="max-w-4xl mx-auto pt-10 pb-20 px-6">
        {/* App Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-10 rounded-3xl bg-glass-card border border-white/10 shadow-2xl mb-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 via-secondary/10 to-transparent blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between relative z-10">
            <div className="flex gap-6 items-center">
              <Logo size="lg" showText={false} className="flex-shrink-0" />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
                    Sarath 2.O
                  </h1>
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-primary font-medium text-base mb-3">Local Web Intelligence & Indexer</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">4.9</span>
                    <span>(1.2k reviews)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">v2.0.0-release</span>
                  <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Free & Open</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRunApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white rounded-full font-bold shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {installed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" /> Launching Engine...
                </>
              ) : (
                <>
                  Launch App <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all',
              activeTab === 'overview'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            Overview & Features
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all',
              activeTab === 'requirements'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            System Requirements
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all',
              activeTab === 'reviews'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            User Reviews (1,240)
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                icon={<ShieldCheck className="w-5 h-5 text-primary" />}
                title="100% Private"
                desc="Zero cloud indexing or tracking"
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5 text-secondary" />}
                title="Instant BM25"
                desc="Sub-millisecond query evaluation"
              />
              <FeatureCard
                icon={<Globe className="w-5 h-5 text-accent" />}
                title="Custom Crawler"
                desc="Full control over web sources"
              />
            </div>

            <div className="p-8 rounded-3xl bg-glass-card border border-white/10">
              <h2 className="text-xl font-bold font-outfit text-white mb-4">About Sarath 2.O</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Sarath 2.O transforms your local computer into a personal intelligence engine.
                It indexes web documentation, custom files, and target sites into a high-speed BM25 index.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-zinc-300">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Supports Node.js & TypeScript CLI</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <HardDrive className="w-4 h-4 text-secondary" />
                  <span>Compressed JSON index exports</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 space-y-4">
            <h2 className="text-xl font-bold font-outfit text-white mb-4">System Requirements</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Supported OS</span>
                <span className="font-bold text-white">Windows 10/11, macOS 12+, Linux (Ubuntu/Debian)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Memory (RAM)</span>
                <span className="font-bold text-white">Minimum 512 MB (1 GB recommended)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Runtime Environment</span>
                <span className="font-bold text-white">Node.js 18.x or 20.x</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Disk Space</span>
                <span className="font-bold text-white">50 MB for app + space for local index</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <ReviewCard
              author="Alex Rivera"
              role="Senior Systems Engineer"
              rating={5}
              comment="The speed of BM25 retrieval locally is unmatched. It completely replaced my online search for documentation lookup."
            />
            <ReviewCard
              author="Devin Chen"
              role="Fullstack Developer"
              rating={5}
              comment="Having 100% privacy and full control over crawler domains makes this an essential tool in my workflow."
            />
          </div>
        )}
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-glass-card border border-white/10 hover:border-primary/40 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="font-bold text-sm text-white font-outfit">{title}</div>
      <div className="text-xs text-zinc-400 mt-1">{desc}</div>
    </div>
  );
}

function ReviewCard({
  author,
  role,
  rating,
  comment,
}: {
  author: string;
  role: string;
  rating: number;
  comment: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-glass-card border border-white/10">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-sm text-white font-outfit">{author}</div>
          <div className="text-xs text-zinc-500">{role}</div>
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">"{comment}"</p>
    </div>
  );
}
