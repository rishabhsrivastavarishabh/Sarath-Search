"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Settings as SettingsIcon, Moon, Shield, Sliders, Lock, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [safeSearch, setSafeSearch] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [role, setRole] = useState('user');

  useEffect(() => {
    async function loadRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role) setRole(profile.role);
      }
    }
    loadRole();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full space-y-6">
          {/* Admin Search Console Card */}
          {role === 'admin' && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-purple-500/30 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Sarath Search Console Settings</h3>
                  <p className="text-xs text-zinc-400">Configure indexing rules, sitemaps, & robots.txt</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/admin/console')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-full text-xs font-bold transition-all hover:scale-105 flex items-center gap-1.5"
              >
                Search Console <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-purple-400" /> Preferences & Settings
            </h1>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-white text-sm">Safe Search Filter</h4>
                  <p className="text-zinc-400 mt-0.5">Filter explicit content from web search results</p>
                </div>
                <input
                  type="checkbox"
                  checked={safeSearch}
                  onChange={(e) => setSafeSearch(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-white text-sm">Instant Autocomplete</h4>
                  <p className="text-zinc-400 mt-0.5">Show query suggestions as you type</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoComplete}
                  onChange={(e) => setAutoComplete(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center py-3">
                <div>
                  <h4 className="font-bold text-white text-sm">Theme Mode</h4>
                  <p className="text-zinc-400 mt-0.5">System dark glassmorphism theme active</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  Dark Mode
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
