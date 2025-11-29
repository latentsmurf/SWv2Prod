'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    List, Plus, Search, Filter, Edit, Trash2, Eye, X, GripVertical,
    Loader2, Camera, Clock, MapPin, Users, Film, Copy, Check,
    ChevronDown, ChevronRight, Download, Upload, Layers
} from 'lucide-react';

interface ShotListItem {
    id: string;
    shot_number: string;
    scene_id?: string;
    scene_number?: number;
    description: string;
    shot_type: 'wide' | 'medium' | 'close_up' | 'extreme_close_up' | 'over_shoulder' | 'pov' | 'insert' | 'aerial' | 'tracking' | 'dolly' | 'crane' | 'handheld' | 'steadicam' | 'other';
    angle?: string;
    movement?: string;
    lens?: string;
    duration?: number;
    characters?: string[];
    location?: string;
    props?: string[];
    vfx_notes?: string;
    sound_notes?: string;
    lighting_notes?: string;
    director_notes?: string;
    status: 'planned' | 'setup' | 'rehearsing' | 'shooting' | 'completed' | 'cut';
    takes?: number;
    selected_take?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    order: number;
}

interface ShotListManagerProps {
    projectId: string;
    sceneId?: string;
}

const SHOT_TYPES = {
    wide: { label: 'Wide Shot (WS)', abbr: 'WS' },
    medium: { label: 'Medium Shot (MS)', abbr: 'MS' },
    close_up: { label: 'Close-Up (CU)', abbr: 'CU' },
    extreme_close_up: { label: 'Extreme Close-Up (ECU)', abbr: 'ECU' },
    over_shoulder: { label: 'Over-the-Shoulder (OTS)', abbr: 'OTS' },
    pov: { label: 'Point of View (POV)', abbr: 'POV' },
    insert: { label: 'Insert', abbr: 'INS' },
    aerial: { label: 'Aerial', abbr: 'AER' },
    tracking: { label: 'Tracking', abbr: 'TRK' },
    dolly: { label: 'Dolly', abbr: 'DOL' },
    crane: { label: 'Crane', abbr: 'CRN' },
    handheld: { label: 'Handheld', abbr: 'HH' },
    steadicam: { label: 'Steadicam', abbr: 'STD' },
    other: { label: 'Other', abbr: 'OTH' }
};

const STATUS_CONFIG = {
    planned: { label: 'Planned', color: 'bg-gray-500/10 text-gray-400' },
    setup: { label: 'Setup', color: 'bg-blue-500/10 text-blue-400' },
    rehearsing: { label: 'Rehearsing', color: 'bg-yellow-500/10 text-yellow-400' },
    shooting: { label: 'Shooting', color: 'bg-orange-500/10 text-orange-400' },
    completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400' },
    cut: { label: 'Cut', color: 'bg-red-500/10 text-red-400 line-through' }
};

const PRIORITY_CONFIG = {
    low: { label: 'Low', color: 'bg-gray-500/10 text-gray-400' },
    medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-400' },
    high: { label: 'High', color: 'bg-orange-500/10 text-orange-400' },
    critical: { label: 'Critical', color: 'bg-red-500/10 text-red-400' }
};

