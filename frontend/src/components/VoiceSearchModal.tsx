"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, Sparkles, Check, ArrowRight, Settings2 } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onTranscript }: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [autoSearch, setAutoSearch] = useState(true);
  const [statusText, setStatusText] = useState('Click the mic to speak...');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusText('Speech Recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Supports multilingual speech input

      recognition.onstart = () => {
        setIsListening(true);
        setStatusText('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setStatusText('Processing speech...');

        if (event.results[0].isFinal && autoSearch) {
          setTimeout(() => {
            onTranscript(currentTranscript);
            onClose();
          }, 1200);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setStatusText(`Error: ${event.error}. Try again.`);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim() && autoSearch) {
          onTranscript(transcript);
          onClose();
        } else {
          setStatusText('Speech ended. Click mic to try again.');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Voice search failed', err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleConfirmSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg p-8 rounded-3xl bg-gradient-to-br from-purple-950/80 via-zinc-900 to-cyan-950/80 border border-purple-500/30 shadow-2xl space-y-6 text-center overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <h3 className="text-xl font-bold font-outfit text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Voice Search
            </h3>
            <p className="text-xs text-zinc-400">{statusText}</p>
          </div>

          {/* Animated Microphone Glow Circle & Sound Waveform */}
          <div className="relative flex items-center justify-center py-6">
            {isListening && (
              <>
                <div className="absolute w-36 h-36 rounded-full bg-purple-500/20 animate-ping pointer-events-none" />
                <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white scale-110 shadow-purple-500/50'
                  : 'bg-zinc-900 border border-white/20 text-zinc-400 hover:text-white hover:border-purple-400'
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>
          </div>

          {/* Audio Sound Waveform Bar Animation */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 h-8">
              {[40, 70, 100, 60, 90, 50, 80, 45, 95, 65].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['20%', `${h}%`, '20%'] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                  className="w-1.5 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Live Transcription Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 text-left space-y-1 min-h-[70px]">
            <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">Transcribed Speech</span>
            <p className="text-sm font-semibold text-white">
              {transcript || <span className="text-zinc-600 italic">Say something like "Next.js 15 features" or "AI search engine"...</span>}
            </p>
          </div>

          {/* Auto Search Setting Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-purple-400" /> Auto-search when speech ends
            </span>
            <button
              onClick={() => setAutoSearch(!autoSearch)}
              className={`px-3 py-1 rounded-full font-bold border transition-all ${
                autoSearch
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                  : 'bg-white/5 text-zinc-500 border-white/10'
              }`}
            >
              {autoSearch ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Confirm Search Button if Auto-search is off */}
          {!autoSearch && transcript.trim() && (
            <button
              onClick={handleConfirmSubmit}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-2xl font-bold text-xs shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2"
            >
              Search "{transcript.trim()}" <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
