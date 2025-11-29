'use client';

import React, { useState, useEffect } from 'react';
import {
    Building2, Plus, Search, Filter, Edit, Trash2, Eye, X,
    Loader2, MapPin, Sun, Moon, Clock, Camera, DollarSign,
    Image, Trees, Home, Warehouse, Mountain
} from 'lucide-react';

interface Environment {
    id: string;
    name: string;
    description?: string;
    type: 'interior' | 'exterior' | 'int_ext';
    category: 'residential' | 'commercial' | 'industrial' | 'natural' | 'urban' | 'fantasy' | 'sci_fi' | 'period' | 'other';
    time_of_day: 'day' | 'night' | 'dawn' | 'dusk' | 'any';
    era?: string;
    style?: string;
    location_type: 'studio' | 'practical' | 'virtual' | 'hybrid';
    real_location?: string;
    address?: string;
    gps_coordinates?: string;
    size?: string;
    features?: string[];
    lighting_notes?: string;
    sound_notes?: string;
    image_url?: string;
    reference_images: string[];
    mood_keywords?: string[];
    color_palette?: string[];
    scenes?: string[];
    daily_rate?: number;
    build_cost?: number;
    notes?: string;
    status: 'concept' | 'scouting' | 'confirmed' | 'built' | 'wrapped';
    created_at: string;
}

interface EnvironmentsDatabaseProps {
    projectId?: string;
    onSelect?: (env: Environment) => void;
    selectionMode?: boolean;
}

const CATEGORIES = {
    residential: { label: 'Residential', icon: Home, color: 'bg-blue-500/10 text-blue-400' },
    commercial: { label: 'Commercial', icon: Building2, color: 'bg-green-500/10 text-green-400' },
    industrial: { label: 'Industrial', icon: Warehouse, color: 'bg-orange-500/10 text-orange-400' },
    natural: { label: 'Natural', icon: Trees, color: 'bg-emerald-500/10 text-emerald-400' },
    urban: { label: 'Urban', icon: Building2, color: 'bg-purple-500/10 text-purple-400' },
    fantasy: { label: 'Fantasy', icon: Mountain, color: 'bg-pink-500/10 text-pink-400' },
    sci_fi: { label: 'Sci-Fi', icon: Building2, color: 'bg-cyan-500/10 text-cyan-400' },
    period: { label: 'Period', icon: Home, color: 'bg-yellow-500/10 text-yellow-400' },
    other: { label: 'Other', icon: Building2, color: 'bg-gray-500/10 text-gray-400' }
};

const TYPE_CONFIG = {
    interior: { label: 'INT', color: 'bg-blue-500/10 text-blue-400' },
    exterior: { label: 'EXT', color: 'bg-green-500/10 text-green-400' },
    int_ext: { label: 'INT/EXT', color: 'bg-purple-500/10 text-purple-400' }
};

const TIME_CONFIG = {
    day: { label: 'Day', icon: Sun },
    night: { label: 'Night', icon: Moon },
    dawn: { label: 'Dawn', icon: Sun },
    dusk: { label: 'Dusk', icon: Moon },
    any: { label: 'Any', icon: Clock }
};

