'use client';

import React, { useState, useEffect } from 'react';
import {
    Lightbulb, Plus, Search, Filter, Trash2, Eye, X,
    Loader2, DollarSign, Box, Settings, Zap
} from 'lucide-react';

interface LightingGripItem {
    id: string;
    name: string;
    type: 'lighting' | 'grip' | 'electrical' | 'rigging';
    category: string;
    make?: string;
    model?: string;
    wattage?: number;
    color_temp?: string;
    beam_angle?: string;
    dimmer_compatible: boolean;
    power_requirements?: string;
    weight?: string;
    quantity: number;
    condition: 'new' | 'excellent' | 'good' | 'fair' | 'needs_repair';
    source: 'owned' | 'rented' | 'borrowed';
    vendor?: string;
    daily_rate?: number;
    serial_numbers?: string[];
    image_url?: string;
    notes?: string;
    status: 'available' | 'in_use' | 'prep' | 'maintenance';
    created_at: string;
}

interface LightingGripDatabaseProps {
    projectId?: string;
    onSelect?: (item: LightingGripItem) => void;
    selectionMode?: boolean;
}

const LIGHTING_CATEGORIES = [
    { key: 'hmi', label: 'HMI/Daylight', icon: '☀️' },
    { key: 'tungsten', label: 'Tungsten', icon: '💡' },
    { key: 'led', label: 'LED', icon: '🔆' },
    { key: 'fluorescent', label: 'Fluorescent', icon: '📏' },
    { key: 'practical', label: 'Practicals', icon: '🏠' },
    { key: 'softbox', label: 'Softboxes', icon: '⬜' }
];

const GRIP_CATEGORIES = [
    { key: 'stands', label: 'Stands', icon: '🎯' },
    { key: 'flags', label: 'Flags/Cutters', icon: '🏴' },
    { key: 'diffusion', label: 'Diffusion/Gels', icon: '📄' },
    { key: 'clamps', label: 'Clamps/Mounts', icon: '🔧' },
    { key: 'dollies', label: 'Dollies/Sliders', icon: '🛒' },
    { key: 'cranes', label: 'Cranes/Jibs', icon: '🏗️' },
    { key: 'cables', label: 'Cables/Distro', icon: '🔌' }
];

const ALL_CATEGORIES = [...LIGHTING_CATEGORIES, ...GRIP_CATEGORIES];

const TYPE_CONFIG = {
    lighting: { label: 'Lighting', color: 'bg-yellow-500/10 text-yellow-400' },
    grip: { label: 'Grip', color: 'bg-blue-500/10 text-blue-400' },
    electrical: { label: 'Electrical', color: 'bg-orange-500/10 text-orange-400' },
    rigging: { label: 'Rigging', color: 'bg-purple-500/10 text-purple-400' }
};

const STATUS_CONFIG = {
    available: { label: 'Available', color: 'bg-green-500/10 text-green-400' },
    in_use: { label: 'In Use', color: 'bg-blue-500/10 text-blue-400' },
    prep: { label: 'In Prep', color: 'bg-yellow-500/10 text-yellow-400' },
    maintenance: { label: 'Maintenance', color: 'bg-red-500/10 text-red-400' }
};

