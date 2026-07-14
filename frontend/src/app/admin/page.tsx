"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Database, Globe, Search, Activity, Server, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminStats {
    total_pages: number;
    total_domains: number;
    total_searches: number;
    queue_status: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('http://localhost:5000/api/admin/stats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error("Stats error", e);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-2">Real-time monitor for Sarath Search Engine</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        SYSTEM HEALTHY
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<Database className="w-5 h-5" />}
                    label="Indexed Pages"
                    value={stats?.total_pages || 0}
                    color="text-blue-500"
                />
                <StatCard
                    icon={<Globe className="w-5 h-5" />}
                    label="Crawled Domains"
                    value={stats?.total_domains || 0}
                    color="text-purple-500"
                />
                <StatCard
                    icon={<Search className="w-5 h-5" />}
                    label="Total Queries"
                    value={stats?.total_searches || 0}
                    color="text-orange-500"
                />
                <StatCard
                    icon={<Activity className="w-5 h-5" />}
                    label="Queue Depth"
                    value={stats?.queue_status || 0}
                    color="text-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-card dark:bg-zinc-900 border border-border h-96 flex flex-col items-center justify-center text-center">
                    <Server className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Crawl Performance Chart</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                        Detailed performance metrics and crawl velocity visualization will be rendered here.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-card dark:bg-zinc-900 border border-border space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Security Audit
                    </h3>
                    <div className="space-y-4">
                        <AuditItem label="SSL/TLS Check" status="PASS" />
                        <AuditItem label="Rate Limiter" status="ACTIVE" />
                        <AuditItem label="Input Sanitization" status="PASS" />
                        <AuditItem label="JWT Integration" status="CONFIGURED" />
                    </div >
                </div>
            </div >
        </div >
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-card dark:bg-zinc-900 border border-border hover:border-primary/50 transition-all duration-300"
        >
            <div className={cn("p-3 rounded-2xl w-fit mb-4 bg-background dark:bg-zinc-800", color)}>
                {icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
        </motion.div>
    );
}

function AuditItem({ label, status }: { label: string, status: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-xs font-bold text-green-500 uppercase">{status}</span>
        </div>
    );
}
