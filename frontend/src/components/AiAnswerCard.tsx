"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  Languages,
  RotateCcw,
  TrendingUp,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { AiAnswerData } from '@/lib/ai-answer';

interface AiAnswerCardProps {
  data: AiAnswerData;
  onSelectQuery?: (q: string) => void;
  onLanguageChange?: (lang: string) => void;
  onRegenerate?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'English', name: 'English' },
  { code: 'Hindi', name: 'हिंदी (Hindi)' },
  { code: 'Bengali', name: 'বাংলা (Bengali)' },
  { code: 'Telugu', name: 'తెలుగు (Telugu)' },
  { code: 'Marathi', name: 'मराठी (Marathi)' },
  { code: 'Tamil', name: 'தமிழ் (Tamil)' },
  { code: 'Urdu', name: 'اردو (Urdu)' },
  { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)' },
  { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Malayalam', name: 'മലയാളം (Malayalam)' },
  { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'Spanish', name: 'Español (Spanish)' },
  { code: 'French', name: 'Français (French)' },
  { code: 'German', name: 'Deutsch (German)' },
  { code: 'Japanese', name: '日本語 (Japanese)' },
  { code: 'Chinese', name: '中文 (Chinese)' },
  { code: 'Russian', name: 'Русский (Russian)' },
  { code: 'Arabic', name: 'العربية (Arabic)' },
];

export function AiAnswerCard({ data, onSelectQuery, onLanguageChange, onRegenerate }: AiAnswerCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLang, setCurrentLang] = useState(data.detected_language || 'English');

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopyText = () => {
    const textToCopy = `${data.overview}\n\n${data.detailed_explanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `AI Overview for ${data.query}`,
        text: data.overview,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${data.overview}. ${data.detailed_explanation}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 md:p-8 rounded-3xl bg-glass border border-purple-500/30 shadow-2xl space-y-6 relative overflow-hidden group"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-purple-500/40 text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              AI Overview
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
                Sarath AI
              </span>
            </h2>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Languages className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
            <select
              value={currentLang}
              onChange={(e) => {
                setCurrentLang(e.target.value);
                onLanguageChange && onLanguageChange(e.target.value);
              }}
              className="bg-zinc-950 border border-white/15 rounded-xl pl-8 pr-3 py-1 text-xs text-zinc-300 outline-none hover:border-purple-400 transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Regenerate Button */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all"
              title="Regenerate Answer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Speech Audio Button */}
          <button
            onClick={toggleSpeech}
            className={`p-1.5 rounded-xl border transition-all ${
              isSpeaking ? 'bg-purple-600 text-white border-purple-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title={isSpeaking ? 'Stop Audio' : 'Listen Answer'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyText}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all"
            title="Copy Answer"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all"
            title="Share Link"
          >
            {shared ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 text-xs text-zinc-200">
        {/* 1. Direct Conversational Overview */}
        <div className="text-sm leading-relaxed text-zinc-100 bg-white/5 p-4 rounded-2xl border border-white/5 font-sans">
          {data.overview}
        </div>

        {/* 2. Detailed Explanation */}
        {data.detailed_explanation && (
          <div className="p-4 md:p-5 rounded-2xl bg-zinc-950/60 border border-white/10 leading-relaxed space-y-3 font-sans text-sm text-zinc-200">
            {data.detailed_explanation.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* 3. Important Concepts */}
        {data.key_points && data.key_points.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Important Concepts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {data.key_points.map((pt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span className="text-zinc-200 leading-snug">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 5–10 Relevant Follow-Up Questions */}
        {data.related_questions && data.related_questions.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Follow-Up Questions:
            </span>
            <div className="flex flex-wrap gap-2">
              {data.related_questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuery && onSelectQuery(q)}
                  className="px-3.5 py-1.5 rounded-2xl bg-purple-600/10 hover:bg-purple-600/30 border border-purple-500/20 hover:border-purple-400/50 text-xs text-purple-200 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