export default function LightingGripDatabase({ projectId, onSelect, selectionMode }: LightingGripDatabaseProps) {
    const [items, setItems] = useState<LightingGripItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        type: 'lighting' as LightingGripItem['type'],
        category: 'led',
        make: '',
        model: '',
        wattage: 0,
        color_temp: '',
        quantity: 1,
        condition: 'good' as LightingGripItem['condition'],
        source: 'rented' as LightingGripItem['source'],
        vendor: '',
        daily_rate: 0,
        power_requirements: '',
        dimmer_compatible: true,
        image_url: '',
        notes: ''
    });

    // Fetch items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/lighting-grip`
                    : '/api/library/lighting-grip';
                const res = await fetch(url);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch (error) {
                console.error('Error fetching:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [projectId]);

    // Filter items
    const filteredItems = items.filter(item => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(query) ||
                item.make?.toLowerCase().includes(query) ||
                item.model?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add item
    const addItem = async () => {
        const newItem: LightingGripItem = {
            id: crypto.randomUUID(),
            name: form.name || `${form.make} ${form.model}`.trim(),
            type: form.type,
            category: form.category,
            make: form.make,
            model: form.model,
            wattage: form.wattage,
            color_temp: form.color_temp,
            quantity: form.quantity,
            condition: form.condition,
            source: form.source,
            vendor: form.vendor,
            daily_rate: form.daily_rate,
            power_requirements: form.power_requirements,
            dimmer_compatible: form.dimmer_compatible,
            image_url: form.image_url,
            notes: form.notes,
            status: 'available',
            created_at: new Date().toISOString()
        };

        setItems(prev => [...prev, newItem]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/lighting-grip`
                : '/api/library/lighting-grip';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
        } catch (error) {
            console.error('Error adding:', error);
        }
    };

    // Update status
    const updateStatus = async (itemId: string, status: LightingGripItem['status']) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
    };

    // Delete item
    const deleteItem = async (itemId: string) => {
        if (!confirm('Delete this item?')) return;
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', type: 'lighting', category: 'led', make: '', model: '',
            wattage: 0, color_temp: '', quantity: 1, condition: 'good',
            source: 'rented', vendor: '', daily_rate: 0, power_requirements: '',
            dimmer_compatible: true, image_url: '', notes: ''
        });
    };

    // Stats
    const stats = {
        lighting: items.filter(i => i.type === 'lighting').length,
        grip: items.filter(i => i.type === 'grip').length,
        inUse: items.filter(i => i.status === 'in_use').length,
        totalDaily: items.reduce((sum, i) => sum + (i.daily_rate || 0) * i.quantity, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Lightbulb className="text-yellow-500" />
                        Lighting & Grip
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage lighting and grip equipment
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Equipment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Lighting</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.lighting}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Grip</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.grip}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">In Use</p>
                    <p className="text-2xl font-bold text-green-400">{stats.inUse}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Daily Rate</p>
                    <p className="text-2xl font-bold text-white">${stats.totalDaily}</p>
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
                        placeholder="Search equipment..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
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
                    {ALL_CATEGORIES.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.icon} {cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredItems.length === 0 ? (
                        <div className="col-span-4 bg-[#121212] border border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No equipment found
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const typeConfig = TYPE_CONFIG[item.type];
                            const statusConfig = STATUS_CONFIG[item.status];
                            const catConfig = ALL_CATEGORIES.find(c => c.key === item.category);

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(item)}
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-white/5 relative">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {catConfig?.icon || '💡'}
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        {item.quantity > 1 && (
                                            <div className="absolute bottom-2 right-2">
                                                <span className="px-2 py-1 bg-black/50 text-white rounded text-xs">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold truncate">{item.name}</h3>
                                        {(item.make || item.model) && (
                                            <p className="text-sm text-gray-400 truncate">
                                                {item.make} {item.model}
                                            </p>
                                        )}

                                        {/* Specs */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.wattage && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded text-xs text-yellow-400">
                                                    <Zap size={10} />
                                                    {item.wattage}W
                                                </span>
                                            )}
                                            {item.color_temp && (
                                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                    {item.color_temp}
                                                </span>
                                            )}
                                        </div>

                                        {/* Rate */}
                                        {item.daily_rate && (
                                            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {item.daily_rate}/day
                                            </p>
                                        )}

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateStatus(item.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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
                            <h3 className="text-lg font-bold text-white">Add Equipment</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
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
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {ALL_CATEGORIES.map(cat => (
                                            <option key={cat.key} value={cat.key}>{cat.icon} {cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Make</label>
                                    <input
                                        type="text"
                                        value={form.make}
                                        onChange={(e) => setForm({ ...form, make: e.target.value })}
                                        placeholder="e.g., ARRI, Kino Flo"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Model</label>
                                    <input
                                        type="text"
                                        value={form.model}
                                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                                        placeholder="e.g., SkyPanel S60-C"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            {form.type === 'lighting' && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Wattage</label>
                                        <input
                                            type="number"
                                            value={form.wattage}
                                            onChange={(e) => setForm({ ...form, wattage: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Color Temp</label>
                                        <input
                                            type="text"
                                            value={form.color_temp}
                                            onChange={(e) => setForm({ ...form, color_temp: e.target.value })}
                                            placeholder="e.g., 5600K, Bi-Color"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                    <div className="flex items-end pb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={form.dimmer_compatible}
                                                onChange={(e) => setForm({ ...form, dimmer_compatible: e.target.checked })}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="text-sm text-gray-400">Dimmable</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
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
                                    <label className="block text-sm text-gray-400 mb-2">Source</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="rented">Rented</option>
                                        <option value="owned">Owned</option>
                                        <option value="borrowed">Borrowed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Daily Rate ($)</label>
                                    <input
                                        type="number"
                                        value={form.daily_rate}
                                        onChange={(e) => setForm({ ...form, daily_rate: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addItem}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                            >
                                Add Equipment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
