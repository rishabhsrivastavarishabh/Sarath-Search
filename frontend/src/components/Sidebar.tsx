"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Image as ImageIcon,
  Video,
  Newspaper,
  FileText,
  MapPin,
  ShoppingBag,
  Bookmark,
  Clock,
  Settings,
  Shield,
  LayoutDashboard,
  Bot,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  currentCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export function Sidebar({ currentCategory = 'all', onSelectCategory }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    async function fetchRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    }
    fetchRole();
  }, []);

  const navItems = [
    { label: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
    { label: 'All', icon: <Search className="w-4 h-4" />, category: 'all' },
    { label: 'Images', icon: <ImageIcon className="w-4 h-4" />, category: 'images' },
    { label: 'Videos', icon: <Video className="w-4 h-4" />, category: 'videos' },
    { label: 'News', icon: <Newspaper className="w-4 h-4" />, category: 'news' },
    { label: 'Documents', icon: <FileText className="w-4 h-4" />, category: 'docs' },
    { label: 'Maps', icon: <MapPin className="w-4 h-4" />, category: 'maps' },
    { label: 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, category: 'shopping' },
    { label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" />, path: '/bookmarks' },
    { label: 'History', icon: <Clock className="w-4 h-4" />, path: '/history' },
    { label: 'Search Console', icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />, path: '/admin/console' },
    { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 p-4 rounded-3xl bg-glass-card border border-white/10 gap-1 sticky top-20 h-[calc(100vh-110px)] backdrop-blur-xl">
      <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
        Categories & Menu
      </div>

      {navItems.map((item) => {
        const isActive = item.category
          ? currentCategory === item.category
          : pathname === item.path;

        return (
          <button
            key={item.label}
            onClick={() => {
              if (item.category && onSelectCategory) {
                onSelectCategory(item.category);
              } else if (item.path) {
                router.push(item.path);
              }
            }}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-semibold transition-all w-full text-left',
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-md font-bold'
                : 'text-zinc-400 hover:bg-white/10 hover:text-white'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* ADMIN-ONLY SIDEBAR SECTION */}
      {userRole === 'admin' && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
            Admin Suite
          </div>

          <button
            onClick={() => router.push('/admin')}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-semibold transition-all w-full text-left',
              pathname === '/admin'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-zinc-400 hover:bg-white/10 hover:text-purple-300'
            )}
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => router.push('/admin/console')}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-semibold transition-all w-full text-left',
              pathname === '/admin/console'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-zinc-400 hover:bg-white/10 hover:text-cyan-300'
            )}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Search Console</span>
          </button>

          <button
            onClick={() => router.push('/admin/console')}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-400 hover:bg-white/10 hover:text-amber-300 transition-all w-full text-left"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Crawler Engine</span>
          </button>

          <button
            onClick={() => router.push('/admin/console')}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-400 hover:bg-white/10 hover:text-green-300 transition-all w-full text-left"
          >
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span>Analytics</span>
          </button>
        </div>
      )}
    </aside>
  );
}
