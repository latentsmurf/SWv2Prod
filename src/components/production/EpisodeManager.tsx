'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Film, Plus, Trash2, GripVertical, Check, X, Loader2,
    Play, Pause, ChevronDown, ChevronRight, Eye, Edit2,
    AlertTriangle, Zap, Clock, Copy, MoreHorizontal, Sparkles,
    FileText, Download, Upload, Smartphone
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Episode {
    id: string;
    project_id: string;
    episode_number: number;
    title: string;
    synopsis?: string;
    scene_ids: string[];
    duration?: number;
    status: 'draft' | 'in_production' | 'rendered' | 'published';
    cliffhanger_note?: string;
    hook_note?: string;
    created_at: string;
    updated_at?: string;
}

interface Scene {
    id: string;
    scene_number?: number;
    slug_line?: string;
    synopsis?: string;
    estimated_duration?: number;
}

interface EpisodeManagerProps {
    projectId: string;
    genre?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-400', icon: FileText },
    in_production: { label: 'In Production', color: 'bg-blue-500/10 text-blue-400', icon: Loader2 },
    rendered: { label: 'Rendered', color: 'bg-green-500/10 text-green-400', icon: Check },
    published: { label: 'Published', color: 'bg-purple-500/10 text-purple-400', icon: Sparkles },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EpisodeManager({ projectId, genre }: EpisodeManagerProps) {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

    // Form state
    const [newEpisode, setNewEpisode] = useState({
        title: '',
        synopsis: '',
        cliffhanger_note: '',
        hook_note: ''
    });

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch episodes
                const epRes = await fetch(`/api/projects/${projectId}/episodes`);
                if (epRes.ok) {
                    setEpisodes(await epRes.json());
                } else {
                    // Mock data for development
                    setEpisodes([]);
                }

                // Fetch scenes
                const sceneRes = await fetch(`/api/projects/${projectId}/scenes`);
                if (sceneRes.ok) {
                    setScenes(await sceneRes.json());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    // ========================================================================
    // EPISODE CRUD
    // ========================================================================

    const createEpisode = async () => {
        try {
            const episodeNumber = episodes.length + 1;
            
            const res = await fetch(`/api/projects/${projectId}/episodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    episode_number: episodeNumber,
                    title: newEpisode.title || `Episode ${episodeNumber}`,
                    synopsis: newEpisode.synopsis,
                    cliffhanger_note: newEpisode.cliffhanger_note,
                    hook_note: newEpisode.hook_note,
                    scene_ids: [],
                    status: 'draft'
                })
            });

            if (res.ok) {
                const episode = await res.json();
                setEpisodes(prev => [...prev, episode]);
            } else {
                // Fallback for development
                const episode: Episode = {
                    id: crypto.randomUUID(),
                    project_id: projectId,
                    episode_number: episodeNumber,
                    title: newEpisode.title || `Episode ${episodeNumber}`,
                    synopsis: newEpisode.synopsis,
                    cliffhanger_note: newEpisode.cliffhanger_note,
                    hook_note: newEpisode.hook_note,
                    scene_ids: [],
                    status: 'draft',
                    created_at: new Date().toISOString()
                };
                setEpisodes(prev => [...prev, episode]);
            }

            setShowCreateModal(false);
            setNewEpisode({ title: '', synopsis: '', cliffhanger_note: '', hook_note: '' });
        } catch (error) {
            console.error('Error creating episode:', error);
        }
    };

    const updateEpisode = async (episode: Episode, updates: Partial<Episode>) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/episodes/${episode.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                const updated = await res.json();
                setEpisodes(prev => prev.map(ep => ep.id === episode.id ? updated : ep));
            } else {
                // Fallback
                setEpisodes(prev => prev.map(ep => 
                    ep.id === episode.id ? { ...ep, ...updates, updated_at: new Date().toISOString() } : ep
                ));
            }
        } catch (error) {
            console.error('Error updating episode:', error);
            // Optimistic update
            setEpisodes(prev => prev.map(ep => 
                ep.id === episode.id ? { ...ep, ...updates } : ep
            ));
        }
    };

    const deleteEpisode = async (episodeId: string) => {
        if (!confirm('Delete this episode? This cannot be undone.')) return;

        try {
            await fetch(`/api/projects/${projectId}/episodes/${episodeId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting:', error);
        }
        
        setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
    };

    const duplicateEpisode = (episode: Episode) => {
        const newEp: Episode = {
            ...episode,
            id: crypto.randomUUID(),
            episode_number: episodes.length + 1,
            title: `${episode.title} (Copy)`,
            status: 'draft',
            created_at: new Date().toISOString()
        };
        setEpisodes(prev => [...prev, newEp]);
    };

    // ========================================================================
    // SCENE ASSIGNMENT
    // ========================================================================

    const assignSceneToEpisode = (episodeId: string, sceneId: string) => {
        setEpisodes(prev => prev.map(ep => {
            if (ep.id === episodeId && !ep.scene_ids.includes(sceneId)) {
                return { ...ep, scene_ids: [...ep.scene_ids, sceneId] };
            }
            return ep;
        }));
    };

    const removeSceneFromEpisode = (episodeId: string, sceneId: string) => {
        setEpisodes(prev => prev.map(ep => {
            if (ep.id === episodeId) {
                return { ...ep, scene_ids: ep.scene_ids.filter(id => id !== sceneId) };
            }
            return ep;
        }));
    };

    // ========================================================================
    // BATCH OPERATIONS
    // ========================================================================

    const generateBatchEpisodes = async (count: number) => {
        const startNumber = episodes.length + 1;
        const newEpisodes: Episode[] = [];

        for (let i = 0; i < count; i++) {
            newEpisodes.push({
                id: crypto.randomUUID(),
                project_id: projectId,
                episode_number: startNumber + i,
                title: `Episode ${startNumber + i}`,
                scene_ids: [],
                status: 'draft',
                created_at: new Date().toISOString()
            });
        }

        setEpisodes(prev => [...prev, ...newEpisodes]);
    };

    // ========================================================================
    // UI HELPERS
    // ========================================================================

    const toggleExpanded = (episodeId: string) => {
        setExpandedEpisodes(prev => {
            const next = new Set(prev);
            if (next.has(episodeId)) {
                next.delete(episodeId);
            } else {
                next.add(episodeId);
            }
            return next;
        });
    };

    const getEpisodeDuration = (episode: Episode): number => {
        return episode.scene_ids.reduce((total, sceneId) => {
            const scene = scenes.find(s => s.id === sceneId);
            return total + (scene?.estimated_duration || 60);
        }, 0);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ========================================================================
    // STATS
    // ========================================================================

    const stats = {
        total: episodes.length,
        draft: episodes.filter(e => e.status === 'draft').length,
        inProduction: episodes.filter(e => e.status === 'in_production').length,
        rendered: episodes.filter(e => e.status === 'rendered').length,
        published: episodes.filter(e => e.status === 'published').length,
        totalDuration: episodes.reduce((t, e) => t + getEpisodeDuration(e), 0)
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-pink-500" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center">
                            <Smartphone size={20} className="text-pink-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Episode Manager</h2>
                            <p className="text-xs text-gray-500">
                                {stats.total} episodes • ~{formatDuration(stats.totalDuration)} total
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Batch Generate */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                                <Sparkles size={14} />
                                Batch Generate
                                <ChevronDown size={14} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#121212] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                {[10, 25, 50, 100].map(count => (
                                    <button
                                        key={count}
                                        onClick={() => generateBatchEpisodes(count)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5"
                                    >
                                        Generate {count} episodes
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Create Episode */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl transition-colors"
                        >
                            <Plus size={16} />
                            New Episode
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-4 text-xs">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const count = episodes.filter(e => e.status === key).length;
                        return (
                            <span key={key} className={`px-2 py-1 rounded-lg ${config.color}`}>
                                {config.label}: {count}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Episode List */}
            <div className="flex-1 overflow-y-auto p-6">
                {episodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <Film className="text-gray-600" size={28} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No episodes yet</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-sm">
                            Create your first episode to start organizing your micro drama series.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl"
                        >
                            <Plus size={16} />
                            Create First Episode
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {episodes
                            .sort((a, b) => a.episode_number - b.episode_number)
                            .map(episode => {
                                const isExpanded = expandedEpisodes.has(episode.id);
                                const statusConfig = STATUS_CONFIG[episode.status];
                                const duration = getEpisodeDuration(episode);

                                return (
                                    <div
                                        key={episode.id}
                                        className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden"
                                    >
                                        {/* Episode Header */}
                                        <div
                                            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                            onClick={() => toggleExpanded(episode.id)}
                                        >
                                            <button className="text-gray-500">
                                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </button>

                                            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 font-bold">
                                                {episode.episode_number}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-medium truncate">{episode.title}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{episode.scene_ids.length} scenes</span>
                                                    <span>~{formatDuration(duration)}</span>
                                                </div>
                                            </div>

                                            {/* Cliffhanger indicator */}
                                            {episode.cliffhanger_note && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs" title={episode.cliffhanger_note}>
                                                    <AlertTriangle size={12} />
                                                    Cliffhanger
                                                </div>
                                            )}

                                            {/* Hook indicator */}
                                            {episode.hook_note && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-xs" title={episode.hook_note}>
                                                    <Zap size={12} />
                                                    Hook
                                                </div>
                                            )}

                                            {/* Status */}
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setEditingEpisode(episode)}
                                                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => duplicateEpisode(episode)}
                                                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteEpisode(episode.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-white/5 p-4 bg-white/[0.02]">
                                                {/* Synopsis */}
                                                {episode.synopsis && (
                                                    <p className="text-sm text-gray-400 mb-4">{episode.synopsis}</p>
                                                )}

                                                {/* Scenes */}
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-white mb-2">Scenes</h4>
                                                    {episode.scene_ids.length === 0 ? (
                                                        <p className="text-xs text-gray-500">No scenes assigned. Drag scenes here.</p>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {episode.scene_ids.map(sceneId => {
                                                                const scene = scenes.find(s => s.id === sceneId);
                                                                return (
                                                                    <div
                                                                        key={sceneId}
                                                                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                                                                    >
                                                                        <span className="text-sm text-gray-300">
                                                                            {scene?.slug_line || `Scene ${scene?.scene_number || '?'}`}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => removeSceneFromEpisode(episode.id, sceneId)}
                                                                            className="p-1 text-gray-500 hover:text-red-400"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Notes */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-medium text-cyan-400 mb-1 flex items-center gap-1">
                                                            <Zap size={12} /> Opening Hook
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {episode.hook_note || 'No hook note'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-medium text-orange-400 mb-1 flex items-center gap-1">
                                                            <AlertTriangle size={12} /> Cliffhanger
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {episode.cliffhanger_note || 'No cliffhanger note'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Selector */}
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <h4 className="text-xs font-medium text-gray-400 mb-2">Status</h4>
                                                    <div className="flex gap-2">
                                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => updateEpisode(episode, { status: key as Episode['status'] })}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                                    episode.status === key
                                                                        ? config.color
                                                                        : 'bg-white/5 text-gray-500 hover:text-white'
                                                                }`}
                                                            >
                                                                {config.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            {/* Create Episode Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Create New Episode</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Episode Title</label>
                                <input
                                    type="text"
                                    value={newEpisode.title}
                                    onChange={e => setNewEpisode(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={`Episode ${episodes.length + 1}`}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-pink-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Synopsis</label>
                                <textarea
                                    value={newEpisode.synopsis}
                                    onChange={e => setNewEpisode(prev => ({ ...prev, synopsis: e.target.value }))}
                                    placeholder="Brief description of this episode..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-pink-500 focus:outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyan-400 mb-1 flex items-center gap-1">
                                    <Zap size={14} /> Opening Hook
                                </label>
                                <input
                                    type="text"
                                    value={newEpisode.hook_note}
                                    onChange={e => setNewEpisode(prev => ({ ...prev, hook_note: e.target.value }))}
                                    placeholder="How does this episode hook viewers in the first 3 seconds?"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-orange-400 mb-1 flex items-center gap-1">
                                    <AlertTriangle size={14} /> Cliffhanger Ending
                                </label>
                                <input
                                    type="text"
                                    value={newEpisode.cliffhanger_note}
                                    onChange={e => setNewEpisode(prev => ({ ...prev, cliffhanger_note: e.target.value }))}
                                    placeholder="What cliffhanger makes viewers watch the next episode?"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={createEpisode}
                                className="px-6 py-2 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl"
                            >
                                Create Episode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
