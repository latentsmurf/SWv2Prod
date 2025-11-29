'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock, Play, Pause, RefreshCw, Trash2, Search, Filter,
    CheckCircle, XCircle, AlertTriangle, Loader2, Calendar,
    Zap, Video, Image, Music, FileText, MoreHorizontal
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Job {
    id: string;
    type: 'video_generation' | 'image_generation' | 'audio_processing' | 'export' | 'batch_process';
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    user_email: string;
    project_name?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    error?: string;
    priority: 'low' | 'normal' | 'high';
}

interface ScheduledJob {
    id: string;
    name: string;
    schedule: string;
    lastRun?: string;
    nextRun: string;
    status: 'active' | 'paused';
    type: 'cleanup' | 'backup' | 'report' | 'maintenance';
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_JOBS: Job[] = [
    { id: '1', type: 'video_generation', status: 'running', progress: 65, user_email: 'netflix@partner.com', project_name: 'Urban Legends S2', created_at: new Date(Date.now() - 300000).toISOString(), started_at: new Date(Date.now() - 180000).toISOString(), priority: 'high' },
    { id: '2', type: 'image_generation', status: 'running', progress: 45, user_email: 'sarah@studio.com', project_name: 'Midnight Romance', created_at: new Date(Date.now() - 600000).toISOString(), started_at: new Date(Date.now() - 420000).toISOString(), priority: 'normal' },
    { id: '3', type: 'batch_process', status: 'queued', progress: 0, user_email: 'john@example.com', project_name: 'Space Odyssey', created_at: new Date(Date.now() - 120000).toISOString(), priority: 'normal' },
    { id: '4', type: 'export', status: 'queued', progress: 0, user_email: 'mike@films.io', created_at: new Date(Date.now() - 60000).toISOString(), priority: 'low' },
    { id: '5', type: 'video_generation', status: 'completed', progress: 100, user_email: 'emma@prod.co', project_name: 'Documentary', created_at: new Date(Date.now() - 1800000).toISOString(), started_at: new Date(Date.now() - 1500000).toISOString(), completed_at: new Date(Date.now() - 900000).toISOString(), priority: 'normal' },
    { id: '6', type: 'audio_processing', status: 'failed', progress: 30, user_email: 'alex@movies.net', created_at: new Date(Date.now() - 3600000).toISOString(), started_at: new Date(Date.now() - 3300000).toISOString(), error: 'Audio codec not supported', priority: 'normal' },
];

const SCHEDULED_JOBS: ScheduledJob[] = [
    { id: '1', name: 'Database Backup', schedule: 'Daily at 2:00 AM', lastRun: new Date(Date.now() - 86400000).toISOString(), nextRun: new Date(Date.now() + 36000000).toISOString(), status: 'active', type: 'backup' },
    { id: '2', name: 'Clean Temp Files', schedule: 'Every 6 hours', lastRun: new Date(Date.now() - 21600000).toISOString(), nextRun: new Date(Date.now() + 600000).toISOString(), status: 'active', type: 'cleanup' },
    { id: '3', name: 'Usage Report', schedule: 'Weekly on Monday', lastRun: new Date(Date.now() - 604800000).toISOString(), nextRun: new Date(Date.now() + 259200000).toISOString(), status: 'active', type: 'report' },
    { id: '4', name: 'Index Optimization', schedule: 'Monthly on 1st', lastRun: new Date(Date.now() - 2592000000).toISOString(), nextRun: new Date(Date.now() + 345600000).toISOString(), status: 'paused', type: 'maintenance' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function JobsPage() {
    const [jobs, setJobs] = useState(MOCK_JOBS);
    const [scheduledJobs, setScheduledJobs] = useState(SCHEDULED_JOBS);
    const [activeTab, setActiveTab] = useState<'queue' | 'scheduled'>('queue');
    const [statusFilter, setStatusFilter] = useState('all');

    // Simulate job progress
    useEffect(() => {
        const interval = setInterval(() => {
            setJobs(prev => prev.map(job => {
                if (job.status === 'running' && job.progress < 100) {
                    const newProgress = Math.min(job.progress + Math.random() * 5, 100);
                    return {
                        ...job,
                        progress: newProgress,
                        status: newProgress >= 100 ? 'completed' : 'running',
                        completed_at: newProgress >= 100 ? new Date().toISOString() : undefined
                    };
                }
                return job;
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const filteredJobs = statusFilter === 'all'
        ? jobs
        : jobs.filter(j => j.status === statusFilter);

    // Stats
    const stats = {
        queued: jobs.filter(j => j.status === 'queued').length,
        running: jobs.filter(j => j.status === 'running').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video_generation': return <Video size={14} />;
            case 'image_generation': return <Image size={14} />;
            case 'audio_processing': return <Music size={14} />;
            case 'export': return <FileText size={14} />;
            case 'batch_process': return <Zap size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-blue-400 bg-blue-500/10';
            case 'completed': return 'text-green-400 bg-green-500/10';
            case 'failed': return 'text-red-400 bg-red-500/10';
            case 'cancelled': return 'text-gray-400 bg-gray-500/10';
            default: return 'text-yellow-400 bg-yellow-500/10';
        }
    };

    const cancelJob = (id: string) => {
        setJobs(prev => prev.map(j => 
            j.id === id ? { ...j, status: 'cancelled' as const } : j
        ));
    };

    const retryJob = (id: string) => {
        setJobs(prev => prev.map(j => 
            j.id === id ? { ...j, status: 'queued' as const, progress: 0, error: undefined } : j
        ));
    };

    const toggleScheduledJob = (id: string) => {
        setScheduledJobs(prev => prev.map(j =>
            j.id === id ? { ...j, status: j.status === 'active' ? 'paused' as const : 'active' as const } : j
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Job Queue</h1>
                    <p className="text-sm text-gray-500">Monitor and manage background jobs</p>
                </div>
                <button
                    onClick={() => setJobs(prev => prev.filter(j => j.status !== 'completed' && j.status !== 'failed'))}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400"
                >
                    <Trash2 size={14} />
                    Clear Finished
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Queued</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.queued}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Running</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.running}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Failed</p>
                    <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('queue')}
                        className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                            activeTab === 'queue' ? 'bg-white/10 text-white' : 'text-gray-400'
                        }`}
                    >
                        Job Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                            activeTab === 'scheduled' ? 'bg-white/10 text-white' : 'text-gray-400'
                        }`}
                    >
                        Scheduled Jobs
                    </button>
                </div>

                {activeTab === 'queue' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="queued">Queued</option>
                        <option value="running">Running</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                )}
            </div>

            {/* Queue Tab */}
            {activeTab === 'queue' && (
                <div className="space-y-3">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Clock size={40} className="mx-auto mb-4 opacity-50" />
                            <p>No jobs in queue</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div
                                key={job.id}
                                className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            {getTypeIcon(job.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white capitalize">
                                                    {job.type.replace('_', ' ')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(job.status)}`}>
                                                    {job.status}
                                                </span>
                                                {job.priority === 'high' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                                                        High Priority
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {job.user_email} {job.project_name && `• ${job.project_name}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {job.status === 'failed' && (
                                            <button
                                                onClick={() => retryJob(job.id)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                        )}
                                        {(job.status === 'queued' || job.status === 'running') && (
                                            <button
                                                onClick={() => cancelJob(job.id)}
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {job.status === 'running' && (
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(job.progress)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all"
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {job.error && (
                                    <p className="text-sm text-red-400 mt-2">
                                        Error: {job.error}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Scheduled Tab */}
            {activeTab === 'scheduled' && (
                <div className="space-y-3">
                    {scheduledJobs.map(job => (
                        <div
                            key={job.id}
                            className={`bg-[#0a0a0a] border rounded-xl p-4 ${
                                job.status === 'active' ? 'border-white/10' : 'border-white/5 opacity-60'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        job.type === 'backup' ? 'bg-blue-500/10 text-blue-400' :
                                        job.type === 'cleanup' ? 'bg-green-500/10 text-green-400' :
                                        job.type === 'report' ? 'bg-purple-500/10 text-purple-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{job.name}</h3>
                                        <p className="text-sm text-gray-500">{job.schedule}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Next run</p>
                                        <p className="text-sm text-white">
                                            {new Date(job.nextRun).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleScheduledJob(job.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            job.status === 'active'
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                    >
                                        {job.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
