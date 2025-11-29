'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, FolderOpen, CreditCard, Activity, TrendingUp, TrendingDown,
    ArrowRight, AlertTriangle, CheckCircle, Clock, Zap, Eye, Download,
    Bot, Database, Globe, Loader2, RefreshCw
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
    users: { total: number; active: number; new: number; growth: number };
    projects: { total: number; active: number; completed: number; growth: number };
    credits: { consumed: number; remaining: number; revenue: number; growth: number };
    system: { uptime: number; latency: number; errorRate: number };
}

interface RecentActivity {
    id: string;
    type: 'user_signup' | 'project_created' | 'payment' | 'generation' | 'error';
    message: string;
    user?: string;
    timestamp: Date;
}

interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    latency: number;
    lastCheck: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_STATS: DashboardStats = {
    users: { total: 12847, active: 3421, new: 234, growth: 12.5 },
    projects: { total: 45692, active: 8734, completed: 32156, growth: 8.3 },
    credits: { consumed: 2847593, remaining: 15234000, revenue: 127840, growth: 23.7 },
    system: { uptime: 99.97, latency: 142, errorRate: 0.03 }
};

const MOCK_ACTIVITIES: RecentActivity[] = [
    { id: '1', type: 'user_signup', message: 'New user registered', user: 'john@example.com', timestamp: new Date(Date.now() - 120000) },
    { id: '2', type: 'project_created', message: 'New project "Midnight Romance" created', user: 'sarah@studio.com', timestamp: new Date(Date.now() - 300000) },
    { id: '3', type: 'payment', message: 'Pro subscription purchased ($99)', user: 'mike@films.io', timestamp: new Date(Date.now() - 600000) },
    { id: '4', type: 'generation', message: '150 credits consumed for batch generation', user: 'emma@prod.co', timestamp: new Date(Date.now() - 900000) },
    { id: '5', type: 'error', message: 'API rate limit exceeded', user: 'bulk@api.com', timestamp: new Date(Date.now() - 1200000) },
    { id: '6', type: 'user_signup', message: 'New user registered', user: 'alex@movies.net', timestamp: new Date(Date.now() - 1500000) },
    { id: '7', type: 'project_created', message: 'New project "Urban Legends S2" created', user: 'netflix@partner.com', timestamp: new Date(Date.now() - 1800000) },
];

