"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, ShieldCheck, Sparkles, Building2, Calendar, Award } from 'lucide-react';

interface KnowledgeCardProps {
  query: string;
  hasResults?: boolean;
}

const KNOWLEDGE_ENTITIES: Record<string, { title: string; subtitle: string; description: string; domain: string; url: string; attributes: { label: string; value: string }[] }> = {
  'next.js': {
    title: 'Next.js',
    subtitle: 'React Framework for the Web',
    description: 'Next.js is an open-source web development framework created by Vercel enabling React-based web applications with server-side rendering and static site generation.',
    domain: 'nextjs.org',
    url: 'https://nextjs.org',
    attributes: [
      { label: 'Initial Release', value: 'October 2016' },
      { label: 'Original Author', value: 'Vercel / Guillermo Rauch' },
      { label: 'License', value: 'MIT License' },
      { label: 'Language', value: 'TypeScript / JavaScript' },
    ],
  },
  'ai': {
    title: 'Artificial Intelligence',
    subtitle: 'Computer Science Domain',
    description: 'Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans.',
    domain: 'wikipedia.org',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    attributes: [
      { label: 'Field', value: 'Computer Science & Cognitive AI' },
      { label: 'Key Domains', value: 'Machine Learning, LLMs, Computer Vision' },
      { label: 'Status', value: 'Active Global Development' },
    ],
  },
  'google': {
    title: 'Google',
    subtitle: 'Multinational Technology Company',
    description: 'Google LLC is an American multinational technology company focusing on artificial intelligence, search engine technology, online advertising, cloud computing, and hardware.',
    domain: 'google.com',
    url: 'https://www.google.com',
    attributes: [
      { label: 'Founded', value: 'September 4, 1998' },
      { label: 'Founders', value: 'Larry Page, Sergey Brin' },
      { label: 'Parent', value: 'Alphabet Inc.' },
      { label: 'CEO', value: 'Sundar Pichai' },
    ],
  },
  'python': {
    title: 'Python',
    subtitle: 'High-Level Programming Language',
    description: 'Python is a high-level, general-purpose programming language emphasizing code readability with distinct use of significant indentation.',
    domain: 'python.org',
    url: 'https://www.python.org',
    attributes: [
      { label: 'Initial Release', value: 'February 20, 1991' },
      { label: 'Designer', value: 'Guido van Rossum' },
      { label: 'License', value: 'Python Software Foundation' },
    ],
  },
  'supabase': {
    title: 'Supabase',
    subtitle: 'Open Source Firebase Alternative',
    description: 'Supabase is an open source Firebase alternative providing database, authentication, instant APIs, edge functions, and real-time subscriptions built on top of PostgreSQL.',
    domain: 'supabase.com',
    url: 'https://supabase.com',
    attributes: [
      { label: 'Founded', value: '2020' },
      { label: 'Core Database', value: 'PostgreSQL' },
      { label: 'License', value: 'Apache 2.0 / Open Source' },
    ],
  },
};

export function KnowledgeCard({ query, hasResults = true }: KnowledgeCardProps) {
  const cleanQ = query.toLowerCase().trim();
  const entityKey = Object.keys(KNOWLEDGE_ENTITIES).find((k) => cleanQ.includes(k));

  if (!hasResults || !entityKey) return null;
  const entity = KNOWLEDGE_ENTITIES[entityKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/30 via-zinc-900/90 to-cyan-900/30 border border-purple-500/30 shadow-2xl backdrop-blur-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
            {entity.title} <ShieldCheck className="w-4 h-4 text-purple-400" />
          </h3>
          <p className="text-xs text-zinc-400">{entity.subtitle}</p>
        </div>
        <a
          href={entity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-all border border-purple-500/30"
          title="Visit Official Website"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed">{entity.description}</p>

      <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
        {entity.attributes.map((attr, idx) => (
          <div key={idx} className="flex justify-between py-1 border-b border-white/5">
            <span className="text-zinc-400 font-semibold">{attr.label}</span>
            <span className="text-white font-medium text-right">{attr.value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
        <span>Verified Entity Card</span>
        <a href={entity.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 font-bold">
          <Globe className="w-3 h-3" /> {entity.domain}
        </a>
      </div>
    </motion.div>
  );
}
