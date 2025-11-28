'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Clock, Image, Film, Users,
    Calendar, Zap, Target, PieChart, ArrowUp, ArrowDown,
    Loader2, Download, Filter
} from 'lucide-react';

interface AnalyticsData {
    overview: {
        total_projects: number;
        total_scenes: number;
        total_shots: number;
        total_assets: number;
        credits_used: number;
        generation_time_avg: number;
    };
    trends: {
        date: string;
        shots_generated: number;
        credits_used: number;
    }[];
    generation_stats: {
        total_generations: number;
        successful: number;
        failed: number;
        avg_time: number;
    };
    asset_breakdown: {
        cast: number;
        locations: number;
        wardrobe: number;
        props: number;
    };
    recent_activity: {
        type: string;
        count: number;
        change: number;
    }[];
}

interface ProductionAnalyticsProps {
    projectId?: string;
    dateRange?: 'week' | 'month' | 'year' | 'all';
}

export default function ProductionAnalytics({ projectId, dateRange = 'month' }: ProductionAnalyticsProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState(dateRange);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                let url = `/api/analytics?range=${selectedRange}`;
                if (projectId) url += `&project_id=${projectId}`;

                const res = await fetch(url);
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [projectId, selectedRange]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <BarChart3 className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">No analytics data available</p>
            </div>
        );
    }

    const statCards = [
        { 
            label: 'Total Projects', 
            value: data.overview.total_projects, 
            icon: Film, 
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
        },
        { 
            label: 'Scenes Created', 
            value: data.overview.total_scenes, 
            icon: Target, 
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        { 
            label: 'Shots Generated', 
            value: data.overview.total_shots, 
            icon: Image, 
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        { 
            label: 'Credits Used', 
            value: data.overview.credits_used, 
            icon: Zap, 
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-yellow-500" />
                        Production Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track your production metrics and usage
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Range */}
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="year">Last year</option>
                        <option value="all">All time</option>
                    </select>

                    {/* Export */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-[#121212] border border-white/5 rounded-xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={stat.color} size={24} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">
                                {stat.value.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Generation Trend */}
                <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={18} />
                        Generation Trend
                    </h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {data.trends.slice(-14).map((day, index) => {
                            const maxShots = Math.max(...data.trends.map(d => d.shots_generated)) || 1;
                            const height = (day.shots_generated / maxShots) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-green-500/50 rounded-t hover:bg-green-500 transition-colors"
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                        title={`${day.shots_generated} shots`}
                                    />
                                    {index % 2 === 0 && (
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(day.date).getDate()}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Asset Breakdown */}
                <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                        <PieChart className="text-purple-400" size={18} />
                        Asset Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Cast', value: data.asset_breakdown.cast, color: 'bg-purple-500' },
                            { label: 'Locations', value: data.asset_breakdown.locations, color: 'bg-blue-500' },
                            { label: 'Wardrobe', value: data.asset_breakdown.wardrobe, color: 'bg-pink-500' },
                            { label: 'Props', value: data.asset_breakdown.props, color: 'bg-orange-500' },
                        ].map((item, index) => {
                            const total = Object.values(data.asset_breakdown).reduce((a, b) => a + b, 0) || 1;
                            const percent = Math.round((item.value / total) * 100);
                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">{item.label}</span>
                                            <span className="text-sm text-white font-medium">{item.value}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full mt-1">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Generation Stats */}
            <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-400" size={18} />
                    Generation Performance
                </h3>
                <div className="grid grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Generations</p>
                        <p className="text-2xl font-bold text-white">
                            {data.generation_stats.total_generations.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Success Rate</p>
                        <p className="text-2xl font-bold text-green-400">
                            {data.generation_stats.total_generations > 0
                                ? Math.round((data.generation_stats.successful / data.generation_stats.total_generations) * 100)
                                : 0}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Failed</p>
                        <p className="text-2xl font-bold text-red-400">
                            {data.generation_stats.failed}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Avg. Time</p>
                        <p className="text-2xl font-bold text-white">
                            {data.generation_stats.avg_time}s
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Clock className="text-blue-400" size={18} />
                    Recent Activity Summary
                </h3>
                <div className="grid grid-cols-5 gap-4">
                    {data.recent_activity.map((activity, index) => (
                        <div key={index} className="text-center p-4 bg-white/5 rounded-xl">
                            <p className="text-2xl font-bold text-white">{activity.count}</p>
                            <p className="text-xs text-gray-500 capitalize mb-2">{activity.type}</p>
                            <div className={`flex items-center justify-center gap-1 text-xs ${
                                activity.change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {activity.change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {Math.abs(activity.change)}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
