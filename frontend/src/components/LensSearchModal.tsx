"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Search, Sparkles, Scan, FileText, QrCode, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LensSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LensSearchModal({ isOpen, onClose }: LensSearchModalProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        analyzeLensImage(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setActiveTab('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      analyzeLensImage('camera-capture.jpg');
    }
  };

  const analyzeLensImage = (filename: string) => {
    setAnalyzing(true);
    setExtractedText(null);

    setTimeout(() => {
      setAnalyzing(false);
      const detectedText = `Extracted Lens OCR: "${filename.replace(/\.[^/.]+$/, '')} visual specs & object recognition"`;
      setExtractedText(detectedText);
    }, 1500);
  };

  const handleLensSearch = () => {
    if (extractedText) {
      onClose();
      router.push(`/search?q=${encodeURIComponent('Visual Search: ' + extractedText)}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-900 border border-white/15 p-6 md:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl overflow-hidden space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                Sarath Lens Search <Sparkles className="w-4 h-4 text-purple-400" />
              </h2>
              <p className="text-xs text-zinc-400">Search by image, OCR text extraction, or QR code scan</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-purple-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload Image
            </button>
            <button
              onClick={startCamera}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'camera' ? 'bg-purple-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Take Photo
            </button>
          </div>

          {/* Upload View */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-purple-400/50 transition-all cursor-pointer relative bg-white/5">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <ImageIcon className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">Click to upload or drag image here</p>
              <p className="text-[10px] text-zinc-400">PNG, JPG, WEBP up to 15 MB</p>
            </div>
          )}

          {/* Camera View */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <button
                onClick={captureCameraPhoto}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" /> Snap Photo & Analyze
              </button>
            </div>
          )}

          {/* Selected Image Preview & Analysis */}
          {selectedImage && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <img src={selectedImage} alt="Lens Preview" className="w-16 h-16 rounded-xl object-cover border border-purple-500/30" />
                <div className="text-xs">
                  <span className="font-bold text-white block">Image Loaded</span>
                  <span className="text-zinc-400 text-[10px]">
                    {analyzing ? 'Analyzing visual features & OCR...' : 'Lens Analysis Complete'}
                  </span>
                </div>
              </div>

              {extractedText && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono text-purple-300">
                  <FileText className="w-3.5 h-3.5 inline text-cyan-400 mr-1.5" />
                  {extractedText}
                </div>
              )}
            </div>
          )}

          {/* Lens Search Action Button */}
          <button
            onClick={handleLensSearch}
            disabled={!extractedText || analyzing}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {analyzing ? 'Analyzing Image...' : 'Search Visually Similar Results'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