export default function ShotListManager({ projectId, sceneId }: ShotListManagerProps) {
    const [shots, setShots] = useState<ShotListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingShot, setEditingShot] = useState<ShotListItem | null>(null);
    const [draggedShot, setDraggedShot] = useState<string | null>(null);
    const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');

    // Form state
    const [form, setForm] = useState({
        shot_number: '',
        scene_number: 1,
        description: '',
        shot_type: 'medium' as ShotListItem['shot_type'],
        angle: '',
        movement: '',
        lens: '',
        duration: 0,
        characters: '',
        location: '',
        props: '',
        vfx_notes: '',
        sound_notes: '',
        lighting_notes: '',
        director_notes: '',
        priority: 'medium' as ShotListItem['priority']
    });

    // Fetch shots
    useEffect(() => {
        const fetchShots = async () => {
            try {
                const url = sceneId
                    ? `/api/projects/${projectId}/scenes/${sceneId}/shot-list`
                    : `/api/projects/${projectId}/shot-list`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setShots(data.sort((a: ShotListItem, b: ShotListItem) => a.order - b.order));
                }
            } catch (error) {
                console.error('Error fetching shots:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShots();
    }, [projectId, sceneId]);

    // Generate shot number
    const generateShotNumber = useCallback((sceneNum: number) => {
        const sceneShots = shots.filter(s => s.scene_number === sceneNum);
        const nextNum = sceneShots.length + 1;
        return `${sceneNum}${String.fromCharCode(64 + nextNum)}`; // 1A, 1B, etc.
    }, [shots]);

    // Add shot
    const addShot = async () => {
        const shotNumber = form.shot_number || generateShotNumber(form.scene_number);
        const newShot: ShotListItem = {
            id: crypto.randomUUID(),
            shot_number: shotNumber,
            scene_number: form.scene_number,
            description: form.description,
            shot_type: form.shot_type,
            angle: form.angle,
            movement: form.movement,
            lens: form.lens,
            duration: form.duration,
            characters: form.characters.split(',').map(c => c.trim()).filter(Boolean),
            location: form.location,
            props: form.props.split(',').map(p => p.trim()).filter(Boolean),
            vfx_notes: form.vfx_notes,
            sound_notes: form.sound_notes,
            lighting_notes: form.lighting_notes,
            director_notes: form.director_notes,
            status: 'planned',
            priority: form.priority,
            order: shots.length
        };

        setShots(prev => [...prev, newShot]);
        setShowAddModal(false);
        resetForm();

        try {
            await fetch(`/api/projects/${projectId}/shot-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShot)
            });
        } catch (error) {
            console.error('Error adding shot:', error);
        }
    };

    // Update shot
    const updateShot = async (shotId: string, updates: Partial<ShotListItem>) => {
        setShots(prev => prev.map(s => s.id === shotId ? { ...s, ...updates } : s));

        try {
            await fetch(`/api/projects/${projectId}/shot-list/${shotId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Error updating shot:', error);
        }
    };

    // Delete shot
    const deleteShot = async (shotId: string) => {
        if (!confirm('Delete this shot?')) return;

        setShots(prev => prev.filter(s => s.id !== shotId));

        try {
            await fetch(`/api/projects/${projectId}/shot-list/${shotId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting shot:', error);
        }
    };

    // Duplicate shot
    const duplicateShot = (shot: ShotListItem) => {
        const newShot: ShotListItem = {
            ...shot,
            id: crypto.randomUUID(),
            shot_number: generateShotNumber(shot.scene_number || 1),
            status: 'planned',
            takes: undefined,
            selected_take: undefined,
            order: shots.length
        };
        setShots(prev => [...prev, newShot]);
    };

    // Drag and drop handlers
    const handleDragStart = (shotId: string) => {
        setDraggedShot(shotId);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedShot || draggedShot === targetId) return;

        const draggedIndex = shots.findIndex(s => s.id === draggedShot);
        const targetIndex = shots.findIndex(s => s.id === targetId);

        const newShots = [...shots];
        const [removed] = newShots.splice(draggedIndex, 1);
        newShots.splice(targetIndex, 0, removed);

        // Update order
        newShots.forEach((shot, index) => {
            shot.order = index;
        });

        setShots(newShots);
    };

    const handleDragEnd = async () => {
        if (draggedShot) {
            // Save new order
            try {
                await fetch(`/api/projects/${projectId}/shot-list/reorder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shots: shots.map(s => ({ id: s.id, order: s.order })) })
                });
            } catch (error) {
                console.error('Error saving order:', error);
            }
        }
        setDraggedShot(null);
    };

    // Reset form
    const resetForm = () => {
        setForm({
            shot_number: '', scene_number: 1, description: '',
            shot_type: 'medium', angle: '', movement: '', lens: '',
            duration: 0, characters: '', location: '', props: '',
            vfx_notes: '', sound_notes: '', lighting_notes: '',
            director_notes: '', priority: 'medium'
        });
    };

    // Toggle scene expansion
    const toggleScene = (sceneNum: number) => {
        const newExpanded = new Set(expandedScenes);
        if (newExpanded.has(sceneNum)) {
            newExpanded.delete(sceneNum);
        } else {
            newExpanded.add(sceneNum);
        }
        setExpandedScenes(newExpanded);
    };

    // Filter shots
    const filteredShots = shots.filter(shot => {
        if (filterStatus !== 'all' && shot.status !== filterStatus) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return shot.shot_number.toLowerCase().includes(query) ||
                shot.description.toLowerCase().includes(query);
        }
        return true;
    });

    // Group by scene
    const shotsByScene = filteredShots.reduce((acc, shot) => {
        const scene = shot.scene_number || 0;
        if (!acc[scene]) acc[scene] = [];
        acc[scene].push(shot);
        return acc;
    }, {} as Record<number, ShotListItem[]>);

    // Stats
    const stats = {
        total: shots.length,
        completed: shots.filter(s => s.status === 'completed').length,
        remaining: shots.filter(s => s.status !== 'completed' && s.status !== 'cut').length,
        totalDuration: shots.reduce((sum, s) => sum + (s.duration || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <List className="text-yellow-500" />
                        Shot List
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats.completed}/{stats.total} shots completed
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {/* Export functionality */}}
                        className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded-xl"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Shot
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Shots</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.remaining}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Est. Runtime</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search shots..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
                    {(['list', 'compact'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                                viewMode === mode ? 'bg-yellow-500 text-black' : 'text-gray-400'
                            }`}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shot List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(shotsByScene).sort(([a], [b]) => Number(a) - Number(b)).map(([sceneNum, sceneShots]) => (
                        <div key={sceneNum} className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
                            {/* Scene Header */}
                            <button
                                onClick={() => toggleScene(Number(sceneNum))}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedScenes.has(Number(sceneNum)) ? (
                                        <ChevronDown size={20} className="text-gray-500" />
                                    ) : (
                                        <ChevronRight size={20} className="text-gray-500" />
                                    )}
                                    <span className="text-white font-bold">Scene {sceneNum}</span>
                                    <span className="text-sm text-gray-500">
                                        {sceneShots.length} shot{sceneShots.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-green-400">
                                        {sceneShots.filter(s => s.status === 'completed').length} done
                                    </span>
                                </div>
                            </button>

                            {/* Shots */}
                            {expandedScenes.has(Number(sceneNum)) && (
                                <div className="border-t border-white/5">
                                    {sceneShots.map((shot) => {
                                        const statusConfig = STATUS_CONFIG[shot.status];
                                        const priorityConfig = PRIORITY_CONFIG[shot.priority];
                                        const shotTypeConfig = SHOT_TYPES[shot.shot_type];

                                        return (
                                            <div
                                                key={shot.id}
                                                draggable
                                                onDragStart={() => handleDragStart(shot.id)}
                                                onDragOver={(e) => handleDragOver(e, shot.id)}
                                                onDragEnd={handleDragEnd}
                                                className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 ${
                                                    draggedShot === shot.id ? 'opacity-50' : ''
                                                }`}
                                            >
                                                {/* Drag Handle */}
                                                <GripVertical size={18} className="text-gray-600 cursor-grab" />

                                                {/* Shot Number */}
                                                <div className="w-16 text-center">
                                                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded font-mono text-sm font-bold">
                                                        {shot.shot_number}
                                                    </span>
                                                </div>

                                                {/* Shot Type */}
                                                <div className="w-12 text-center">
                                                    <span className="text-xs text-blue-400 font-bold">
                                                        {shotTypeConfig.abbr}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white truncate">{shot.description}</p>
                                                    {shot.characters && shot.characters.length > 0 && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                            <Users size={12} />
                                                            {shot.characters.join(', ')}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Duration */}
                                                {shot.duration && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Clock size={14} />
                                                        {shot.duration}s
                                                    </div>
                                                )}

                                                {/* Priority */}
                                                <span className={`px-2 py-1 rounded text-xs ${priorityConfig.color}`}>
                                                    {priorityConfig.label}
                                                </span>

                                                {/* Status */}
                                                <select
                                                    value={shot.status}
                                                    onChange={(e) => updateShot(shot.id, { status: e.target.value as any })}
                                                    className={`text-xs rounded px-2 py-1 ${statusConfig.color} bg-transparent border-none cursor-pointer`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => duplicateShot(shot)}
                                                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded"
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingShot(shot)}
                                                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteShot(shot.id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredShots.length === 0 && (
                        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No shots found. Add your first shot to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingShot) && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#121212]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingShot ? 'Edit Shot' : 'Add Shot'}
                            </h3>
                            <button
                                onClick={() => { setShowAddModal(false); setEditingShot(null); resetForm(); }}
                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Shot Number</label>
                                    <input
                                        type="text"
                                        value={form.shot_number}
                                        onChange={(e) => setForm({ ...form, shot_number: e.target.value })}
                                        placeholder="Auto-generate"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Scene Number</label>
                                    <input
                                        type="number"
                                        value={form.scene_number}
                                        onChange={(e) => setForm({ ...form, scene_number: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Shot Type</label>
                                    <select
                                        value={form.shot_type}
                                        onChange={(e) => setForm({ ...form, shot_type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    >
                                        {Object.entries(SHOT_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Description *</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    placeholder="Describe what happens in this shot..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Angle</label>
                                    <input
                                        type="text"
                                        value={form.angle}
                                        onChange={(e) => setForm({ ...form, angle: e.target.value })}
                                        placeholder="e.g., Low angle"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Movement</label>
                                    <input
                                        type="text"
                                        value={form.movement}
                                        onChange={(e) => setForm({ ...form, movement: e.target.value })}
                                        placeholder="e.g., Pan left"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Lens</label>
                                    <input
                                        type="text"
                                        value={form.lens}
                                        onChange={(e) => setForm({ ...form, lens: e.target.value })}
                                        placeholder="e.g., 50mm"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Characters (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={form.characters}
                                        onChange={(e) => setForm({ ...form, characters: e.target.value })}
                                        placeholder="John, Sarah"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Duration (seconds)</label>
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Director Notes</label>
                                <textarea
                                    value={form.director_notes}
                                    onChange={(e) => setForm({ ...form, director_notes: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                >
                                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#121212]">
                            <button
                                onClick={() => { setShowAddModal(false); setEditingShot(null); resetForm(); }}
                                className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addShot}
                                disabled={!form.description}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                {editingShot ? 'Update Shot' : 'Add Shot'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