const STATUS_CONFIG = {
    concept: { label: 'Concept', color: 'bg-gray-500/10 text-gray-400' },
    scouting: { label: 'Scouting', color: 'bg-yellow-500/10 text-yellow-400' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-400' },
    built: { label: 'Built', color: 'bg-green-500/10 text-green-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' }
};

export default function EnvironmentsDatabase({ projectId, onSelect, selectionMode }: EnvironmentsDatabaseProps) {
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'interior' as Environment['type'],
        category: 'residential' as Environment['category'],
        time_of_day: 'day' as Environment['time_of_day'],
        era: '',
        style: '',
        location_type: 'practical' as Environment['location_type'],
        real_location: '',
        address: '',
        size: '',
        features: '',
        lighting_notes: '',
        sound_notes: '',
        image_url: '',
        mood_keywords: '',
        daily_rate: 0,
        build_cost: 0,
        notes: ''
    });

    // Fetch environments
    useEffect(() => {
        const fetchEnvironments = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/environments`
                    : '/api/library/environments';
                const res = await fetch(url);
                if (res.ok) {
                    setEnvironments(await res.json());
                }
            } catch (error) {
                console.error('Error fetching environments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnvironments();
    }, [projectId]);

    // Filter environments
    const filteredEnvironments = environments.filter(env => {
        if (filterCategory !== 'all' && env.category !== filterCategory) return false;
        if (filterType !== 'all' && env.type !== filterType) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return env.name.toLowerCase().includes(query) ||
                env.description?.toLowerCase().includes(query) ||
                env.real_location?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add environment
    const addEnvironment = async () => {
        const newEnv: Environment = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            type: form.type,
            category: form.category,
            time_of_day: form.time_of_day,
            era: form.era,
            style: form.style,
            location_type: form.location_type,
            real_location: form.real_location,
            address: form.address,
            size: form.size,
            features: form.features.split(',').map(f => f.trim()).filter(Boolean),
            lighting_notes: form.lighting_notes,
            sound_notes: form.sound_notes,
            image_url: form.image_url,
            reference_images: [],
            mood_keywords: form.mood_keywords.split(',').map(k => k.trim()).filter(Boolean),
            color_palette: [],
            scenes: [],
            daily_rate: form.daily_rate,
            build_cost: form.build_cost,
            notes: form.notes,
            status: 'concept',
            created_at: new Date().toISOString()
        };

        setEnvironments(prev => [...prev, newEnv]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/environments`
                : '/api/library/environments';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEnv)
            });
        } catch (error) {
            console.error('Error adding environment:', error);
        }
    };

    // Update status
    const updateStatus = async (envId: string, status: Environment['status']) => {
        setEnvironments(prev => prev.map(e => e.id === envId ? { ...e, status } : e));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/environments/${envId}`
                : `/api/library/environments/${envId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete environment
    const deleteEnv = async (envId: string) => {
        if (!confirm('Delete this environment?')) return;

        setEnvironments(prev => prev.filter(e => e.id !== envId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/environments/${envId}`
                : `/api/library/environments/${envId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', type: 'interior', category: 'residential',
            time_of_day: 'day', era: '', style: '', location_type: 'practical',
            real_location: '', address: '', size: '', features: '',
            lighting_notes: '', sound_notes: '', image_url: '',
            mood_keywords: '', daily_rate: 0, build_cost: 0, notes: ''
        });
    };

    // Stats
    const stats = {
        total: environments.length,
        interiors: environments.filter(e => e.type === 'interior').length,
        exteriors: environments.filter(e => e.type === 'exterior').length,
        confirmed: environments.filter(e => e.status === 'confirmed' || e.status === 'built').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Building2 className="text-yellow-500" />
                        Environments & Sets
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage locations and set designs
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Environment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Environments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Interiors</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.interiors}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Exteriors</p>
                    <p className="text-2xl font-bold text-green-400">{stats.exteriors}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Confirmed</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.confirmed}</p>
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
                        placeholder="Search environments..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORIES).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Environments Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filteredEnvironments.length === 0 ? (
                        <div className="col-span-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No environments found
                        </div>
                    ) : (
                        filteredEnvironments.map((env) => {
                            const categoryConfig = CATEGORIES[env.category];
                            const typeConfig = TYPE_CONFIG[env.type];
                            const timeConfig = TIME_CONFIG[env.time_of_day];
                            const statusConfig = STATUS_CONFIG[env.status];
                            const CategoryIcon = categoryConfig.icon;
                            const TimeIcon = timeConfig.icon;

                            return (
                                <div
                                    key={env.id}
                                    className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(env)}
                                >
                                    {/* Image */}
                                    <div className="aspect-video bg-white/5 relative">
                                        {env.image_url ? (
                                            <img
                                                src={env.image_url}
                                                alt={env.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <CategoryIcon className="text-gray-600" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 flex gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2 flex items-center gap-1">
                                            <TimeIcon size={14} className="text-white" />
                                            <span className="text-xs text-white">{timeConfig.label}</span>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${categoryConfig.color}`}>
                                                {categoryConfig.label}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold">{env.name}</h3>
                                        {env.description && (
                                            <p className="text-sm text-gray-500 truncate">{env.description}</p>
                                        )}
                                        {env.real_location && (
                                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                <MapPin size={12} />
                                                {env.real_location}
                                            </p>
                                        )}

                                        {/* Features */}
                                        {env.features && env.features.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {env.features.slice(0, 3).map((f, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                        {f}
                                                    </span>
                                                ))}
                                                {env.features.length > 3 && (
                                                    <span className="text-xs text-gray-600">+{env.features.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={env.status}
                                                    onChange={(e) => updateStatus(env.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedEnv(env); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteEnv(env.id); }}
                                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]">
                            <h3 className="text-lg font-bold text-white">Add Environment</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Environment Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., Sarah's Apartment - Living Room"
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(CATEGORIES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Time of Day</label>
                                    <select
                                        value={form.time_of_day}
                                        onChange={(e) => setForm({ ...form, time_of_day: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(TIME_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Location Type</label>
                                    <select
                                        value={form.location_type}
                                        onChange={(e) => setForm({ ...form, location_type: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="studio">Studio Build</option>
                                        <option value="practical">Practical Location</option>
                                        <option value="virtual">Virtual Production</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Real Location</label>
                                    <input
                                        type="text"
                                        value={form.real_location}
                                        onChange={(e) => setForm({ ...form, real_location: e.target.value })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Features (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.features}
                                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                                    placeholder="e.g., Large windows, High ceilings, Hardwood floors"
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Mood Keywords (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.mood_keywords}
                                    onChange={(e) => setForm({ ...form, mood_keywords: e.target.value })}
                                    placeholder="e.g., Cozy, Warm, Intimate"
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addEnvironment}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Environment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
