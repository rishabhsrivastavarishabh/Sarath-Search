"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  User,
  Mail,
  Shield,
  Clock,
  Bookmark,
  Lock,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Camera,
  Check,
  Save,
  Upload,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('developer');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, avatar_url, full_name')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.role) setRole(profile.role);
          if (profile.full_name) setFullName(profile.full_name);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      }
    }
    loadUser();
  }, []);

  /**
   * Compresses uploaded image via HTML5 Canvas to prevent "Request body too large" errors (max 1048576 bytes)
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 15 MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.85 quality (results in < 30 KB Data URL)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          setSuccessMsg('Avatar compressed & loaded successfully! Click "Save Profile Changes" below to apply.');
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl },
      });
      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });
      if (profileError) console.warn('Profile table update notice', profileError);

      setSuccessMsg('Profile and Avatar updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh-pattern flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 gap-8">
        <Sidebar />
        <main className="flex-1 max-w-3xl w-full space-y-6">
          
          {/* Developer & User Search Console Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-zinc-900/90 to-cyan-900/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Developer Search Console</h3>
                <p className="text-xs text-zinc-400">Full telemetry, URL inspection, & crawler access enabled</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/console')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-full text-xs font-bold transition-all hover:scale-105 flex items-center gap-1.5 shadow-lg shadow-purple-500/25"
            >
              Open Search Console <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Edit Account & Profile Card */}
          <div className="p-8 rounded-3xl bg-glass-card border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h1 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                <User className="w-6 h-6 text-purple-400" /> Account & Profile Settings
              </h1>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase">
                {role}
              </span>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Selection & Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Profile Avatar Picture
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-xl bg-zinc-950 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-extrabold text-white">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4" /> Upload Avatar Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-400">Auto-compressed to prevent body size limits. Select preset or file:</p>

                    <div className="flex gap-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Preset"
                          onClick={() => setAvatarUrl(url)}
                          className={cn(
                            'w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition-all hover:scale-110',
                            avatarUrl === url ? 'border-purple-400 ring-2 ring-purple-500/30' : 'border-white/10 opacity-70 hover:opacity-100'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/your-avatar-image.jpg"
                  className="w-full bg-zinc-950 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-zinc-950 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-400 transition-all"
                />
              </div>

              {/* Email Address Readonly */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-zinc-400 outline-none cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
