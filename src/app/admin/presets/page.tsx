'use client';

import React, { useState, useEffect } from 'react';
import {
    Palette, Search, Plus, Edit2, Trash2, Eye, Copy, Filter,
    Grid, List, ChevronDown, MoreHorizontal, Star, Check, X,
    Upload, Download, Image as ImageIcon
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface StylePreset {
    id: string;
    name: string;
    category: string;
    thumbnail_url: string;
    description?: string;
    keywords?: string;
    active: boolean;
    usage_count: number;
    created_at: Date;
}

// ============================================================================
// CATEGORIES
// ============================================================================

const CATEGORIES = [
    'all', 'directors', 'cinematographers', 'animation', 'eras', 
    'genres', 'colors', 'lighting', 'micro-drama', 'film', 'social'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PresetsPage() {
    const [presets, setPresets] = useState<StylePreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPreset, setEditingPreset] = useState<StylePreset | null>(null);

    // Fetch presets
    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const params = new URLSearchParams();
                if (activeCategory !== 'all') {
                    params.set('category', activeCategory);
                }
                if (searchQuery) {
                    params.set('search', searchQuery);
                }
                
                const res = await fetch(`/api/style_presets?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    // Add mock admin data
                    setPresets(data.map((p: any, i: number) => ({
                        ...p,
                        active: true,
                        usage_count: Math.floor(Math.random() * 10000),
                        created_at: new Date(Date.now() - Math.random() * 86400000 * 365)
                    })));
                }
            } catch (error) {
                console.error('Error fetching presets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPresets();
    }, [activeCategory, searchQuery]);

    const handleToggleActive = (presetId: string) => {
        setPresets(prev => prev.map(p => 
            p.id === presetId ? { ...p, active: !p.active } : p
        ));
    };

    const handleDelete = (presetId: string) => {
        if (confirm('Are you sure you want to delete this preset?')) {
            setPresets(prev => prev.filter(p => p.id !== presetId));
        }
    };

    const handleDuplicate = (preset: StylePreset) => {
        const newPreset = {
            ...preset,
            id: `${preset.id}-copy-${Date.now()}`,
            name: `${preset.name} (Copy)`,
            usage_count: 0,
            created_at: new Date()
        };
        setPresets(prev => [newPreset, ...prev]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Style Presets</h1>
                    <p className="text-sm text-gray-500">Manage visual style presets for projects</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white">
                        <Upload size={16} />
                        Import
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm"
                    >
                        <Plus size={16} />
                        Add Preset
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{presets.length}</div>
                    <div className="text-xs text-gray-500">Total Presets</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{presets.filter(p => p.active).length}</div>
                    <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{CATEGORIES.length - 1}</div>
                    <div className="text-xs text-gray-500">Categories</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">
                        {(presets.reduce((sum, p) => sum + p.usage_count, 0) / 1000).toFixed(1)}K
                    </div>
                    <div className="text-xs text-gray-500">Total Usage</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search presets..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
                    />
                </div>
                <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white capitalize"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat.replace('-', ' ')}</option>
                    ))}
                </select>
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {presets.map((preset) => (
                        <div key={preset.id} className="group relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
                            <div className="aspect-video relative">
                                <img
                                    src={preset.thumbnail_url}
                                    alt={preset.name}
                                    className="w-full h-full object-cover"
                                />
                                {!preset.active && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-xs text-gray-400">Inactive</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400">{preset.usage_count.toLocaleString()} uses</span>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => setEditingPreset(preset)}
                                                className="p-1 bg-white/20 rounded hover:bg-white/30"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleDuplicate(preset)}
                                                className="p-1 bg-white/20 rounded hover:bg-white/30"
                                            >
                                                <Copy size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(preset.id)}
                                                className="p-1 bg-red-500/20 rounded hover:bg-red-500/30 text-red-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-white truncate">{preset.name}</span>
                                    <button
                                        onClick={() => handleToggleActive(preset.id)}
                                        className={`w-8 h-4 rounded-full transition-colors ${preset.active ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${preset.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                                <span className="text-[10px] text-gray-500 capitalize">{preset.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Preset</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Usage</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Created</th>
                                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {presets.map((preset) => (
                                <tr key={preset.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={preset.thumbnail_url}
                                                alt={preset.name}
                                                className="w-12 h-8 rounded object-cover"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-white">{preset.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{preset.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-400 capitalize">{preset.category}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-400">{preset.usage_count.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleActive(preset.id)}
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                preset.active 
                                                    ? 'bg-green-500/10 text-green-400' 
                                                    : 'bg-gray-500/10 text-gray-400'
                                            }`}
                                        >
                                            {preset.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-500">{preset.created_at.toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-1 text-gray-500 hover:text-white">
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setEditingPreset(preset)}
                                                className="p-1 text-gray-500 hover:text-white"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDuplicate(preset)}
                                                className="p-1 text-gray-500 hover:text-white"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(preset.id)}
                                                className="p-1 text-gray-500 hover:text-red-400"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingPreset) && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">
                                {editingPreset ? 'Edit Preset' : 'Add New Preset'}
                            </h3>
                            <button 
                                onClick={() => { setShowAddModal(false); setEditingPreset(null); }}
                                className="text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    defaultValue={editingPreset?.name || ''}
                                    placeholder="Preset name"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Category</label>
                                <select 
                                    defaultValue={editingPreset?.category || 'film'}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                >
                                    {CATEGORIES.filter(c => c !== 'all').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Thumbnail URL</label>
                                <input
                                    type="url"
                                    defaultValue={editingPreset?.thumbnail_url || ''}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    defaultValue={editingPreset?.description || ''}
                                    placeholder="Describe this style..."
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Keywords (comma separated)</label>
                                <input
                                    type="text"
                                    defaultValue={editingPreset?.keywords || ''}
                                    placeholder="dramatic, cinematic, moody"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowAddModal(false); setEditingPreset(null); }}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg">
                                {editingPreset ? 'Save Changes' : 'Add Preset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
