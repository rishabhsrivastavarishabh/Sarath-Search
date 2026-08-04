"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  ExternalLink,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { AiAnswerData } from '@/lib/ai-answer';

interface AiAnswerCardProps {
  data: AiAnswerData;
  onSelectQuery?: (q: string) => void;
}

export function AiAnswerCard({ data, onSelectQuery }: AiAnswerCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopyAnswer = () => {
    const fullText = `${data.query} - AI Summary\n\n${data.summary}\n\nKey Points:\n${data.key_points.map(p => `- ${p}`).join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-purple-900/30 via-zinc-900/90 to-cyan-950/30 border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-widest bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI Overview
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAnswer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all"
            title="Copy AI Summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Answer'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all"
            title="Share Search Link"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shared ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Summary Body */}
      <p className="text-sm md:text-base text-zinc-200 leading-relaxed font-normal mb-6">
        {data.summary}
      </p>

      {/* Key Points */}
      <div className="mb-6 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Key Takeaways
        </h4>
        {data.key_points.map((point, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
            <span>{point}</span>
          </div>
        ))}
      </div>

      {/* Citation Sources */}
      {data.sources.length > 0 && (
        <div className="mb-6 pt-4 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Top Citation Sources
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-400/40 text-xs text-zinc-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${src.domain}&sz=32`}
                    alt={src.domain}
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-white truncate">{src.title}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors flex-shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related Questions */}
      {data.related_questions.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> People Also Ask
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.related_questions.map((rq, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuery && onSelectQuery(rq)}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 group"
              >
                <span>{rq}</span>
                <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
