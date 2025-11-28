'use client';

import React, { useState, useEffect } from 'react';
import {
    Shirt, Plus, Search, Filter, Edit, Trash2, Eye, X,
    Loader2, DollarSign, User, Tag, Palette, Ruler, Box
} from 'lucide-react';

interface CostumeItem {
    id: string;
    name: string;
    description?: string;
    category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'footwear' | 'accessories' | 'uniforms' | 'period' | 'fantasy' | 'other';
    character_id?: string;
    character_name?: string;
    scenes?: string[];
    size?: string;
    color?: string;
    brand?: string;
    era?: string;
    style?: string;
    condition: 'new' | 'excellent' | 'good' | 'fair' | 'distressed' | 'damaged';
    source: 'purchased' | 'rented' | 'made' | 'borrowed' | 'owned';
    vendor?: string;
    purchase_cost?: number;
    rental_cost?: number;
    rental_period?: string;
    care_instructions?: string;
    alterations_needed?: string;
    multiples: number;
    image_url?: string;
    reference_images: string[];
    notes?: string;
    is_hero: boolean;
    is_continuity_critical: boolean;
    storage_location?: string;
    status: 'needed' | 'sourcing' | 'fitting' | 'approved' | 'on_set' | 'wrapped' | 'returned';
    created_at: string;
}

interface WardrobeDatabaseProps {
    projectId?: string;
    characterId?: string;
    onSelect?: (item: CostumeItem) => void;
    selectionMode?: boolean;
}

