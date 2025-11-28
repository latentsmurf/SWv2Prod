'use client';

import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Search, Filter, Edit, Trash2, Eye, X,
    Loader2, Upload, DollarSign, MapPin, Tag, Box, Clock,
    Check, AlertTriangle, Image
} from 'lucide-react';

interface Prop {
    id: string;
    name: string;
    description?: string;
    category: 'hand_props' | 'set_dressing' | 'hero_props' | 'practical' | 'food' | 'documents' | 'electronics' | 'other';
    subcategory?: string;
    quantity: number;
    condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
    source: 'owned' | 'rented' | 'purchased' | 'borrowed' | 'made';
    vendor?: string;
    rental_cost?: number;
    purchase_cost?: number;
    replacement_value?: number;
    storage_location?: string;
    image_url?: string;
    reference_images: string[];
    scenes?: string[];
    characters?: string[];
    notes?: string;
    is_hero: boolean;
    is_breakaway: boolean;
    multiples_needed: number;
    status: 'needed' | 'sourcing' | 'acquired' | 'on_set' | 'wrapped' | 'returned';
    created_at: string;
}

interface PropsDatabaseProps {
    projectId?: string;
    onSelect?: (prop: Prop) => void;
    selectionMode?: boolean;
}

const CATEGORIES = {
    hand_props: { label: 'Hand Props', icon: '✋', color: 'bg-blue-500/10 text-blue-400' },
    set_dressing: { label: 'Set Dressing', icon: '🪴', color: 'bg-green-500/10 text-green-400' },
    hero_props: { label: 'Hero Props', icon: '⭐', color: 'bg-yellow-500/10 text-yellow-400' },
    practical: { label: 'Practical', icon: '💡', color: 'bg-orange-500/10 text-orange-400' },
    food: { label: 'Food/Consumables', icon: '🍎', color: 'bg-red-500/10 text-red-400' },
    documents: { label: 'Documents', icon: '📄', color: 'bg-purple-500/10 text-purple-400' },
    electronics: { label: 'Electronics', icon: '📱', color: 'bg-cyan-500/10 text-cyan-400' },
    other: { label: 'Other', icon: '📦', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    needed: { label: 'Needed', color: 'bg-red-500/10 text-red-400' },
    sourcing: { label: 'Sourcing', color: 'bg-yellow-500/10 text-yellow-400' },
    acquired: { label: 'Acquired', color: 'bg-blue-500/10 text-blue-400' },
    on_set: { label: 'On Set', color: 'bg-green-500/10 text-green-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' },
    returned: { label: 'Returned', color: 'bg-gray-500/10 text-gray-400' }
};

export default function PropsDatabase({ projectId, onSelect, selectionMode }: PropsDatabaseProps) {
    const [props, setProps] = useState<Prop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProp, setSelectedProp] = useState<Prop | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'hand_props' as Prop['category'],
        subcategory: '',
        quantity: 1,
        condition: 'new' as Prop['condition'],
        source: 'purchased' as Prop['source'],
        vendor: '',
        rental_cost: 0,
        purchase_cost: 0,
        replacement_value: 0,
        storage_location: '',
        image_url: '',
        notes: '',
        is_hero: false,
        is_breakaway: false,
        multiples_needed: 1
    });

    // Fetch props
    useEffect(() => {
        const fetchProps = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/props`
                    : '/api/library/props';
                const res = await fetch(url);
                if (res.ok) {
                    setProps(await res.json());
                }
            } catch (error) {
                console.error('Error fetching props:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProps();
    }, [projectId]);

    // Filter props
    const filteredProps = props.filter(prop => {
        if (filterCategory !== 'all' && prop.category !== filterCategory) return false;
        if (filterStatus !== 'all' && prop.status !== filterStatus) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return prop.name.toLowerCase().includes(query) ||
                prop.description?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add prop
    const addProp = async () => {
        const newProp: Prop = {
            id: crypto.randomUUID(),
            ...form,
            reference_images: [],
            scenes: [],
            characters: [],
            status: 'needed',
            created_at: new Date().toISOString()
        };

        setProps(prev => [...prev, newProp]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/props`
                : '/api/library/props';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProp)
            });
        } catch (error) {
            console.error('Error adding prop:', error);
        }
    };

    // Update status
    const updateStatus = async (propId: string, status: Prop['status']) => {
        setProps(prev => prev.map(p => p.id === propId ? { ...p, status } : p));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/props/${propId}`
                : `/api/library/props/${propId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete prop
    const deleteProp = async (propId: string) => {
        if (!confirm('Delete this prop?')) return;

        setProps(prev => prev.filter(p => p.id !== propId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/props/${propId}`
                : `/api/library/props/${propId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', category: 'hand_props', subcategory: '',
            quantity: 1, condition: 'new', source: 'purchased', vendor: '',
            rental_cost: 0, purchase_cost: 0, replacement_value: 0,
            storage_location: '', image_url: '', notes: '',
            is_hero: false, is_breakaway: false, multiples_needed: 1
        });
    };

    // Stats
    const stats = {
        total: props.length,
        hero: props.filter(p => p.is_hero).length,
        needed: props.filter(p => p.status === 'needed' || p.status === 'sourcing').length,
        total_value: props.reduce((sum, p) => sum + (p.purchase_cost || p.rental_cost || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="text-yellow-500" />
                        Props Database
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage production props and set pieces
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Prop
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Props</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Hero Props</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.hero}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Still Needed</p>
                    <p className="text-2xl font-bold text-red-400">{stats.needed}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-green-400">${stats.total_value.toLocaleString()}</p>
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
                        placeholder="Search props..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORIES).map(([key, config]) => (
                        <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Props Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredProps.length === 0 ? (
                        <div className="col-span-4 bg-[#121212] border border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No props found
                        </div>
                    ) : (
                        filteredProps.map((prop) => {
                            const categoryConfig = CATEGORIES[prop.category];
                            const statusConfig = STATUS_CONFIG[prop.status];

                            return (
                                <div
                                    key={prop.id}
                                    className={`bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(prop)}
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-white/5 relative">
                                        {prop.image_url ? (
                                            <img
                                                src={prop.image_url}
                                                alt={prop.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                {categoryConfig.icon}
                                            </div>
                                        )}
                                        {prop.is_hero && (
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold">
                                                    HERO
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded text-xs ${categoryConfig.color}`}>
                                                {categoryConfig.label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        {prop.quantity > 1 && (
                                            <div className="absolute bottom-2 right-2">
                                                <span className="px-2 py-1 bg-black/50 text-white rounded text-xs">
                                                    x{prop.quantity}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold truncate">{prop.name}</h3>
                                        {prop.description && (
                                            <p className="text-sm text-gray-500 truncate">{prop.description}</p>
                                        )}

                                        {/* Cost/Location */}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            {(prop.purchase_cost || prop.rental_cost) && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={12} />
                                                    {prop.purchase_cost || prop.rental_cost}
                                                </span>
                                            )}
                                            {prop.storage_location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {prop.storage_location}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={prop.status}
                                                    onChange={(e) => updateStatus(prop.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedProp(prop); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteProp(prop.id); }}
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
                    <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]">
                            <h3 className="text-lg font-bold text-white">Add Prop</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Prop Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(CATEGORIES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.icon} {config.label}</option>
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Condition</label>
                                    <select
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="new">New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Source</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="owned">Owned</option>
                                        <option value="rented">Rented</option>
                                        <option value="purchased">Purchased</option>
                                        <option value="borrowed">Borrowed</option>
                                        <option value="made">Made</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Cost ($)</label>
                                    <input
                                        type="number"
                                        value={form.purchase_cost}
                                        onChange={(e) => setForm({ ...form, purchase_cost: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Vendor</label>
                                    <input
                                        type="text"
                                        value={form.vendor}
                                        onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Storage Location</label>
                                    <input
                                        type="text"
                                        value={form.storage_location}
                                        onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_hero}
                                        onChange={(e) => setForm({ ...form, is_hero: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Hero Prop</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_breakaway}
                                        onChange={(e) => setForm({ ...form, is_breakaway: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Breakaway</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addProp}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Prop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
