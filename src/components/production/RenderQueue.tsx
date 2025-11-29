'use client';

import React, { useState, useEffect } from 'react';
import {
    Play, Pause, Square, Trash2, RefreshCw, Clock, Check,
    AlertCircle, ChevronDown, ChevronUp, Loader2, Image,
    Film, Music, Mic, X, MoreHorizontal, Zap
} from 'lucide-react';

interface RenderJob {
    id: string;
    type: 'image' | 'video' | 'audio' | 'voiceover' | 'music';
    name: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
    progress: number;
    project_id: string;
    project_name: string;
    shot_id?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    error?: string;
    result_url?: string;
    estimated_time?: number; // seconds
}

interface RenderQueueProps {
    projectId?: string;
    compact?: boolean;
}

const TYPE_CONFIG = {
    image: { icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    video: { icon: Film, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    audio: { icon: Film, color: 'text-green-400', bg: 'bg-green-500/10' },
    voiceover: { icon: Mic, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    music: { icon: Music, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

export default function RenderQueue({ projectId, compact = false }: RenderQueueProps) {
    const [jobs, setJobs] = useState<RenderJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const [isPaused, setIsPaused] = useState(false);

    // Fetch render jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                let url = '/api/render-queue';
                if (projectId) url += `?project_id=${projectId}`;
                
                const res = await fetch(url);
                if (res.ok) {
                    setJobs(await res.json());
                }
            } catch (error) {
                console.error('Error fetching render queue:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
        const interval = setInterval(fetchJobs, 3000);
        return () => clearInterval(interval);
    }, [projectId]);

    // Queue actions
    const pauseQueue = async () => {
        await fetch('/api/render-queue/pause', { method: 'POST' });
        setIsPaused(true);
    };

    const resumeQueue = async () => {
        await fetch('/api/render-queue/resume', { method: 'POST' });
        setIsPaused(false);
    };

    const cancelJob = async (jobId: string) => {
        await fetch(`/api/render-queue/${jobId}`, { method: 'DELETE' });
        setJobs(prev => prev.filter(j => j.id !== jobId));
    };

    const retryJob = async (jobId: string) => {
        const res = await fetch(`/api/render-queue/${jobId}/retry`, { method: 'POST' });
        if (res.ok) {
            const updated = await res.json();
            setJobs(prev => prev.map(j => j.id === jobId ? updated : j));
        }
    };

    const clearCompleted = async () => {
        await fetch('/api/render-queue/clear-completed', { method: 'DELETE' });
        setJobs(prev => prev.filter(j => j.status !== 'completed'));
    };

    // Stats
    const queuedCount = jobs.filter(j => j.status === 'queued').length;
    const processingCount = jobs.filter(j => j.status === 'processing').length;
    const completedCount = jobs.filter(j => j.status === 'completed').length;
    const failedCount = jobs.filter(j => j.status === 'failed').length;

    // Filter jobs
    const filteredJobs = jobs.filter(j => {
        if (filter === 'all') return true;
        return j.status === filter;
    });

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        return `${Math.floor(diffMins / 60)}h ago`;
    };

    if (compact) {
        return (
            <div className="space-y-2">
                {/* Compact Header */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {processingCount > 0 ? `${processingCount} processing` : 
                         queuedCount > 0 ? `${queuedCount} queued` : 'Queue empty'}
                    </span>
                    {(queuedCount > 0 || processingCount > 0) && (
                        <button
                            onClick={isPaused ? resumeQueue : pauseQueue}
                            className="text-xs text-yellow-500"
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                    )}
                </div>

                {/* Compact Jobs */}
                {filteredJobs.slice(0, 3).map((job) => {
                    const config = TYPE_CONFIG[job.type];
                    const Icon = config.icon;

                    return (
                        <div
                            key={job.id}
                            className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                        >
                            <div className={`p-1 rounded ${config.color}`}>
                                <Icon size={12} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-white truncate">{job.name}</p>
                                {job.status === 'processing' && (
                                    <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className="h-full bg-yellow-500 transition-all"
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            {job.status === 'processing' && (
                                <Loader2 size={12} className="animate-spin text-yellow-500" />
                            )}
                            {job.status === 'completed' && (
                                <Check size={12} className="text-green-400" />
                            )}
                            {job.status === 'failed' && (
                                <AlertCircle size={12} className="text-red-400" />
                            )}
                        </div>
                    );
                })}

                {jobs.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                        +{jobs.length - 3} more
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-500" />
                            Render Queue
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {queuedCount} queued • {processingCount} processing • {completedCount} completed
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {(queuedCount > 0 || processingCount > 0) && (
                            <button
                                onClick={isPaused ? resumeQueue : pauseQueue}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    isPaused
                                        ? 'bg-green-500 hover:bg-green-400 text-black'
                                        : 'bg-white/5 hover:bg-white/10 text-white'
                                }`}
                            >
                                {isPaused ? (
                                    <>
                                        <Play size={16} />
                                        Resume
                                    </>
                                ) : (
                                    <>
                                        <Pause size={16} />
                                        Pause
                                    </>
                                )}
                            </button>
                        )}
                        {completedCount > 0 && (
                            <button
                                onClick={clearCompleted}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <Trash2 size={16} />
                                Clear Completed
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2">
                    {[
                        { id: 'all', label: 'All', count: jobs.length },
                        { id: 'queued', label: 'Queued', count: queuedCount },
                        { id: 'processing', label: 'Processing', count: processingCount },
                        { id: 'completed', label: 'Completed', count: completedCount },
                        { id: 'failed', label: 'Failed', count: failedCount },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                filter === f.id
                                    ? 'bg-yellow-500/10 text-yellow-500'
                                    : 'text-gray-400 hover:bg-white/5'
                            }`}
                        >
                            {f.label}
                            {f.count > 0 && (
                                <span className="ml-1.5 text-xs opacity-60">({f.count})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job List */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20">
                        <Zap className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No jobs in queue</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Generate shots or exports to see them here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredJobs.map((job) => {
                            const config = TYPE_CONFIG[job.type];
                            const Icon = config.icon;
                            const isExpanded = expandedJobs.has(job.id);

                            return (
                                <div
                                    key={job.id}
                                    className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Type Icon */}
                                            <div className={`p-3 rounded-xl ${config.bg} ${config.color}`}>
                                                <Icon size={20} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-white truncate">
                                                        {job.name}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        job.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                        job.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        job.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                                        job.status === 'paused' ? 'bg-orange-500/10 text-orange-400' :
                                                        'bg-gray-500/10 text-gray-400'
                                                    }`}>
                                                        {job.status}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>{job.project_name}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatTimeAgo(job.created_at)}
                                                    </span>
                                                    {job.estimated_time && job.status === 'processing' && (
                                                        <span>~{formatTime(job.estimated_time)} remaining</span>
                                                    )}
                                                </div>

                                                {/* Progress Bar */}
                                                {job.status === 'processing' && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-gray-500">Progress</span>
                                                            <span className="text-yellow-500">{job.progress}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-yellow-500 transition-all"
                                                                style={{ width: `${job.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Error Message */}
                                                {job.error && (
                                                    <p className="text-xs text-red-400 mt-2">{job.error}</p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {job.status === 'failed' && (
                                                    <button
                                                        onClick={() => retryJob(job.id)}
                                                        className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-lg"
                                                        title="Retry"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                )}
                                                {job.status === 'completed' && job.result_url && (
                                                    <a
                                                        href={job.result_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                        title="View Result"
                                                    >
                                                        <Check size={18} />
                                                    </a>
                                                )}
                                                {(job.status === 'queued' || job.status === 'processing') && (
                                                    <button
                                                        onClick={() => cancelJob(job.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                        title="Cancel"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setExpandedJobs(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(job.id)) next.delete(job.id);
                                                        else next.add(job.id);
                                                        return next;
                                                    })}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                                >
                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-2 border-t border-white/5 text-xs text-gray-500">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-gray-600">Job ID</p>
                                                    <p className="font-mono text-gray-400">{job.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Type</p>
                                                    <p className="capitalize text-gray-400">{job.type}</p>
                                                </div>
                                                {job.started_at && (
                                                    <div>
                                                        <p className="text-gray-600">Started</p>
                                                        <p className="text-gray-400">{new Date(job.started_at).toLocaleString()}</p>
                                                    </div>
                                                )}
                                                {job.completed_at && (
                                                    <div>
                                                        <p className="text-gray-600">Completed</p>
                                                        <p className="text-gray-400">{new Date(job.completed_at).toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
