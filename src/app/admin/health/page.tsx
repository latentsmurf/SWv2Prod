'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity, Server, Database, Globe, Cpu, HardDrive, MemoryStick,
    Wifi, CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock,
    TrendingUp, TrendingDown, Zap, Bot, CreditCard, ArrowUpRight
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceHealth {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    uptime: number;
    lastCheck: Date;
    endpoint: string;
    category: 'ai' | 'storage' | 'database' | 'payment' | 'core';
}

interface SystemMetric {
    name: string;
    value: number;
    max: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
}

interface RecentIncident {
    id: string;
    service: string;
    type: 'outage' | 'degraded' | 'resolved';
    message: string;
    started_at: Date;
    resolved_at?: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SERVICES: ServiceHealth[] = [
    { name: 'OpenAI GPT-4', status: 'healthy', latency: 234, uptime: 99.98, lastCheck: new Date(), endpoint: 'api.openai.com', category: 'ai' },
    { name: 'OpenAI DALL-E', status: 'healthy', latency: 1850, uptime: 99.95, lastCheck: new Date(), endpoint: 'api.openai.com', category: 'ai' },
    { name: 'Replicate (Video)', status: 'healthy', latency: 3200, uptime: 99.87, lastCheck: new Date(), endpoint: 'api.replicate.com', category: 'ai' },
    { name: 'ElevenLabs', status: 'healthy', latency: 189, uptime: 99.92, lastCheck: new Date(), endpoint: 'api.elevenlabs.io', category: 'ai' },
    { name: 'Anthropic Claude', status: 'healthy', latency: 312, uptime: 99.96, lastCheck: new Date(), endpoint: 'api.anthropic.com', category: 'ai' },
    { name: 'Google Cloud Storage', status: 'healthy', latency: 45, uptime: 99.99, lastCheck: new Date(), endpoint: 'storage.googleapis.com', category: 'storage' },
    { name: 'Cloudflare CDN', status: 'healthy', latency: 12, uptime: 99.99, lastCheck: new Date(), endpoint: 'cdn.sceneweaver.ai', category: 'storage' },
    { name: 'MongoDB Atlas', status: 'healthy', latency: 23, uptime: 99.99, lastCheck: new Date(), endpoint: 'cluster0.mongodb.net', category: 'database' },
    { name: 'Redis Cache', status: 'healthy', latency: 2, uptime: 99.99, lastCheck: new Date(), endpoint: 'redis.internal', category: 'database' },
    { name: 'Stripe Payments', status: 'healthy', latency: 156, uptime: 99.99, lastCheck: new Date(), endpoint: 'api.stripe.com', category: 'payment' },
    { name: 'Next.js API', status: 'healthy', latency: 45, uptime: 99.97, lastCheck: new Date(), endpoint: 'api.sceneweaver.ai', category: 'core' },
    { name: 'Python Backend', status: 'healthy', latency: 78, uptime: 99.95, lastCheck: new Date(), endpoint: 'python.internal:8000', category: 'core' },
];

const MOCK_METRICS: SystemMetric[] = [
    { name: 'CPU Usage', value: 42, max: 100, unit: '%', status: 'good' },
    { name: 'Memory', value: 6.8, max: 16, unit: 'GB', status: 'good' },
    { name: 'Disk Usage', value: 234, max: 500, unit: 'GB', status: 'good' },
    { name: 'Network I/O', value: 145, max: 1000, unit: 'MB/s', status: 'good' },
];

const MOCK_INCIDENTS: RecentIncident[] = [
    { id: '1', service: 'Replicate', type: 'resolved', message: 'Elevated latency in video generation', started_at: new Date(Date.now() - 86400000), resolved_at: new Date(Date.now() - 82800000) },
    { id: '2', service: 'MongoDB', type: 'resolved', message: 'Brief connection timeout', started_at: new Date(Date.now() - 259200000), resolved_at: new Date(Date.now() - 258000000) },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function ServiceCard({ service }: { service: ServiceHealth }) {
    const statusColors = {
        healthy: 'bg-green-500',
        degraded: 'bg-yellow-500',
        down: 'bg-red-500'
    };

    const statusText = {
        healthy: 'Operational',
        degraded: 'Degraded',
        down: 'Down'
    };

    return (
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColors[service.status]}`}></span>
                    <span className="text-sm font-medium text-white">{service.name}</span>
                </div>
                <span className={`text-xs ${service.status === 'healthy' ? 'text-green-400' : service.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {statusText[service.status]}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <span className="text-gray-500">Latency</span>
                    <span className={`block font-mono ${service.latency > 1000 ? 'text-yellow-400' : 'text-white'}`}>
                        {service.latency}ms
                    </span>
                </div>
                <div>
                    <span className="text-gray-500">Uptime</span>
                    <span className="block font-mono text-white">{service.uptime}%</span>
                </div>
            </div>
        </div>
    );
}

function MetricGauge({ metric }: { metric: SystemMetric }) {
    const percentage = (metric.value / metric.max) * 100;
    const statusColors = {
        good: 'from-green-500 to-green-400',
        warning: 'from-yellow-500 to-yellow-400',
        critical: 'from-red-500 to-red-400'
    };

    return (
        <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{metric.name}</span>
                <span className="text-lg font-bold text-white">
                    {metric.value}{metric.unit}
                </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                    className={`h-full bg-gradient-to-r ${statusColors[metric.status]} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                <span>0</span>
                <span>{metric.max}{metric.unit}</span>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HealthPage() {
    const [services, setServices] = useState(MOCK_SERVICES);
    const [metrics, setMetrics] = useState(MOCK_METRICS);
    const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastCheck, setLastCheck] = useState(new Date());
    const [activeCategory, setActiveCategory] = useState<'all' | ServiceHealth['category']>('all');

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            setLastCheck(new Date());
            // In production, this would fetch real data
        }, 30000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const handleRefresh = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLastCheck(new Date());
        setLoading(false);
    };

    const filteredServices = activeCategory === 'all' 
        ? services 
        : services.filter(s => s.category === activeCategory);

    const healthyCount = services.filter(s => s.status === 'healthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    const downCount = services.filter(s => s.status === 'down').length;

    const overallStatus = downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : 'healthy';
    const overallMessage = downCount > 0 
        ? `${downCount} service(s) experiencing issues`
        : degradedCount > 0 
            ? `${degradedCount} service(s) degraded`
            : 'All systems operational';

    const categoryIcons = {
        ai: <Bot size={16} />,
        storage: <HardDrive size={16} />,
        database: <Database size={16} />,
        payment: <CreditCard size={16} />,
        core: <Server size={16} />
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">System Health</h1>
                    <p className="text-sm text-gray-500">Monitor service status and performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded bg-white/10 border-white/20"
                        />
                        Auto-refresh (30s)
                    </label>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Overall Status Banner */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${
                overallStatus === 'healthy' ? 'bg-green-500/10 border border-green-500/20' :
                overallStatus === 'degraded' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                'bg-red-500/10 border border-red-500/20'
            }`}>
                <div className="flex items-center gap-3">
                    {overallStatus === 'healthy' ? (
                        <CheckCircle className="text-green-400" size={24} />
                    ) : overallStatus === 'degraded' ? (
                        <AlertTriangle className="text-yellow-400" size={24} />
                    ) : (
                        <XCircle className="text-red-400" size={24} />
                    )}
                    <div>
                        <p className={`font-semibold ${
                            overallStatus === 'healthy' ? 'text-green-400' :
                            overallStatus === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {overallMessage}
                        </p>
                        <p className="text-xs text-gray-500">Last checked: {lastCheck.toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400">{healthyCount} healthy</span>
                    {degradedCount > 0 && <span className="text-yellow-400">{degradedCount} degraded</span>}
                    {downCount > 0 && <span className="text-red-400">{downCount} down</span>}
                </div>
            </div>

            {/* System Metrics */}
            <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">System Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map(metric => (
                        <MetricGauge key={metric.name} metric={metric} />
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeCategory === 'all'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                    }`}
                >
                    All Services
                </button>
                {(['ai', 'storage', 'database', 'payment', 'core'] as const).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            activeCategory === cat
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                    >
                        {categoryIcons[cat]}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Services ({filteredServices.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredServices.map(service => (
                        <ServiceCard key={service.name} service={service} />
                    ))}
                </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Recent Incidents</h3>
                    <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                <div className="p-4">
                    {incidents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                            <p className="text-sm">No incidents in the last 30 days</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {incidents.map(incident => (
                                <div key={incident.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                                    {incident.type === 'resolved' ? (
                                        <CheckCircle size={16} className="text-green-400 mt-0.5" />
                                    ) : incident.type === 'degraded' ? (
                                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                                    ) : (
                                        <XCircle size={16} className="text-red-400 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-white">{incident.service}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                incident.type === 'resolved' ? 'bg-green-500/10 text-green-400' :
                                                incident.type === 'degraded' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                                {incident.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{incident.message}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {incident.started_at.toLocaleDateString()} {incident.started_at.toLocaleTimeString()}
                                            {incident.resolved_at && ` — Resolved ${incident.resolved_at.toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
