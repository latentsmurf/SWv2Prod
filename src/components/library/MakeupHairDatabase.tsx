'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles, Plus, Search, Filter, Trash2, Eye, X,
    Loader2, User, Clock, Camera, Palette, AlertTriangle
} from 'lucide-react';

interface MakeupLook {
    id: string;
    name: string;
    description?: string;
    type: 'beauty' | 'character' | 'sfx' | 'prosthetic' | 'aging' | 'injury' | 'fantasy' | 'period' | 'other';
    department: 'makeup' | 'hair' | 'both';
    character_id?: string;
    character_name?: string;
    scenes?: string[];
    
    // Makeup details
    foundation?: string;
    eye_makeup?: string;
    lip_color?: string;
    skin_effects?: string[];
    prosthetics?: string[];
    
    // Hair details
    hair_style?: string;
    hair_color?: string;
    wig_needed: boolean;
    wig_details?: string;
    hair_pieces?: string[];
    
    // Time and materials
    application_time?: number; // minutes
    removal_time?: number;
    materials_needed?: string[];
    special_products?: string[];
    
    // References
    image_url?: string;
    reference_images: string[];
    continuity_photos: string[];
    
    // Notes
    artist_notes?: string;
    actor_allergies?: string;
    touch_up_notes?: string;
    
    status: 'designed' | 'testing' | 'approved' | 'ready' | 'in_use';
    created_at: string;
}

interface MakeupHairDatabaseProps {
    projectId?: string;
    characterId?: string;
    onSelect?: (look: MakeupLook) => void;
    selectionMode?: boolean;
}

