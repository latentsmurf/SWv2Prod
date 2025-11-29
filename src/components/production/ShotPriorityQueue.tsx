'use client';

import React, { useState, useEffect } from 'react';
import {
    ListOrdered, GripVertical, Image, Clock, AlertTriangle,
    Check, X, Loader2, ChevronUp, ChevronDown, Play, Pause,
    ArrowUp, ArrowDown, Filter, MoreVertical
} from 'lucide-react';
import { Shot } from '@/types';

interface PrioritizedShot extends Shot {
    priority: number;
    priority_reason?: string;
    estimated_time?: number;
    dependencies?: string[];
    blocked?: boolean;
    blocker_reason?: string;
}

interface ShotPriorityQueueProps {
    projectId: string;
    shots: Shot[];
    onReorder?: (shots: PrioritizedShot[]) => void;
}

const PRIORITY_LEVELS = [
    { value: 1, label: 'Critical', color: 'bg-red-500 text-white' },
    { value: 2, label: 'High', color: 'bg-orange-500 text-white' },
    { value: 3, label: 'Medium', color: 'bg-yellow-500 text-black' },
    { value: 4, label: 'Low', color: 'bg-blue-500 text-white' },
    { value: 5, label: 'Backlog', color: 'bg-gray-500 text-white' }
];

