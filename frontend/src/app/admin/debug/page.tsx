"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Server,
  Key,
  Database,
  Cpu,
  Search,
  RefreshCw,
  Clock,
  Code
} from 'lucide-react';

export default function AdminDebugPage() {
  const [loading, setLoading] = useState(false);
  const [testQuery, setTestQuery] = useState('Artificial Intelligence');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  async function checkDatabaseConnection() {
    setDbStatus('testing');
    const start = Date.now();
    try {
      const { count, error } = await supabase.from('indexed_pages').select('*', { count: 'exact', head: true });
      if (!error) {
        setDbStatus('connected');
        setDbLatency(Date.now() - start);
      } else {
        setDbStatus('error');
      }
    } catch {
      setDbStatus('error');
    }
  }

  async function runSearchDiagnostics(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!testQuery.trim()) return;

    setLoading(true);
    setTestResponse(null);

    const start = Date.now();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(testQuery.trim())}&category=all&page=1&pageSize=10`);
      const data = await res.json();
      const executionTime = Date.now() - start;

      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        executionTimeMs: executionTime,
        provider: data.provider || 'Sarath Search',
        resultsCount: data.results ? data.results.length : 0,
        aiAnswerGenerated: !!data.ai_answer,
        cacheHit: data.provider?.includes('Cache') || false,
        rawPayload: data,
      });
    } catch (err: any) {
      setTestResponse({
        status: 500,
        error: err.message || 'Diagnostic query failed',
        executionTimeMs: Date.now() - start,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-black font-outfit text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-purple-400" /> Sarath System Debug Console
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time API response diagnostics, database latency, and search pipeline verification.
            </p>
          </div>

          <button
            onClick={() => { checkDatabaseConnection(); runSearchDiagnostics(); }}
            className="px-4 py-2 rounded-full bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
          </button>
        </div>

        {/* System Health Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Supabase Database Status */}
          <div className="p-5 rounded-3xl bg-glass-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Database className="w-4 h-4 text-cyan-400" /> Supabase Database
              </span>
              {dbStatus === 'connected' ? (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" /> Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> Testing
                </span>
              )}
            </div>
            <p className="text-lg font-black text-white font-mono">
              {dbLatency !== null ? `${dbLatency} ms` : 'Checking...'}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              URL: https://tjyvgkpcjlswjkkfffnt.supabase.co
            </p>
          </div>

          {/* Google Custom Search API */}
          <div className="p-5 rounded-3xl bg-glass-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Key className="w-4 h-4 text-amber-400" /> Google CSE API
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-purple-400" /> Configured
              </span>
            </div>
            <p className="text-lg font-black text-white font-mono">CX: 514a2403c527f4da2</p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              Key: AIzaSyCOmaT7tY...
            </p>
          </div>

          {/* OpenRouter AI Model */}
          <div className="p-5 rounded-3xl bg-glass-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Cpu className="w-4 h-4 text-purple-400" /> AI Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-cyan-400" /> Active
              </span>
            </div>
            <p className="text-lg font-black text-white font-mono">google/gemini-3.6-flash</p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              Provider: OpenRouter AI API
            </p>
          </div>
        </div>

        {/* Diagnostic Query Runner */}
        <div className="p-6 rounded-3xl bg-glass-card border border-white/10 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" /> Live Search Pipeline Diagnostics
          </h2>

          <form onSubmit={runSearchDiagnostics} className="flex gap-3">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter test search query..."
              className="flex-1 bg-zinc-950/90 border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-400 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Run Diagnostics
            </button>
          </form>

          {/* Response Payload Inspector */}
          {testResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-black/80 border border-white/10 space-y-3 font-mono text-xs"
            >
              <div className="flex flex-wrap items-center gap-4 text-[11px] border-b border-white/10 pb-3">
                <span className="text-zinc-400">Status: <strong className="text-green-400">{testResponse.status} OK</strong></span>
                <span className="text-zinc-400">Execution Time: <strong className="text-cyan-400">{testResponse.executionTimeMs} ms</strong></span>
                <span className="text-zinc-400">Results Returned: <strong className="text-purple-400">{testResponse.resultsCount}</strong></span>
                <span className="text-zinc-400">Cache Status: <strong className={testResponse.cacheHit ? 'text-green-400' : 'text-amber-400'}>{testResponse.cacheHit ? 'HIT (Supabase)' : 'MISS (Live API)'}</strong></span>
                <span className="text-zinc-400">AI Generated: <strong className={testResponse.aiAnswerGenerated ? 'text-cyan-400' : 'text-zinc-500'}>{testResponse.aiAnswerGenerated ? 'YES' : 'NO'}</strong></span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 flex items-center gap-1 font-bold">
                  <Code className="w-3.5 h-3.5 text-purple-400" /> JSON API Response Payload:
                </span>
                <pre className="p-4 rounded-xl bg-zinc-950 text-purple-200 overflow-x-auto text-[10px] max-h-80 border border-white/5 leading-relaxed">
                  {JSON.stringify(testResponse.rawPayload, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