const LOOK_TYPES = {
    beauty: { label: 'Beauty/Natural', icon: '✨', color: 'bg-pink-500/10 text-pink-400' },
    character: { label: 'Character', icon: '🎭', color: 'bg-purple-500/10 text-purple-400' },
    sfx: { label: 'SFX', icon: '🎃', color: 'bg-orange-500/10 text-orange-400' },
    prosthetic: { label: 'Prosthetic', icon: '🧟', color: 'bg-red-500/10 text-red-400' },
    aging: { label: 'Aging', icon: '👴', color: 'bg-gray-500/10 text-gray-400' },
    injury: { label: 'Injury/Wound', icon: '🩹', color: 'bg-red-500/10 text-red-400' },
    fantasy: { label: 'Fantasy', icon: '🧝', color: 'bg-cyan-500/10 text-cyan-400' },
    period: { label: 'Period', icon: '🎩', color: 'bg-yellow-500/10 text-yellow-400' },
    other: { label: 'Other', icon: '💄', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    designed: { label: 'Designed', color: 'bg-gray-500/10 text-gray-400' },
    testing: { label: 'Testing', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' },
    ready: { label: 'Ready', color: 'bg-blue-500/10 text-blue-400' },
    in_use: { label: 'In Use', color: 'bg-purple-500/10 text-purple-400' }
};

export default function MakeupHairDatabase({ projectId, characterId, onSelect, selectionMode }: MakeupHairDatabaseProps) {
    const [looks, setLooks] = useState<MakeupLook[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLook, setSelectedLook] = useState<MakeupLook | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'beauty' as MakeupLook['type'],
        department: 'both' as MakeupLook['department'],
        character_name: '',
        foundation: '',
        eye_makeup: '',
        lip_color: '',
        skin_effects: '',
        prosthetics: '',
        hair_style: '',
        hair_color: '',
        wig_needed: false,
        wig_details: '',
        application_time: 30,
        removal_time: 15,
        materials_needed: '',
        special_products: '',
        image_url: '',
        artist_notes: '',
        actor_allergies: '',
        touch_up_notes: ''
    });

    // Fetch looks
    useEffect(() => {
        const fetchLooks = async () => {
            try {
                let url = projectId 
                    ? `/api/projects/${projectId}/makeup-hair`
                    : '/api/library/makeup-hair';
                if (characterId) url += `?character=${characterId}`;
                const res = await fetch(url);
                if (res.ok) {
                    setLooks(await res.json());
                }
            } catch (error) {
                console.error('Error fetching looks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLooks();
    }, [projectId, characterId]);

    // Filter looks
    const filteredLooks = looks.filter(look => {
        if (filterType !== 'all' && look.type !== filterType) return false;
        if (filterDepartment !== 'all' && look.department !== filterDepartment && look.department !== 'both') return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return look.name.toLowerCase().includes(query) ||
                look.description?.toLowerCase().includes(query) ||
                look.character_name?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add look
    const addLook = async () => {
        const newLook: MakeupLook = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            type: form.type,
            department: form.department,
            character_name: form.character_name,
            foundation: form.foundation,
            eye_makeup: form.eye_makeup,
            lip_color: form.lip_color,
            skin_effects: form.skin_effects.split(',').map(s => s.trim()).filter(Boolean),
            prosthetics: form.prosthetics.split(',').map(p => p.trim()).filter(Boolean),
            hair_style: form.hair_style,
            hair_color: form.hair_color,
            wig_needed: form.wig_needed,
            wig_details: form.wig_details,
            application_time: form.application_time,
            removal_time: form.removal_time,
            materials_needed: form.materials_needed.split(',').map(m => m.trim()).filter(Boolean),
            special_products: form.special_products.split(',').map(p => p.trim()).filter(Boolean),
            image_url: form.image_url,
            reference_images: [],
            continuity_photos: [],
            artist_notes: form.artist_notes,
            actor_allergies: form.actor_allergies,
            touch_up_notes: form.touch_up_notes,
            status: 'designed',
            created_at: new Date().toISOString()
        };

        setLooks(prev => [...prev, newLook]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/makeup-hair`
                : '/api/library/makeup-hair';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLook)
            });
        } catch (error) {
            console.error('Error adding look:', error);
        }
    };

    // Update status
    const updateStatus = async (lookId: string, status: MakeupLook['status']) => {
        setLooks(prev => prev.map(l => l.id === lookId ? { ...l, status } : l));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/makeup-hair/${lookId}`
                : `/api/library/makeup-hair/${lookId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete look
    const deleteLook = async (lookId: string) => {
        if (!confirm('Delete this look?')) return;

        setLooks(prev => prev.filter(l => l.id !== lookId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/makeup-hair/${lookId}`
                : `/api/library/makeup-hair/${lookId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', type: 'beauty', department: 'both',
            character_name: '', foundation: '', eye_makeup: '', lip_color: '',
            skin_effects: '', prosthetics: '', hair_style: '', hair_color: '',
            wig_needed: false, wig_details: '', application_time: 30, removal_time: 15,
            materials_needed: '', special_products: '', image_url: '',
            artist_notes: '', actor_allergies: '', touch_up_notes: ''
        });
    };

    // Stats
    const stats = {
        total: looks.length,
        sfx: looks.filter(l => l.type === 'sfx' || l.type === 'prosthetic').length,
        withWigs: looks.filter(l => l.wig_needed).length,
        totalAppTime: looks.reduce((sum, l) => sum + (l.application_time || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Sparkles className="text-yellow-500" />
                        Makeup & Hair
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage looks, styles, and continuity
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Look
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Looks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">SFX/Prosthetic</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.sfx}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">With Wigs</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.withWigs}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total App Time</p>
                    <p className="text-2xl font-bold text-blue-400">{Math.floor(stats.totalAppTime / 60)}h {stats.totalAppTime % 60}m</p>
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
                        placeholder="Search looks..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(LOOK_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                </select>
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Departments</option>
                    <option value="makeup">Makeup Only</option>
                    <option value="hair">Hair Only</option>
                    <option value="both">Both</option>
                </select>
            </div>

            {/* Looks Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filteredLooks.length === 0 ? (
                        <div className="col-span-3 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No looks found
                        </div>
                    ) : (
                        filteredLooks.map((look) => {
                            const typeConfig = LOOK_TYPES[look.type];
                            const statusConfig = STATUS_CONFIG[look.status];

                            return (
                                <div
                                    key={look.id}
                                    className={`bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(look)}
                                >
                                    {/* Image */}
                                    <div className="aspect-video bg-white/5 relative">
                                        {look.image_url ? (
                                            <img
                                                src={look.image_url}
                                                alt={look.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {typeConfig.icon}
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                        {look.wig_needed && (
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-bold">
                                                    WIG
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold">{look.name}</h3>
                                        {look.character_name && (
                                            <p className="text-sm text-yellow-500 flex items-center gap-1">
                                                <User size={12} />
                                                {look.character_name}
                                            </p>
                                        )}

                                        {/* Time */}
                                        {look.application_time && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                                <Clock size={12} />
                                                {look.application_time} min application
                                            </p>
                                        )}

                                        {/* Allergies Warning */}
                                        {look.actor_allergies && (
                                            <div className="mt-2 px-2 py-1 bg-red-500/10 rounded flex items-center gap-1">
                                                <AlertTriangle size={12} className="text-red-400" />
                                                <span className="text-xs text-red-400">Allergy notes</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={look.status}
                                                    onChange={(e) => updateStatus(look.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedLook(look); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteLook(look.id); }}
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
                            <h3 className="text-lg font-bold text-white">Add Look</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Look Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g., Sarah - Day 1 Natural"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Character</label>
                                    <input
                                        type="text"
                                        value={form.character_name}
                                        onChange={(e) => setForm({ ...form, character_name: e.target.value })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(LOOK_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.icon} {config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Department</label>
                                    <select
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="both">Both Makeup & Hair</option>
                                        <option value="makeup">Makeup Only</option>
                                        <option value="hair">Hair Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Hair Style</label>
                                    <input
                                        type="text"
                                        value={form.hair_style}
                                        onChange={(e) => setForm({ ...form, hair_style: e.target.value })}
                                        placeholder="e.g., Loose waves, pulled back"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Hair Color</label>
                                    <input
                                        type="text"
                                        value={form.hair_color}
                                        onChange={(e) => setForm({ ...form, hair_color: e.target.value })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.wig_needed}
                                        onChange={(e) => setForm({ ...form, wig_needed: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Wig Needed</span>
                                </label>
                                {form.wig_needed && (
                                    <input
                                        type="text"
                                        value={form.wig_details}
                                        onChange={(e) => setForm({ ...form, wig_details: e.target.value })}
                                        placeholder="Wig details..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Application Time (min)</label>
                                    <input
                                        type="number"
                                        value={form.application_time}
                                        onChange={(e) => setForm({ ...form, application_time: parseInt(e.target.value) })}
                                        min="0"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Removal Time (min)</label>
                                    <input
                                        type="number"
                                        value={form.removal_time}
                                        onChange={(e) => setForm({ ...form, removal_time: parseInt(e.target.value) })}
                                        min="0"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
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
                                <label className="block text-sm text-red-400 mb-2">Actor Allergies (IMPORTANT)</label>
                                <input
                                    type="text"
                                    value={form.actor_allergies}
                                    onChange={(e) => setForm({ ...form, actor_allergies: e.target.value })}
                                    placeholder="List any known allergies..."
                                    className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Artist Notes</label>
                                <textarea
                                    value={form.artist_notes}
                                    onChange={(e) => setForm({ ...form, artist_notes: e.target.value })}
                                    rows={2}
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addLook}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Look
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
