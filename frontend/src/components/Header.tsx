"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Settings,
  User,
  LogOut,
  Bookmark,
  Clock,
  Shield,
  Search,
  LayoutDashboard,
  Moon,
  Sun,
  Laptop,
  Sliders,
  LogIn
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthModal } from './AuthModal';
import { Logo } from './Logo';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.role) setUserRole(profile.role);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      }
    }
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.role) setUserRole(profile.role);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      } else {
        setUser(null);
        setUserRole('user');
        setAvatarUrl('');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
    setUser(null);
    setUserRole('user');
    setAvatarUrl('');
    router.push('/');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-glass border-b border-white/10 px-6 py-3 flex items-center justify-between backdrop-blur-xl">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Logo size="sm" showTagline={false} onClick={() => router.push('/')} />
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            2.0
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-300">
          <button
            onClick={() => router.push('/')}
            className="hover:text-white hover:scale-105 transition-all"
          >
            Home
          </button>
          <button
            onClick={() => router.push('/search?q=technology')}
            className="hover:text-white hover:scale-105 transition-all"
          >
            Search
          </button>
          <button
            onClick={() => router.push('/open')}
            className="hover:text-white hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5 text-purple-400" /> App Store
          </button>
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => router.push('/settings')}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-400" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl z-50 text-xs">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                  <span className="font-bold text-white uppercase tracking-wider">Notifications</span>
                  <span className="text-[10px] text-purple-400">Mark all read</span>
                </div>
                <div className="space-y-2 text-zinc-300">
                  <div className="p-2 rounded-xl bg-white/5">
                    <p className="font-bold text-white">Sarath Search v3.1 Active</p>
                    <p className="text-[11px] text-zinc-400">Custom profile avatars & developer console ready.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Auth or Avatar Dropdown Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-0.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-purple-500/50 shadow-md"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-60 py-2 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl z-50 text-xs">
                  <div className="px-4 py-2 border-b border-white/10 mb-1 flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-purple-500/40" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowDropdown(false); router.push('/profile'); }}
                    className="w-full px-4 py-2 text-left text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-purple-400" /> My Profile
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); router.push('/bookmarks'); }}
                    className="w-full px-4 py-2 text-left text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2.5"
                  >
                    <Bookmark className="w-4 h-4 text-cyan-400" /> Bookmarks
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); router.push('/history'); }}
                    className="w-full px-4 py-2 text-left text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2.5"
                  >
                    <Clock className="w-4 h-4 text-amber-400" /> History
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); router.push('/settings'); }}
                    className="w-full px-4 py-2 text-left text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" /> Settings
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); router.push('/admin/console'); }}
                    className="w-full px-4 py-2 text-left text-cyan-300 hover:bg-cyan-500/20 flex items-center gap-2.5 font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Search Console
                  </button>

                  {/* ADMIN ONLY OPTIONS */}
                  {userRole === 'admin' && (
                    <>
                      <div className="my-1 border-t border-white/10" />
                      <div className="px-4 py-1 text-[9px] font-extrabold uppercase text-purple-400 tracking-wider">
                        Admin Suite
                      </div>
                      <button
                        onClick={() => { setShowDropdown(false); router.push('/admin'); }}
                        className="w-full px-4 py-2 text-left text-purple-300 hover:bg-purple-500/20 flex items-center gap-2.5 font-semibold"
                      >
                        <Shield className="w-4 h-4 text-purple-400" /> Admin Panel
                      </button>
                    </>
                  )}

                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
