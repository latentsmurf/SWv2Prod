'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Zap, FolderOpen,
    Download, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight, Globe,
    PieChart, Activity, Target, Loader2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DailyData {
    date: string;
    users: number;
    revenue: number;
    credits: number;
    projects: number;
}

interface PlanDistribution {
    plan: string;
    users: number;
    percentage: number;
    color: string;
}

interface FeatureUsage {
    feature: string;
    usage: number;
    growth: number;
}

interface RevenueBreakdown {
    source: string;
    amount: number;
    percentage: number;
}

interface ChurnData {
    rate: number;
    trend: number;
    reasons: { reason: string; count: number; percentage: number }[];
}

interface GeoData {
    country: string;
    users: number;
    revenue: number;
    flag: string;
}

interface AnalyticsData {
    summary: {
        totalUsers: number;
        totalRevenue: number;
        totalCredits: number;
        totalProjects: number;
        avgRevenuePerUser: number;
        revenueGrowth: number;
        userGrowth: number;
    };
    dailyData: DailyData[];
    planDistribution: PlanDistribution[];
    topFeatures: FeatureUsage[];
    revenueBreakdown: RevenueBreakdown[];
    churnData: ChurnData;
    geoData: GeoData[];
    period: number;
}

// ============================================================================
// SIMPLE CHART COMPONENTS
// ============================================================================

function MiniBarChart({ data, dataKey, color }: { data: DailyData[]; dataKey: keyof DailyData; color: string }) {
    const values = data.map(d => d[dataKey] as number);
    const max = Math.max(...values);
    
    return (
        <div className="flex items-end gap-0.5 h-16">
            {data.slice(-14).map((d, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t transition-all hover:opacity-80"
                    style={{
                        height: `${((d[dataKey] as number) / max) * 100}%`,
                        backgroundColor: color,
                        minHeight: '2px'
                    }}
                    title={`${d.date}: ${d[dataKey]?.toLocaleString()}`}
                />
            ))}
        </div>
    );
}

function DonutChart({ data }: { data: PlanDistribution[] }) {
    const total = data.reduce((sum, d) => sum + d.percentage, 0);
    let currentAngle = 0;
    
    const segments = data.map(d => {
        const angle = (d.percentage / total) * 360;
        const segment = { ...d, startAngle: currentAngle, endAngle: currentAngle + angle };
        currentAngle += angle;
        return segment;
    });
    
    return (
        <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {segments.map((seg, i) => {
                    const startX = 50 + 40 * Math.cos((seg.startAngle * Math.PI) / 180);
                    const startY = 50 + 40 * Math.sin((seg.startAngle * Math.PI) / 180);
                    const endX = 50 + 40 * Math.cos((seg.endAngle * Math.PI) / 180);
                    const endY = 50 + 40 * Math.sin((seg.endAngle * Math.PI) / 180);
                    const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
                    
                    return (
                        <path
                            key={i}
                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                            fill={seg.color}
                            className="hover:opacity-80 transition-opacity"
                        />
                    );
                })}
                <circle cx="50" cy="50" r="25" fill="#0a0a0a" />
            </svg>
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?period=${period}`);
            if (res.ok) {
                const analyticsData = await res.json();
                setData(analyticsData);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    const { summary, dailyData, planDistribution, topFeatures, revenueBreakdown, churnData, geoData } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-sm text-gray-500">Business intelligence and metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="14">Last 14 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users size={20} className="text-blue-400" />
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium ${summary.userGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.userGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(summary.userGrowth)}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">{summary.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">New Users (period)</p>
                    <MiniBarChart data={dailyData} dataKey="users" color="#3b82f6" />
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign size={20} className="text-green-400" />
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium ${summary.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.revenueGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(summary.revenueGrowth)}%
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-white">${summary.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Revenue (period)</p>
                    <MiniBarChart data={dailyData} dataKey="revenue" color="#22c55e" />
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Zap size={20} className="text-yellow-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{summary.totalCredits.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Credits Consumed</p>
                    <MiniBarChart data={dailyData} dataKey="credits" color="#eab308" />
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <FolderOpen size={20} className="text-purple-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{summary.totalProjects.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Projects Created</p>
                    <MiniBarChart data={dailyData} dataKey="projects" color="#8b5cf6" />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Plan Distribution */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Subscription Distribution</h3>
                    <div className="flex items-center gap-6">
                        <DonutChart data={planDistribution} />
                        <div className="space-y-2">
                            {planDistribution.map((plan, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                                    <span className="text-sm text-gray-400">{plan.plan}</span>
                                    <span className="text-xs text-white font-medium ml-auto">{plan.users.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Revenue Breakdown</h3>
                    <div className="space-y-4">
                        {revenueBreakdown.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">{item.source}</span>
                                    <span className="text-white font-medium">${item.amount.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-gray-500">ARPU (Avg Revenue Per User)</p>
                        <p className="text-xl font-bold text-white">${summary.avgRevenuePerUser.toFixed(2)}</p>
                    </div>
                </div>

                {/* Churn Rate */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Churn Analysis</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div>
                            <p className="text-3xl font-bold text-white">{churnData.rate}%</p>
                            <p className="text-xs text-gray-500">Monthly Churn Rate</p>
                        </div>
                        <span className={`flex items-center gap-1 text-sm ${churnData.trend < 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {churnData.trend < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                            {Math.abs(churnData.trend)}% vs last month
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Top Churn Reasons</p>
                    <div className="space-y-2">
                        {churnData.reasons.slice(0, 3).map((reason, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">{reason.reason}</span>
                                <span className="text-white">{reason.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Top Features */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Feature Usage</h3>
                    <div className="space-y-3">
                        {topFeatures.map((feature, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-white">{feature.feature}</span>
                                        <span className="text-xs text-gray-400">{feature.usage.toLocaleString()} uses</span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full"
                                            style={{ width: `${(feature.usage / topFeatures[0].usage) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className={`text-xs ${feature.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {feature.growth >= 0 ? '+' : ''}{feature.growth}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Geographic Distribution</h3>
                        <Globe size={16} className="text-gray-500" />
                    </div>
                    <div className="space-y-3">
                        {geoData.map((geo, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-lg">{geo.flag}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-white">{geo.country}</span>
                                        <span className="text-xs text-gray-400">{geo.users.toLocaleString()} users</span>
                                    </div>
                                </div>
                                <span className="text-sm text-green-400">${geo.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
