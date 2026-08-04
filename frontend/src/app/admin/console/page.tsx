"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck,
  Send,
  Map,
  Bot,
  Search,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Link2,
  ListFilter,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Globe,
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

export default function SearchConsolePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspectResult, setInspectResult] = useState<any>(null);
  const [robotsUrl, setRobotsUrl] = useState('https://example.com/page');
  const [robotsOutput, setRobotsOutput] = useState<string | null>(null);

  const menuModules = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'indexed', label: 'Indexed Pages', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'submitted', label: 'Submitted URLs', icon: <Send className="w-4 h-4" /> },
    { id: 'sitemaps', label: 'Sitemaps', icon: <Map className="w-4 h-4" /> },
    { id: 'robots', label: 'Robots Tester', icon: <Bot className="w-4 h-4" /> },
    { id: 'inspection', label: 'URL Inspection', icon: <Search className="w-4 h-4" /> },
    { id: 'coverage', label: 'Coverage', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Search Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'vitals', label: 'Core Web Vitals', icon: <Activity className="w-4 h-4" /> },
    { id: 'backlinks', label: 'Backlinks', icon: <Link2 className="w-4 h-4" /> },
    { id: 'logs', label: 'Crawler Logs', icon: <ListFilter className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Manual Actions', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'settings', label: 'Console Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleInspectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectUrl.trim()) return;
    setInspectResult({
      url: inspectUrl,
      status: 'Indexed & Valid',
      indexable: true,
      lastCrawled: new Date().toLocaleDateString(),
      httpCode: 200,
      mobileUsable: true,
      canonical: inspectUrl,
    });
  };

  const handleTestRobots = (e: React.FormEvent) => {
    e.preventDefault();
    setRobotsOutput(`Testing URL: ${robotsUrl}\nUser-Agent: SarathBot/3.1\nRobots.txt status: ALLOWED\nCrawl Delay: 0ms\nCanonical check: PASS`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-6">
        {/* Left Console Sub-Modules Navigation */}
        <aside className="hidden lg:flex flex-col w-64 p-4 rounded-3xl bg-glass-card border border-white/10 gap-1 sticky top-20 h-[calc(100vh-110px)] overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 mb-2">
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span className="font-extrabold text-xs text-white uppercase tracking-wider font-outfit">
              Search Console
            </span>
          </div>

          {menuModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left',
                activeTab === m.id
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold shadow-md'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full">
          <header className="mb-6 pb-4 border-b border-white/10 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold font-outfit text-white capitalize">
                {menuModules.find((m) => m.id === activeTab)?.label || 'Console'}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sarath Search Console (Developer & User Access Enabled)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> All User Access
            </span>
          </header>

          {/* Module: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ConsoleMetric title="Total Clicks" value="124,890" trend="+18.2%" color="text-purple-400" />
                <ConsoleMetric title="Total Impressions" value="1.82 M" trend="+24.1%" color="text-cyan-400" />
                <ConsoleMetric title="Average CTR" value="6.86 %" trend="Optimal" color="text-green-400" />
              </div>

              <div className="p-6 rounded-3xl bg-glass-card border border-white/10 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Indexing & Telemetry Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-zinc-400 block">Valid Pages</span>
                    <span className="font-extrabold text-white text-lg">14,280</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-zinc-400 block">Excluded Pages</span>
                    <span className="font-extrabold text-amber-400 text-lg">142</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-zinc-400 block">Submitted Sitemaps</span>
                    <span className="font-extrabold text-cyan-400 text-lg">8</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-zinc-400 block">Crawl Delay</span>
                    <span className="font-extrabold text-green-400 text-lg">0 ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module: URL Inspection */}
          {activeTab === 'inspection' && (
            <div className="p-6 rounded-3xl bg-glass-card border border-white/10 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" /> Inspect Any Web URL
              </h3>
              <form onSubmit={handleInspectUrl} className="flex gap-2">
                <input
                  type="url"
                  required
                  value={inspectUrl}
                  onChange={(e) => setInspectUrl(e.target.value)}
                  placeholder="https://example.com/page-to-inspect"
                  className="flex-1 bg-zinc-950 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400"
                />
                <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all">
                  Inspect
                </button>
              </form>

              {inspectResult && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-white border-b border-white/10 pb-2">
                    <span>URL Status</span>
                    <span className="text-green-400">{inspectResult.status}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 py-1">
                    <span>HTTP Code</span>
                    <span className="text-white font-mono">{inspectResult.httpCode}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 py-1">
                    <span>Canonical URL</span>
                    <span className="text-purple-300 font-mono">{inspectResult.canonical}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Module: Robots Tester */}
          {activeTab === 'robots' && (
            <div className="p-6 rounded-3xl bg-glass-card border border-white/10 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" /> Robots.txt & Crawl Rules Tester
              </h3>
              <form onSubmit={handleTestRobots} className="flex gap-2">
                <input
                  type="url"
                  required
                  value={robotsUrl}
                  onChange={(e) => setRobotsUrl(e.target.value)}
                  placeholder="https://example.com/test-url"
                  className="flex-1 bg-zinc-950 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400"
                />
                <button type="submit" className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl text-xs font-bold transition-all">
                  Test Robots.txt
                </button>
              </form>

              {robotsOutput && (
                <pre className="p-4 rounded-2xl bg-zinc-950 border border-white/10 text-xs font-mono text-cyan-300 whitespace-pre-wrap">
                  {robotsOutput}
                </pre>
              )}
            </div>
          )}

          {/* Fallback view for other sub-modules */}
          {!['dashboard', 'inspection', 'robots'].includes(activeTab) && (
            <div className="p-8 rounded-3xl bg-glass-card border border-white/10 text-center space-y-4">
              <Activity className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-lg font-bold text-white capitalize font-outfit">
                {activeTab.replace('_', ' ')} Console Module
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Real-time metrics, indexing coverage, and automated web crawler telemetry for {activeTab}.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ConsoleMetric({ title, value, trend, color }: { title: string; value: string; trend: string; color: string }) {
  return (
    <div className="p-5 rounded-3xl bg-glass-card border border-white/10 shadow-xl">
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</span>
      <div className={cn('text-3xl font-extrabold mt-1 font-outfit', color)}>{value}</div>
      <span className="text-xs text-zinc-500 mt-1 block font-semibold">{trend}</span>
    </div>
  );
}
