'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Loader2, Check, X, AlertCircle, RefreshCw, Pause, Play,
    ChevronDown, ChevronUp, Image, Video, Clock, Zap,
    SkipForward, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface QueueItem {
    id: string;
    type: 'image' | 'video';
    prompt: string;
    scene_id?: string;
    shot_id?: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
    progress?: number;
    thumbnail_url?: string;
    error?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    estimated_time?: number;
    priority?: number;
}

interface GenerationProgressProps {
    projectId: string;
    onItemComplete?: (item: QueueItem) => void;
    onQueueEmpty?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GenerationProgress({
    projectId,
    onItemComplete,
    onQueueEmpty
}: GenerationProgressProps) {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

    // ========================================================================
    // POLLING
    // ========================================================================

    const fetchQueue = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/generation-queue`);
            if (res.ok) {
                const data = await res.json();
                setQueue(data);

                // Check for completed items
                const completed = data.filter((item: QueueItem) => 
                    item.status === 'completed' && 
                    !queue.find(q => q.id === item.id && q.status === 'completed')
                );
                completed.forEach((item: QueueItem) => onItemComplete?.(item));

                // Check if queue is empty
                if (data.length === 0 || data.every((item: QueueItem) => item.status === 'completed')) {
                    onQueueEmpty?.();
                }
            }
        } catch (error) {
            console.error('Error fetching queue:', error);
            // Use mock data for development
            setQueue(MOCK_QUEUE);
        }
    }, [projectId, queue, onItemComplete, onQueueEmpty]);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 2000);
        setPollInterval(interval);
        return () => clearInterval(interval);
    }, [projectId]);

    // ========================================================================
    // ACTIONS
    // ========================================================================

    const pauseQueue = async () => {
        setIsPaused(true);
        try {
            await fetch(`/api/projects/${projectId}/generation-queue/pause`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error pausing queue:', error);
        }
    };

    const resumeQueue = async () => {
        setIsPaused(false);
        try {
            await fetch(`/api/projects/${projectId}/generation-queue/resume`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error resuming queue:', error);
        }
    };

    const retryItem = async (itemId: string) => {
        try {
            await fetch(`/api/projects/${projectId}/generation-queue/${itemId}/retry`, {
                method: 'POST'
            });
            fetchQueue();
        } catch (error) {
            console.error('Error retrying item:', error);
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            await fetch(`/api/projects/${projectId}/generation-queue/${itemId}`, {
                method: 'DELETE'
            });
            setQueue(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const changePriority = async (itemId: string, direction: 'up' | 'down') => {
        setQueue(prev => {
            const index = prev.findIndex(item => item.id === itemId);
            if (index === -1) return prev;
            
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;
            
            const newQueue = [...prev];
            [newQueue[index], newQueue[newIndex]] = [newQueue[newIndex], newQueue[index]];
            return newQueue;
        });

        try {
            await fetch(`/api/projects/${projectId}/generation-queue/${itemId}/priority`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction })
            });
        } catch (error) {
            console.error('Error changing priority:', error);
        }
    };

    // ========================================================================
    // HELPERS
    // ========================================================================

    const getStatusConfig = (status: QueueItem['status']) => {
        const configs: Record<string, { icon: React.ElementType; color: string; bg: string; label: string; animate?: boolean }> = {
            queued: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Queued' },
            processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Processing', animate: true },
            completed: { icon: Check, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Complete' },
            failed: { icon: X, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
            paused: { icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Paused' }
        };
        return configs[status];
    };

    const formatTime = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getEstimatedTotal = (): number => {
        return queue
            .filter(item => item.status === 'queued' || item.status === 'processing')
            .reduce((total, item) => total + (item.estimated_time || 30), 0);
    };

    // ========================================================================
    // STATS
    // ========================================================================

    const stats = {
        total: queue.length,
        queued: queue.filter(i => i.status === 'queued').length,
        processing: queue.filter(i => i.status === 'processing').length,
        completed: queue.filter(i => i.status === 'completed').length,
        failed: queue.filter(i => i.status === 'failed').length,
    };

    const currentItem = queue.find(i => i.status === 'processing');

    // ========================================================================
    // RENDER
    // ========================================================================

    if (queue.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
            {/* Header */}
            <div 
                className="p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {currentItem ? (
                            <div className="relative">
                                <Loader2 className="animate-spin text-blue-400" size={20} />
                                <div className="absolute inset-0 animate-ping">
                                    <Loader2 className="text-blue-400 opacity-30" size={20} />
                                </div>
                            </div>
                        ) : (
                            <Zap className="text-green-400" size={20} />
                        )}
                        <div>
                            <h3 className="text-sm font-medium text-white">
                                {currentItem ? 'Generating...' : 'Generation Complete'}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {stats.completed}/{stats.total} complete
                                {stats.queued > 0 && ` • ${stats.queued} in queue`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {stats.processing > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    isPaused ? resumeQueue() : pauseQueue();
                                }}
                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
                            >
                                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                            </button>
                        )}
                        {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronUp size={16} className="text-gray-500" />}
                    </div>
                </div>

                {/* Progress Bar */}
                {stats.total > 0 && (
                    <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="max-h-80 overflow-y-auto">
                    {queue.map((item, index) => {
                        const config = getStatusConfig(item.status);
                        const Icon = config.icon;

                        return (
                            <div
                                key={item.id}
                                className={`
                                    p-3 border-b border-white/5 last:border-0
                                    ${item.status === 'processing' ? 'bg-blue-500/5' : ''}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Thumbnail or Icon */}
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${config.bg}
                                    `}>
                                        {item.thumbnail_url ? (
                                            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Icon 
                                                size={16} 
                                                className={`${config.color} ${config.animate ? 'animate-spin' : ''}`} 
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                                                {item.type === 'video' ? <Video size={10} className="inline mr-1" /> : <Image size={10} className="inline mr-1" />}
                                                {config.label}
                                            </span>
                                            {item.estimated_time && item.status === 'queued' && (
                                                <span className="text-xs text-gray-500">
                                                    ~{formatTime(item.estimated_time)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate mt-1">{item.prompt}</p>

                                        {/* Progress for processing items */}
                                        {item.status === 'processing' && item.progress !== undefined && (
                                            <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        )}

                                        {/* Error message */}
                                        {item.status === 'failed' && item.error && (
                                            <p className="text-xs text-red-400 mt-1">{item.error}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        {item.status === 'queued' && (
                                            <>
                                                <button
                                                    onClick={() => changePriority(item.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-600 hover:text-white disabled:opacity-30"
                                                >
                                                    <ArrowUp size={12} />
                                                </button>
                                                <button
                                                    onClick={() => changePriority(item.id, 'down')}
                                                    disabled={index === queue.length - 1}
                                                    className="p-1 text-gray-600 hover:text-white disabled:opacity-30"
                                                >
                                                    <ArrowDown size={12} />
                                                </button>
                                            </>
                                        )}
                                        {item.status === 'failed' && (
                                            <button
                                                onClick={() => retryItem(item.id)}
                                                className="p-1 text-gray-500 hover:text-white"
                                                title="Retry"
                                            >
                                                <RefreshCw size={12} />
                                            </button>
                                        )}
                                        {(item.status === 'queued' || item.status === 'failed') && (
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1 text-gray-500 hover:text-red-400"
                                                title="Remove"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            {isExpanded && stats.queued > 0 && (
                <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Estimated time remaining</span>
                        <span className="font-medium text-white">{formatTime(getEstimatedTotal())}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const MOCK_QUEUE: QueueItem[] = [
    {
        id: '1',
        type: 'image',
        prompt: 'CEO in luxury office, cinematic lighting',
        status: 'processing',
        progress: 65,
        created_at: new Date().toISOString(),
        estimated_time: 15
    },
    {
        id: '2',
        type: 'video',
        prompt: 'Dramatic reveal in mansion hallway',
        status: 'queued',
        created_at: new Date().toISOString(),
        estimated_time: 45
    },
    {
        id: '3',
        type: 'image',
        prompt: 'Close-up reaction shot',
        status: 'queued',
        created_at: new Date().toISOString(),
        estimated_time: 12
    },
    {
        id: '4',
        type: 'image',
        prompt: 'Establishing shot of city skyline',
        status: 'completed',
        created_at: new Date().toISOString(),
        thumbnail_url: '/placeholder.jpg'
    }
];

export { MOCK_QUEUE };
export type { QueueItem };