export default function ShotPriorityQueue({
    projectId,
    shots: initialShots,
    onReorder
}: ShotPriorityQueueProps) {
    const [shots, setShots] = useState<PrioritizedShot[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [filterPriority, setFilterPriority] = useState<number | 'all'>('all');
    const [showBlocked, setShowBlocked] = useState(true);
    const [autoOptimizing, setAutoOptimizing] = useState(false);

    // Fetch prioritized shots
    useEffect(() => {
        const fetchPriorities = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/shot-priorities`);
                if (res.ok) {
                    const data = await res.json();
                    setShots(data);
                } else {
                    // Use initial shots with default priorities
                    setShots(initialShots.map((shot, index) => ({
                        ...shot,
                        priority: 3,
                        estimated_time: 15
                    })));
                }
            } catch (error) {
                console.error('Error fetching priorities:', error);
                setShots(initialShots.map((shot, index) => ({
                    ...shot,
                    priority: 3,
                    estimated_time: 15
                })));
            } finally {
                setLoading(false);
            }
        };

        fetchPriorities();
    }, [projectId, initialShots]);

    // Update priority
    const updatePriority = async (shotId: string, priority: number) => {
        const updatedShots = shots.map(s =>
            s.id === shotId ? { ...s, priority } : s
        ).sort((a, b) => a.priority - b.priority);

        setShots(updatedShots);

        try {
            await fetch(`/api/projects/${projectId}/shots/${shotId}/priority`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority })
            });
            onReorder?.(updatedShots);
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    // Move shot up/down
    const moveShot = (shotId: string, direction: 'up' | 'down') => {
        const index = shots.findIndex(s => s.id === shotId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= shots.length) return;

        const newShots = [...shots];
        [newShots[index], newShots[newIndex]] = [newShots[newIndex], newShots[index]];
        setShots(newShots);
        onReorder?.(newShots);
    };

    // Toggle blocked status
    const toggleBlocked = async (shotId: string, blocked: boolean, reason?: string) => {
        const updatedShots = shots.map(s =>
            s.id === shotId ? { ...s, blocked, blocker_reason: reason } : s
        );
        setShots(updatedShots);

        try {
            await fetch(`/api/projects/${projectId}/shots/${shotId}/blocked`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocked, reason })
            });
        } catch (error) {
            console.error('Error updating blocked status:', error);
        }
    };

    // Auto-optimize queue
    const autoOptimize = async () => {
        setAutoOptimizing(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/shot-priorities/optimize`, {
                method: 'POST'
            });

            if (res.ok) {
                const optimized = await res.json();
                setShots(optimized);
                onReorder?.(optimized);
            }
        } catch (error) {
            console.error('Error optimizing:', error);
        } finally {
            setAutoOptimizing(false);
        }
    };

    // Filter shots
    const filteredShots = shots.filter(shot => {
        if (filterPriority !== 'all' && shot.priority !== filterPriority) return false;
        if (!showBlocked && shot.blocked) return false;
        return true;
    });

    // Get priority config
    const getPriorityConfig = (priority: number) => {
        return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[2];
    };

    // Calculate totals
    const totalTime = shots.reduce((sum, s) => sum + (s.estimated_time || 0), 0);
    const completedShots = shots.filter(s => s.status === 'completed').length;
    const blockedCount = shots.filter(s => s.blocked).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ListOrdered className="text-yellow-500" />
                        Shot Priority Queue
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {shots.length} shots • ~{Math.round(totalTime / 60)}h estimated
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={autoOptimize}
                        disabled={autoOptimizing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl"
                    >
                        {autoOptimizing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Play size={18} />
                        )}
                        Auto-Optimize
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Shots</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{shots.length}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{completedShots}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Blocked</p>
                    <p className="text-2xl font-bold text-red-400">{blockedCount}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Est. Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(totalTime / 60)}h</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Priority:</span>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                        <option value="all">All</option>
                        {PRIORITY_LEVELS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showBlocked}
                        onChange={(e) => setShowBlocked(e.target.checked)}
                        className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-400">Show blocked</span>
                </label>
            </div>

            {/* Queue */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {filteredShots.map((shot, index) => {
                            const priorityConfig = getPriorityConfig(shot.priority);

                            return (
                                <div
                                    key={shot.id}
                                    className={`flex items-center gap-4 p-4 ${
                                        shot.blocked ? 'opacity-50 bg-red-500/5' : 'hover:bg-white/5'
                                    }`}
                                >
                                    {/* Position */}
                                    <div className="flex flex-col items-center gap-1">
                                        <button
                                            onClick={() => moveShot(shot.id, 'up')}
                                            disabled={index === 0}
                                            className="p-1 text-gray-600 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <span className="text-lg font-bold text-gray-600 w-8 text-center">
                                            {index + 1}
                                        </span>
                                        <button
                                            onClick={() => moveShot(shot.id, 'down')}
                                            disabled={index === filteredShots.length - 1}
                                            className="p-1 text-gray-600 hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="w-24 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                        {shot.gcs_path || shot.proxy_path ? (
                                            <img
                                                src={shot.gcs_path || shot.proxy_path}
                                                alt={`Shot ${shot.shot_number}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image className="text-gray-600" size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-yellow-500 font-mono text-sm">
                                                Shot {shot.shot_number}
                                            </span>
                                            {shot.blocked && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                                                    <AlertTriangle size={12} />
                                                    Blocked
                                                </span>
                                            )}
                                            {shot.status === 'completed' && (
                                                <Check size={14} className="text-green-400" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">
                                            {shot.description}
                                        </p>
                                        {shot.blocker_reason && (
                                            <p className="text-xs text-red-400 mt-1">{shot.blocker_reason}</p>
                                        )}
                                    </div>

                                    {/* Priority Selector */}
                                    <select
                                        value={shot.priority}
                                        onChange={(e) => updatePriority(shot.id, Number(e.target.value))}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${priorityConfig.color}`}
                                    >
                                        {PRIORITY_LEVELS.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>

                                    {/* Time */}
                                    <div className="text-right">
                                        <p className="text-sm text-white flex items-center gap-1">
                                            <Clock size={14} className="text-gray-500" />
                                            {shot.estimated_time || 15}m
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="relative group">
                                        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg">
                                            <MoreVertical size={16} />
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                            <button
                                                onClick={() => toggleBlocked(shot.id, !shot.blocked)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-left"
                                            >
                                                {shot.blocked ? (
                                                    <>
                                                        <Check size={14} className="text-green-400" />
                                                        <span className="text-sm text-white">Unblock</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X size={14} className="text-red-400" />
                                                        <span className="text-sm text-white">Mark Blocked</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => updatePriority(shot.id, 1)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-left"
                                            >
                                                <ArrowUp size={14} className="text-red-400" />
                                                <span className="text-sm text-white">Set Critical</span>
                                            </button>
                                            <button
                                                onClick={() => updatePriority(shot.id, 5)}
                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-left"
                                            >
                                                <ArrowDown size={14} className="text-gray-400" />
                                                <span className="text-sm text-white">Move to Backlog</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