const MOCK_SERVICES: ServiceStatus[] = [
    { name: 'OpenAI GPT-4', status: 'operational', latency: 234, lastCheck: new Date() },
    { name: 'Replicate (Video)', status: 'operational', latency: 1250, lastCheck: new Date() },
    { name: 'ElevenLabs', status: 'operational', latency: 189, lastCheck: new Date() },
    { name: 'Google Cloud Storage', status: 'operational', latency: 45, lastCheck: new Date() },
    { name: 'MongoDB Atlas', status: 'operational', latency: 23, lastCheck: new Date() },
    { name: 'Stripe Payments', status: 'operational', latency: 156, lastCheck: new Date() },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatCard({ 
    title, value, subtitle, icon: Icon, trend, trendUp, href 
}: { 
    title: string; 
    value: string | number; 
    subtitle: string; 
    icon: any;
    trend?: number;
    trendUp?: boolean;
    href?: string;
}) {
    const content = (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors group">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-gray-400 group-hover:bg-yellow-500/10 group-hover:text-yellow-400 transition-colors">
                    <Icon size={20} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}%
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500">{title}</div>
            <div className="text-[10px] text-gray-600 mt-1">{subtitle}</div>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
    const icons = {
        user_signup: <Users size={14} className="text-blue-400" />,
        project_created: <FolderOpen size={14} className="text-purple-400" />,
        payment: <CreditCard size={14} className="text-green-400" />,
        generation: <Zap size={14} className="text-yellow-400" />,
        error: <AlertTriangle size={14} className="text-red-400" />,
    };

    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="p-2 bg-white/5 rounded-lg">
                {icons[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{activity.message}</p>
                {activity.user && (
                    <p className="text-xs text-gray-500 truncate">{activity.user}</p>
                )}
            </div>
            <span className="text-[10px] text-gray-600 whitespace-nowrap">{timeAgo(activity.timestamp)}</span>
        </div>
    );
}

function ServiceStatusRow({ service }: { service: ServiceStatus }) {
    const statusColors = {
        operational: 'bg-green-500',
        degraded: 'bg-yellow-500',
        down: 'bg-red-500'
    };

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${statusColors[service.status]}`}></span>
                <span className="text-sm text-gray-300">{service.name}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{service.latency}ms</span>
                <span className={`text-xs capitalize ${
                    service.status === 'operational' ? 'text-green-400' :
                    service.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                    {service.status}
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
    const [activities, setActivities] = useState<RecentActivity[]>(MOCK_ACTIVITIES);
    const [services, setServices] = useState<ServiceStatus[]>(MOCK_SERVICES);
    const [loading, setLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const handleRefresh = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLastRefresh(new Date());
        setLoading(false);
    };

    // Quick action cards
    const quickActions = [
        { icon: Users, label: 'Add User', href: '/admin/users?action=add', color: 'blue' },
        { icon: Bot, label: 'Test APIs', href: '/admin/api-tester', color: 'purple' },
        { icon: Zap, label: 'Clear Cache', href: '/admin/settings?action=cache', color: 'yellow' },
        { icon: Download, label: 'Export Data', href: '/admin/database?action=export', color: 'green' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500">Welcome back! Here's what's happening.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.users.total.toLocaleString()}
                    subtitle={`${stats.users.active.toLocaleString()} active • ${stats.users.new} new today`}
                    icon={Users}
                    trend={stats.users.growth}
                    trendUp={true}
                    href="/admin/users"
                />
                <StatCard
                    title="Projects"
                    value={stats.projects.total.toLocaleString()}
                    subtitle={`${stats.projects.active.toLocaleString()} active • ${stats.projects.completed.toLocaleString()} completed`}
                    icon={FolderOpen}
                    trend={stats.projects.growth}
                    trendUp={true}
                    href="/admin/projects"
                />
                <StatCard
                    title="Credits Consumed"
                    value={(stats.credits.consumed / 1000000).toFixed(2) + 'M'}
                    subtitle={`$${(stats.credits.revenue / 1000).toFixed(1)}k revenue this month`}
                    icon={Zap}
                    trend={stats.credits.growth}
                    trendUp={true}
                    href="/admin/credits"
                />
                <StatCard
                    title="System Uptime"
                    value={stats.system.uptime + '%'}
                    subtitle={`${stats.system.latency}ms avg latency • ${stats.system.errorRate}% errors`}
                    icon={Activity}
                    trend={0.02}
                    trendUp={true}
                    href="/admin/health"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, i) => (
                    <Link
                        key={i}
                        href={action.href}
                        className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
                    >
                        <div className={`p-2 rounded-lg bg-${action.color}-500/10 text-${action.color}-400 group-hover:bg-${action.color}-500/20`}>
                            <action.icon size={18} />
                        </div>
                        <span className="text-sm font-medium text-white">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Recent Activity</h3>
                        <Link href="/admin/logs" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        {activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>

                {/* Service Status */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Service Status</h3>
                        <Link href="/admin/health" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                            Details <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-4">
                        {services.map((service, i) => (
                            <ServiceStatusRow key={i} service={service} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Usage Chart Placeholder */}
                <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Credit Usage (Last 7 Days)</h3>
                    <div className="h-48 flex items-end gap-2">
                        {[65, 45, 78, 52, 89, 67, 94].map((value, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                    className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400/50 rounded-t"
                                    style={{ height: `${value}%` }}
                                />
                                <span className="text-[10px] text-gray-500">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-4">Alerts</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-white">High API usage</p>
                                <p className="text-xs text-gray-400">OpenAI costs up 15% this week</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <CheckCircle size={16} className="text-green-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-white">Database optimized</p>
                                <p className="text-xs text-gray-400">Auto-cleanup completed</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <Clock size={16} className="text-blue-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-white">Scheduled maintenance</p>
                                <p className="text-xs text-gray-400">Dec 1st, 2:00 AM UTC</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