const CATEGORIES = {
    tops: { label: 'Tops', icon: '👕', color: 'bg-blue-500/10 text-blue-400' },
    bottoms: { label: 'Bottoms', icon: '👖', color: 'bg-indigo-500/10 text-indigo-400' },
    dresses: { label: 'Dresses', icon: '👗', color: 'bg-pink-500/10 text-pink-400' },
    outerwear: { label: 'Outerwear', icon: '🧥', color: 'bg-gray-500/10 text-gray-400' },
    footwear: { label: 'Footwear', icon: '👞', color: 'bg-amber-500/10 text-amber-400' },
    accessories: { label: 'Accessories', icon: '👜', color: 'bg-purple-500/10 text-purple-400' },
    uniforms: { label: 'Uniforms', icon: '🎽', color: 'bg-green-500/10 text-green-400' },
    period: { label: 'Period', icon: '🎩', color: 'bg-yellow-500/10 text-yellow-400' },
    fantasy: { label: 'Fantasy/Sci-Fi', icon: '🦸', color: 'bg-cyan-500/10 text-cyan-400' },
    other: { label: 'Other', icon: '📦', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    needed: { label: 'Needed', color: 'bg-red-500/10 text-red-400' },
    sourcing: { label: 'Sourcing', color: 'bg-yellow-500/10 text-yellow-400' },
    fitting: { label: 'Fitting', color: 'bg-purple-500/10 text-purple-400' },
    approved: { label: 'Approved', color: 'bg-blue-500/10 text-blue-400' },
    on_set: { label: 'On Set', color: 'bg-green-500/10 text-green-400' },
    wrapped: { label: 'Wrapped', color: 'bg-gray-500/10 text-gray-400' },
    returned: { label: 'Returned', color: 'bg-gray-500/10 text-gray-500' }
};

export default function WardrobeDatabase({ projectId, characterId, onSelect, selectionMode }: WardrobeDatabaseProps) {
    const [items, setItems] = useState<CostumeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterCharacter, setFilterCharacter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CostumeItem | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: 'tops' as CostumeItem['category'],
        character_name: '',
        size: '',
        color: '',
        brand: '',
        era: '',
        style: '',
        condition: 'new' as CostumeItem['condition'],
        source: 'purchased' as CostumeItem['source'],
        vendor: '',
        purchase_cost: 0,
        rental_cost: 0,
        care_instructions: '',
        alterations_needed: '',
        multiples: 1,
        image_url: '',
        notes: '',
        is_hero: false,
        is_continuity_critical: false,
        storage_location: ''
    });

    // Fetch items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                let url = projectId 
                    ? `/api/projects/${projectId}/wardrobe`
                    : '/api/library/wardrobe';
                if (characterId) url += `?character=${characterId}`;
                const res = await fetch(url);
                if (res.ok) {
                    setItems(await res.json());
                }
            } catch (error) {
                console.error('Error fetching wardrobe:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [projectId, characterId]);

    // Filter items
    const filteredItems = items.filter(item => {
        if (filterCategory !== 'all' && item.category !== filterCategory) return false;
        if (filterCharacter !== 'all' && item.character_name !== filterCharacter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.character_name?.toLowerCase().includes(query);
        }
        return true;
    });

    // Get unique characters
    const characters = [...new Set(items.map(i => i.character_name).filter(Boolean))];

    // Add item
    const addItem = async () => {
        const newItem: CostumeItem = {
            id: crypto.randomUUID(),
            ...form,
            reference_images: [],
            scenes: [],
            status: 'needed',
            created_at: new Date().toISOString()
        };

        setItems(prev => [...prev, newItem]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/wardrobe`
                : '/api/library/wardrobe';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    // Update status
    const updateStatus = async (itemId: string, status: CostumeItem['status']) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/wardrobe/${itemId}`
                : `/api/library/wardrobe/${itemId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete item
    const deleteItem = async (itemId: string) => {
        if (!confirm('Delete this costume item?')) return;

        setItems(prev => prev.filter(i => i.id !== itemId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/wardrobe/${itemId}`
                : `/api/library/wardrobe/${itemId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', category: 'tops', character_name: '',
            size: '', color: '', brand: '', era: '', style: '',
            condition: 'new', source: 'purchased', vendor: '',
            purchase_cost: 0, rental_cost: 0, care_instructions: '',
            alterations_needed: '', multiples: 1, image_url: '', notes: '',
            is_hero: false, is_continuity_critical: false, storage_location: ''
        });
    };

    // Stats
    const stats = {
        total: items.length,
        hero: items.filter(i => i.is_hero).length,
        needed: items.filter(i => i.status === 'needed' || i.status === 'sourcing').length,
        total_cost: items.reduce((sum, i) => sum + (i.purchase_cost || i.rental_cost || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shirt className="text-yellow-500" />
                        Wardrobe Database
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage costumes and wardrobe items
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Item
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Hero Costumes</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.hero}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Still Needed</p>
                    <p className="text-2xl font-bold text-red-400">{stats.needed}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-green-400">${stats.total_cost.toLocaleString()}</p>
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
                        placeholder="Search wardrobe..."
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
                {characters.length > 0 && (
                    <select
                        value={filterCharacter}
                        onChange={(e) => setFilterCharacter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    >
                        <option value="all">All Characters</option>
                        {characters.map(char => (
                            <option key={char} value={char}>{char}</option>
                        ))}
                    </select>
                )}
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
                            No wardrobe items found
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const categoryConfig = CATEGORIES[item.category];
                            const statusConfig = STATUS_CONFIG[item.status];

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
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">
                                                {categoryConfig.icon}
                                            </div>
                                        )}
                                        {item.is_hero && (
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-yellow-500 text-black rounded text-xs font-bold">
                                                    HERO
                                                </span>
                                            </div>
                                        )}
                                        {item.is_continuity_critical && (
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">
                                                    CONTINUITY
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        {item.multiples > 1 && (
                                            <div className="absolute bottom-2 right-2">
                                                <span className="px-2 py-1 bg-black/50 text-white rounded text-xs">
                                                    x{item.multiples}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-1.5 py-0.5 rounded text-xs ${categoryConfig.color}`}>
                                                {categoryConfig.label}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold truncate">{item.name}</h3>
                                        {item.character_name && (
                                            <p className="text-sm text-yellow-500 flex items-center gap-1">
                                                <User size={12} />
                                                {item.character_name}
                                            </p>
                                        )}

                                        {/* Details */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.color && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                    <Palette size={10} />
                                                    {item.color}
                                                </span>
                                            )}
                                            {item.size && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                    <Ruler size={10} />
                                                    {item.size}
                                                </span>
                                            )}
                                        </div>

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
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
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
                            <h3 className="text-lg font-bold text-white">Add Wardrobe Item</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Item Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g., Blue Silk Dress"
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Character</label>
                                    <input
                                        type="text"
                                        value={form.character_name}
                                        onChange={(e) => setForm({ ...form, character_name: e.target.value })}
                                        placeholder="Character name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Size</label>
                                    <input
                                        type="text"
                                        value={form.size}
                                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                                        placeholder="e.g., M, 10, 32x30"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Color</label>
                                    <input
                                        type="text"
                                        value={form.color}
                                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={form.brand}
                                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Era/Period</label>
                                    <input
                                        type="text"
                                        value={form.era}
                                        onChange={(e) => setForm({ ...form, era: e.target.value })}
                                        placeholder="e.g., 1920s"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Source</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="purchased">Purchased</option>
                                        <option value="rented">Rented</option>
                                        <option value="made">Made/Custom</option>
                                        <option value="borrowed">Borrowed</option>
                                        <option value="owned">Already Owned</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Condition</label>
                                    <select
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="new">New</option>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="distressed">Distressed (intentional)</option>
                                    </select>
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
                                    <span className="text-sm text-gray-400">Hero Costume</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_continuity_critical}
                                        onChange={(e) => setForm({ ...form, is_continuity_critical: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Continuity Critical</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addItem}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
