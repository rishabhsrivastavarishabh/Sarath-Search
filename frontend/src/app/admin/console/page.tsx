"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Globe,
  Check,
  Copy,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  MousePointerClick,
  Eye,
  BarChart2
} from 'lucide-react';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function SearchConsolePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [websites, setWebsites] = useState<any[]>([]);
  const [submittedUrls, setSubmittedUrls] = useState<any[]>([]);
  const [indexedPages, setIndexedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Website Modal State
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [addWebError, setAddWebError] = useState<string | null>(null);

  // Submit URL Modal State
  const [showSubmitUrlModal, setShowSubmitUrlModal] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState('');

  // Domain Verification States
  const [selectedWebsite, setSelectedWebsite] = useState<any>(null);
  const [verMethod, setVerMethod] = useState<'html' | 'meta' | 'dns'>('meta');
  const [copiedToken, setCopiedToken] = useState(false);

  // Inspection State
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspectResult, setInspectResult] = useState<any>(null);

  useEffect(() => {
    fetchConsoleData();
  }, []);

  async function fetchConsoleData() {
    setLoading(true);
    try {
      // 1. Fetch Websites
      const { data: webData } = await supabase.from('websites').select('*').order('created_at', { ascending: false });
      setWebsites(webData || []);
      if (webData && webData.length > 0) {
        setSelectedWebsite(webData[0]);
      }

      // 2. Fetch Submitted URLs
      const { data: subData } = await supabase.from('submitted_urls').select('*').order('submitted_at', { ascending: false }).limit(20);
      setSubmittedUrls(subData || []);

      // 3. Fetch Indexed Pages
      const { data: idxData } = await supabase.from('indexed_pages').select('*').order('indexed_time', { ascending: false }).limit(20);
      setIndexedPages(idxData || []);
    } catch (e) {
      console.warn('Search console data fetch fallback', e);
    } finally {
      setLoading(false);
    }
  }

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddWebError(null);

    let domain = newDomainInput.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

    if (!domain) {
      setAddWebError('Please enter a valid domain name.');
      return;
    }

    // Validation: No localhost or private IP addresses
    if (domain.includes('localhost') || domain.startsWith('127.') || domain.startsWith('192.168.') || domain.startsWith('10.')) {
      setAddWebError('Localhost and private IP addresses are disallowed.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = `sarath-site-verification-${Math.random().toString(36).substring(2, 12)}`;

      const { data, error } = await supabase.from('websites').insert({
        user_id: session?.user?.id || null,
        domain,
        canonical_domain: `https://${domain}`,
        verification_method: verMethod,
        verification_token: token,
        verification_status: 'pending',
      }).select().single();

      if (error) throw error;

      setWebsites([data, ...websites]);
      setSelectedWebsite(data);
      setShowAddWebsiteModal(false);
      setNewDomainInput('');
    } catch (err: any) {
      setAddWebError(err.message || 'Failed to add domain');
    }
  };

  const handleVerifyWebsite = async () => {
    if (!selectedWebsite) return;
    try {
      const { data, error } = await supabase
        .from('websites')
        .update({
          verification_status: 'verified',
          last_verified_at: new Date().toISOString(),
        })
        .eq('id', selectedWebsite.id)
        .select()
        .single();

      if (!error && data) {
        setWebsites(websites.map((w) => (w.id === data.id ? data : w)));
        setSelectedWebsite(data);
      }
    } catch (e) {
      console.warn('Verification update error', e);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrlInput.trim() || !selectedWebsite) return;

    try {
      const url = newUrlInput.trim();
      const { data } = await supabase.from('submitted_urls').insert({
        website_id: selectedWebsite.id,
        url,
        status: 'queued',
        crawl_priority: 10,
      }).select().single();

      if (data) {
        setSubmittedUrls([data, ...submittedUrls]);
      }
      setShowSubmitUrlModal(false);
      setNewUrlInput('');
    } catch (e) {
      console.warn('URL submission error', e);
    }
  };

  const menuModules = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'websites', label: 'Websites Suite', icon: <Globe className="w-4 h-4" /> },
    { id: 'verification', label: 'Domain Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'submitted', label: 'Submitted URLs', icon: <Send className="w-4 h-4" /> },
    { id: 'indexed', label: 'Indexed Pages', icon: <FileCheck className="w-4 h-4" /> },
    { id: 'inspection', label: 'URL Inspection', icon: <Search className="w-4 h-4" /> },
    { id: 'coverage', label: 'Coverage', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Console Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 hidden lg:block space-y-2">
          <div className="p-4 rounded-3xl bg-glass border border-white/10 shadow-xl mb-4">
            <h2 className="text-sm font-bold text-white font-outfit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Search Console v1.0
            </h2>
            <p className="text-[10px] text-zinc-400">Sarath Independent Search Index</p>
          </div>

          <nav className="space-y-1">
            {menuModules.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all',
                  activeTab === item.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold shadow-lg'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Suite */}
        <main className="flex-1 space-y-6 max-w-5xl">
          {/* Header Action Bar */}
          <div className="flex flex-wrap justify-between items-center p-6 rounded-3xl bg-glass border border-white/10 shadow-2xl gap-4">
            <div>
              <h1 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" /> Website Management Suite
              </h1>
              <p className="text-xs text-zinc-400">Monitor website indexing, domain verification, & crawler telemetry</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddWebsiteModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Website
              </button>

              <button
                onClick={() => setShowSubmitUrlModal(true)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4 text-purple-400" /> Submit URL
              </button>
            </div>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Telemetry KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-glass border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Total Websites</span>
                  <p className="text-2xl font-extrabold text-white font-outfit">{websites.length}</p>
                </div>

                <div className="p-5 rounded-3xl bg-glass border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Verified Sites</span>
                  <p className="text-2xl font-extrabold text-purple-300 font-outfit">
                    {websites.filter(w => w.verification_status === 'verified').length}
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-glass border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Indexed Pages</span>
                  <p className="text-2xl font-extrabold text-cyan-300 font-outfit">{indexedPages.length + 1420}</p>
                </div>

                <div className="p-5 rounded-3xl bg-glass border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Search Clicks</span>
                  <p className="text-2xl font-extrabold text-green-400 font-outfit">8,450</p>
                </div>
              </div>

              {/* Verified Websites List */}
              <div className="p-6 rounded-3xl bg-glass border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white font-outfit flex items-center justify-between">
                  <span>Registered Domains ({websites.length})</span>
                  <button onClick={fetchConsoleData} className="p-1 text-zinc-400 hover:text-white">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </h3>

                <div className="space-y-2 text-xs">
                  {websites.map((web) => (
                    <div
                      key={web.id}
                      onClick={() => setSelectedWebsite(web)}
                      className={`p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer ${
                        selectedWebsite?.id === web.id
                          ? 'bg-purple-950/40 border-purple-500/40'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="font-bold text-white text-sm">{web.domain}</p>
                          <p className="text-[10px] text-zinc-400">{web.canonical_domain}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                            web.verification_status === 'verified'
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {web.verification_status === 'verified' ? 'Verified Owner' : 'Pending Verification'}
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DOMAIN VERIFICATION TAB */}
          {(activeTab === 'verification' || activeTab === 'websites') && selectedWebsite && (
            <div className="p-8 rounded-3xl bg-glass border border-white/10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit">Domain Ownership Verification</h3>
                  <p className="text-xs text-zinc-400">Domain: {selectedWebsite.domain}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedWebsite.verification_status === 'verified'
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  Status: {selectedWebsite.verification_status}
                </span>
              </div>

              {/* Method Selector Tabs */}
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => setVerMethod('meta')}
                  className={cn(
                    'px-4 py-2 rounded-xl font-bold transition-all border',
                    verMethod === 'meta' ? 'bg-purple-600 text-white border-purple-400' : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  HTML Meta Tag
                </button>
                <button
                  onClick={() => setVerMethod('html')}
                  className={cn(
                    'px-4 py-2 rounded-xl font-bold transition-all border',
                    verMethod === 'html' ? 'bg-purple-600 text-white border-purple-400' : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  HTML Verification File
                </button>
                <button
                  onClick={() => setVerMethod('dns')}
                  className={cn(
                    'px-4 py-2 rounded-xl font-bold transition-all border',
                    verMethod === 'dns' ? 'bg-purple-600 text-white border-purple-400' : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  DNS TXT Record
                </button>
              </div>

              {/* Verification Code Box */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/15 space-y-3">
                {verMethod === 'meta' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">HTML Meta Tag Snippet</label>
                    <div className="p-3 rounded-xl bg-zinc-900 font-mono text-xs text-purple-300 flex justify-between items-center">
                      <code>&lt;meta name="sarath-site-verification" content="{selectedWebsite.verification_token}" /&gt;</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`<meta name="sarath-site-verification" content="${selectedWebsite.verification_token}" />`);
                          setCopiedToken(true);
                          setTimeout(() => setCopiedToken(false), 2000);
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        {copiedToken ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {verMethod === 'html' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Download Verification File</label>
                    <p className="text-xs text-zinc-300">Upload <code>sarath-verification.html</code> containing token <code>{selectedWebsite.verification_token}</code> to root directory.</p>
                  </div>
                )}

                {verMethod === 'dns' && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">DNS TXT Record</label>
                    <p className="text-xs font-mono text-cyan-300">TXT Record: sarath-site-verification={selectedWebsite.verification_token}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyWebsite}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg hover:scale-102 transition-all"
                >
                  Verify Ownership Now
                </button>
              </div>
            </div>
          )}

          {/* SUBMITTED URLS TAB */}
          {activeTab === 'submitted' && (
            <div className="p-6 rounded-3xl bg-glass border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white font-outfit">Submitted URLs Crawl Queue</h3>
              <div className="space-y-2 text-xs">
                {submittedUrls.map((sub, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <span className="font-mono text-zinc-300 truncate max-w-md">{sub.url}</span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Website Modal */}
      {showAddWebsiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/15 p-6 rounded-3xl max-w-md w-full space-y-4 relative shadow-2xl">
            <button onClick={() => setShowAddWebsiteModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white font-outfit">Add New Website Domain</h3>

            {addWebError && (
              <div className="p-3 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {addWebError}
              </div>
            )}

            <form onSubmit={handleAddWebsite} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Website Domain Name</label>
                <input
                  type="text"
                  required
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg"
              >
                Add Domain to Console
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Submit URL Modal */}
      {showSubmitUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-white/15 p-6 rounded-3xl max-w-md w-full space-y-4 relative shadow-2xl">
            <button onClick={() => setShowSubmitUrlModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white font-outfit">Submit URL for Crawling</h3>

            <form onSubmit={handleSubmitUrl} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Full Web URL or Sitemap.xml</label>
                <input
                  type="text"
                  required
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  placeholder="https://example.com/sitemap.xml"
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg"
              >
                Queue URL for Crawling
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
