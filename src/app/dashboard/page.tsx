'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Plus, Film, Users, MapPin, Shirt, Package, ArrowRight,
    Clock, Loader2, Play, Edit2, Trash2, MoreHorizontal,
    Sparkles, FolderOpen, Layers, Camera, Check, Zap,
    FileText, Calendar, TrendingUp, Star, ChevronRight, X
} from 'lucide-react';
import { Project, Asset } from '@/types';
import ProjectTemplates from '@/components/wizard/ProjectTemplates';
import RecentProjects from '@/components/ui/RecentProjects';

interface DashboardProject {
    id: string;
    name: string;
    thumbnail?: string;
    lastEdited: string;
    status: 'pre-production' | 'production' | 'post-production' | 'completed';
    scenesCount: number;
    shotsCount: number;
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<DashboardProject[]>([]);
    const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTemplates, setShowTemplates] = useState(searchParams.get('showTemplates') === 'true');
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalAssets: 0,
        completedShots: 0,
        creditsBalance: 100
    });

    // Fetch projects and stats
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch projects
                const projectsRes = await fetch('/api/projects');
                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    const formattedProjects: DashboardProject[] = projectsData
                        .slice(0, 6)
                        .map((p: any) => ({
                            id: p.id || p._id,
                            name: p.name,
                            thumbnail: p.thumbnail,
                            lastEdited: formatTimeAgo(p.updated_at || p.created_at),
                            status: p.status || 'pre-production',
                            scenesCount: p.scenes_count || 0,
                            shotsCount: p.shots_count || 0
                        }));
                    setProjects(formattedProjects);
                    setStats(prev => ({ ...prev, totalProjects: projectsData.length }));
                }

                // Fetch recent assets from library
                const assetsRes = await fetch('/api/library/assets');
                if (assetsRes.ok) {
                    const assetsData = await assetsRes.json();
                    setRecentAssets(assetsData.slice(0, 8));
                    setStats(prev => ({ ...prev, totalAssets: assetsData.length }));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pre-production': return { label: 'Pre-Prod', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
            case 'production': return { label: 'Production', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
            case 'post-production': return { label: 'Post-Prod', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
            case 'completed': return { label: 'Complete', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
            default: return { label: status, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
        }
    };

    const quickActions = [
        { icon: Plus, label: 'New Project', description: 'Start a new production', href: '/new-project', color: 'from-yellow-500 to-orange-500', primary: true },
        { icon: FileText, label: 'Import Script', description: 'Upload .fountain or PDF', href: '/production/pre-production', color: 'from-blue-500 to-cyan-500' },
        { icon: Camera, label: 'Generate Shots', description: 'AI-powered shot generation', href: '/production', color: 'from-purple-500 to-pink-500' },
        { icon: Sparkles, label: 'Repair Studio', description: 'Fix and enhance shots', href: '/production/repair', color: 'from-green-500 to-emerald-500' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="animate-spin text-yellow-500" size={24} />
                    </div>
                    <p className="text-gray-500 text-sm">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white">
            {/* Hero Header */}
            <div className="relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                
                <div className="relative max-w-7xl mx-auto px-8 py-12">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm text-gray-500">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</span>
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">
                                    Pro Plan
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-3">
                                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">SceneWeaver</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl">
                                Your AI-powered film production studio. From script to screen, we've got you covered.
                            </p>
                        </div>
                        
                        <Link
                            href="/new-project"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
                        >
                            <Plus size={20} />
                            New Project
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mt-10">
                        {[
                            { label: 'Active Projects', value: stats.totalProjects, icon: Film, trend: '+2 this week', color: 'text-yellow-500 dark:text-yellow-400' },
                            { label: 'Total Assets', value: stats.totalAssets, icon: FolderOpen, trend: '+12 new', color: 'text-blue-500 dark:text-blue-400' },
                            { label: 'Shots Rendered', value: stats.completedShots, icon: Camera, trend: '4 in progress', color: 'text-purple-500 dark:text-purple-400' },
                            { label: 'Credits Balance', value: stats.creditsBalance, icon: Zap, trend: 'Unlimited renders', color: 'text-green-500 dark:text-green-400' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors group shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors ${stat.color}`}>
                                        <stat.icon size={18} />
                                    </div>
                                    <TrendingUp size={14} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">{stat.trend}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 pb-16">
                {/* Quick Actions */}
                <div className="mb-12">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {quickActions.map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                className={`group relative p-5 rounded-2xl border transition-all overflow-hidden ${
                                    action.primary
                                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:border-yellow-500/40'
                                        : 'bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 shadow-sm'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <action.icon size={20} className="text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.label}</h3>
                                <p className="text-xs text-gray-500">{action.description}</p>
                                <ChevronRight size={16} className="absolute top-5 right-5 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Projects - 2 columns */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Projects</h2>
                            <Link href="/projects" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>

                        {projects.length === 0 ? (
                            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <Film className="text-gray-400 dark:text-gray-600" size={28} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                                    Create your first project to start bringing your vision to life.
                                </p>
                                <Link
                                    href="/new-project"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-colors"
                                >
                                    <Plus size={18} />
                                    Create Project
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map((project) => {
                                    const statusConfig = getStatusConfig(project.status);
                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/production?projectId=${project.id}`}
                                            className="group bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-video bg-gray-100 dark:bg-black relative">
                                                {project.thumbnail ? (
                                                    <img
                                                        src={project.thumbnail}
                                                        alt={project.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 dark:from-gray-900 to-gray-100 dark:to-black">
                                                        <Film className="text-gray-300 dark:text-gray-800" size={40} />
                                                    </div>
                                                )}
                                                
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-3 bg-yellow-500 rounded-xl text-black hover:bg-yellow-400 transition-colors">
                                                            <Play size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-medium border ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors truncate">
                                                    {project.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={11} />
                                                        {project.lastEdited}
                                                    </span>
                                                    <span>{project.scenesCount} scenes</span>
                                                    <span>{project.shotsCount} shots</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Production Workflow */}
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                Production Workflow
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { icon: FileText, label: 'Pre-Production', href: '/production/pre-production', description: 'Script, casting, locations' },
                                    { icon: Film, label: 'Production', href: '/production', description: 'Scenes, shots, storyboards' },
                                    { icon: Layers, label: 'Post-Production', href: '/production/post', description: 'Edit, effects, export' },
                                ].map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="p-2 rounded-lg bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                            <item.icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{item.description}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Asset Libraries */}
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Asset Libraries
                                </h3>
                                <Link href="/production/library" className="text-[10px] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    View all
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: Users, label: 'Cast', color: 'text-purple-500 dark:text-purple-400 bg-purple-500/10' },
                                    { icon: MapPin, label: 'Locations', color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10' },
                                    { icon: Shirt, label: 'Wardrobe', color: 'text-pink-500 dark:text-pink-400 bg-pink-500/10' },
                                    { icon: Package, label: 'Props', color: 'text-orange-500 dark:text-orange-400 bg-orange-500/10' },
                                ].map((cat, i) => (
                                    <Link
                                        key={i}
                                        href={`/production/library`}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <div className={`p-1.5 rounded-lg ${cat.color}`}>
                                            <cat.icon size={14} />
                                        </div>
                                        <span className="text-xs text-gray-900 dark:text-white">{cat.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Pro Tip */}
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Star size={16} className="text-yellow-500 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Pro Tip</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Use <kbd className="px-1.5 py-0.5 bg-black/20 dark:bg-black/30 rounded text-[10px] mx-0.5">⌘K</kbd> to quickly search and navigate anywhere in your workspace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Browse Templates Button */}
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="w-full p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl text-left hover:border-pink-500/40 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/20 rounded-lg">
                                    <Sparkles size={16} className="text-pink-500 dark:text-pink-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Project Templates</h4>
                                    <p className="text-xs text-gray-500">Start with a pre-built template</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Templates Modal */}
            {showTemplates && (
                <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/90 flex items-center justify-center p-8 overflow-y-auto">
                    <div className="w-full max-w-5xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Templates</h2>
                                <p className="text-sm text-gray-500">Choose a template to jumpstart your project</p>
                            </div>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <ProjectTemplates showCreateButton={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="animate-spin text-yellow-500" size={24} />
                </div>
                <p className="text-gray-500 text-sm">Loading your workspace...</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}
