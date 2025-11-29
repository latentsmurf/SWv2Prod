'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield, Plus, Search, Filter, Trash2, Eye, X,
    Loader2, AlertTriangle, User, FileText, Clock, DollarSign
} from 'lucide-react';

interface Weapon {
    id: string;
    name: string;
    description?: string;
    type: 'firearm' | 'blade' | 'blunt' | 'explosive' | 'replica' | 'rubber' | 'cgi_placeholder' | 'other';
    category: 'hero' | 'background' | 'stunt';
    make?: string;
    model?: string;
    caliber?: string;
    era?: string;
    is_functional: boolean;
    is_rubber: boolean;
    is_replica: boolean;
    requires_armorer: boolean;
    requires_permit: boolean;
    armorer_name?: string;
    armorer_phone?: string;
    armorer_license?: string;
    vendor?: string;
    vendor_contact?: string;
    daily_rate?: number;
    insurance_value?: number;
    image_url?: string;
    reference_images: string[];
    scenes?: string[];
    characters?: string[];
    safety_notes?: string[];
    storage_requirements?: string;
    notes?: string;
    serial_number?: string;
    permit_number?: string;
    status: 'needed' | 'sourcing' | 'acquired' | 'on_set' | 'wrapped' | 'returned';
    created_at: string;
}

interface WeaponsDatabaseProps {
    projectId?: string;
    onSelect?: (weapon: Weapon) => void;
    selectionMode?: boolean;
}

const WEAPON_TYPES = {
    firearm: { label: 'Firearm', icon: '🔫', color: 'bg-red-500/10 text-red-400' },
    blade: { label: 'Blade', icon: '🗡️', color: 'bg-blue-500/10 text-blue-400' },
    blunt: { label: 'Blunt', icon: '🏏', color: 'bg-orange-500/10 text-orange-400' },
    explosive: { label: 'Explosive', icon: '💣', color: 'bg-yellow-500/10 text-yellow-400' },
    replica: { label: 'Replica', icon: '🎭', color: 'bg-purple-500/10 text-purple-400' },
    rubber: { label: 'Rubber/Foam', icon: '🧸', color: 'bg-green-500/10 text-green-400' },
    cgi_placeholder: { label: 'CGI Placeholder', icon: '✨', color: 'bg-cyan-500/10 text-cyan-400' },
    other: { label: 'Other', icon: '⚔️', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    needed: { label: 'Needed', color: 'bg-red-500/10 text-red-400' },
    sourcing: { label: 'Sourcing', color: 'bg-yellow-500/10 text-yellow-400' },
    acquired: { label: 'Acquired', color: 'bg-blue-500/10 text-blue-400' },
    on_set: { label: 'On Set', color: 'bg-green-500/10 text-green-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' },
    returned: { label: 'Returned', color: 'bg-gray-500/10 text-gray-400' }
};

export default function WeaponsDatabase({ projectId, onSelect, selectionMode }: WeaponsDatabaseProps) {
    const [weapons, setWeapons] = useState<Weapon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'replica' as Weapon['type'],
        category: 'hero' as Weapon['category'],
        make: '',
        model: '',
        caliber: '',
        era: '',
        is_functional: false,
        is_rubber: false,
        is_replica: true,
        requires_armorer: false,
        requires_permit: false,
        armorer_name: '',
        armorer_phone: '',
        vendor: '',
        daily_rate: 0,
        insurance_value: 0,
        image_url: '',
        safety_notes: '',
        storage_requirements: '',
        notes: ''
    });

    // Fetch weapons
    useEffect(() => {
        const fetchWeapons = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/weapons`
                    : '/api/library/weapons';
                const res = await fetch(url);
                if (res.ok) {
                    setWeapons(await res.json());
                }
            } catch (error) {
                console.error('Error fetching weapons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeapons();
    }, [projectId]);

    // Filter weapons
    const filteredWeapons = weapons.filter(weapon => {
        if (filterType !== 'all' && weapon.type !== filterType) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return weapon.name.toLowerCase().includes(query) ||
                weapon.make?.toLowerCase().includes(query) ||
                weapon.model?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add weapon
    const addWeapon = async () => {
        const newWeapon: Weapon = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            type: form.type,
            category: form.category,
            make: form.make,
            model: form.model,
            caliber: form.caliber,
            era: form.era,
            is_functional: form.is_functional,
            is_rubber: form.is_rubber,
            is_replica: form.is_replica,
            requires_armorer: form.requires_armorer,
            requires_permit: form.requires_permit,
            armorer_name: form.armorer_name,
            armorer_phone: form.armorer_phone,
            vendor: form.vendor,
            daily_rate: form.daily_rate,
            insurance_value: form.insurance_value,
            image_url: form.image_url,
            reference_images: [],
            scenes: [],
            characters: [],
            safety_notes: form.safety_notes.split(',').map(n => n.trim()).filter(Boolean),
            storage_requirements: form.storage_requirements,
            notes: form.notes,
            status: 'needed',
            created_at: new Date().toISOString()
        };

        setWeapons(prev => [...prev, newWeapon]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/weapons`
                : '/api/library/weapons';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWeapon)
            });
        } catch (error) {
            console.error('Error adding weapon:', error);
        }
    };

    // Update status
    const updateStatus = async (weaponId: string, status: Weapon['status']) => {
        setWeapons(prev => prev.map(w => w.id === weaponId ? { ...w, status } : w));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/weapons/${weaponId}`
                : `/api/library/weapons/${weaponId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Delete weapon
    const deleteWeapon = async (weaponId: string) => {
        if (!confirm('Delete this weapon?')) return;

        setWeapons(prev => prev.filter(w => w.id !== weaponId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/weapons/${weaponId}`
                : `/api/library/weapons/${weaponId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', type: 'replica', category: 'hero',
            make: '', model: '', caliber: '', era: '',
            is_functional: false, is_rubber: false, is_replica: true,
            requires_armorer: false, requires_permit: false,
            armorer_name: '', armorer_phone: '', vendor: '',
            daily_rate: 0, insurance_value: 0, image_url: '',
            safety_notes: '', storage_requirements: '', notes: ''
        });
    };

    // Stats
    const stats = {
        total: weapons.length,
        functional: weapons.filter(w => w.is_functional).length,
        require_armorer: weapons.filter(w => w.requires_armorer).length,
        rubber_safe: weapons.filter(w => w.is_rubber).length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Shield className="text-yellow-500" />
                        Weapons & Special Props
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage weapons, replicas, and special props
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Weapon
                </button>
            </div>

            {/* Safety Notice */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                <div>
                    <p className="text-sm text-red-400 font-medium">Safety First</p>
                    <p className="text-xs text-red-400/70">
                        All functional firearms require a licensed armorer on set. Follow all local regulations
                        and obtain necessary permits. Always use rubber/foam alternatives when possible.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Functional</p>
                    <p className="text-2xl font-bold text-red-400">{stats.functional}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Need Armorer</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.require_armorer}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Rubber/Safe</p>
                    <p className="text-2xl font-bold text-green-400">{stats.rubber_safe}</p>
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
                        placeholder="Search weapons..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-gray-900 dark:text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(WEAPON_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                </select>
            </div>

            {/* Weapons Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredWeapons.length === 0 ? (
                        <div className="col-span-4 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No weapons found
                        </div>
                    ) : (
                        filteredWeapons.map((weapon) => {
                            const typeConfig = WEAPON_TYPES[weapon.type];
                            const statusConfig = STATUS_CONFIG[weapon.status];

                            return (
                                <div
                                    key={weapon.id}
                                    className={`bg-[#121212] border rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        weapon.is_functional ? 'border-red-500/30' : 'border-white/5'
                                    } ${selectionMode ? 'cursor-pointer' : ''}`}
                                    onClick={() => selectionMode && onSelect?.(weapon)}
                                >
                                    {/* Image */}
                                    <div className="aspect-video bg-white/5 relative">
                                        {weapon.image_url ? (
                                            <img
                                                src={weapon.image_url}
                                                alt={weapon.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                {typeConfig.icon}
                                            </div>
                                        )}
                                        {weapon.is_functional && (
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">
                                                    FUNCTIONAL
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        {weapon.is_rubber && (
                                            <div className="absolute bottom-2 right-2">
                                                <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                                                    SAFE
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold">{weapon.name}</h3>
                                        {(weapon.make || weapon.model) && (
                                            <p className="text-sm text-gray-400">
                                                {[weapon.make, weapon.model].filter(Boolean).join(' ')}
                                            </p>
                                        )}

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {weapon.requires_armorer && (
                                                <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs">
                                                    Armorer Required
                                                </span>
                                            )}
                                            {weapon.requires_permit && (
                                                <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                                                    Permit Required
                                                </span>
                                            )}
                                            {weapon.is_replica && (
                                                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs">
                                                    Replica
                                                </span>
                                            )}
                                        </div>

                                        {/* Armorer */}
                                        {weapon.armorer_name && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                                <User size={12} />
                                                {weapon.armorer_name}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={weapon.status}
                                                    onChange={(e) => updateStatus(weapon.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedWeapon(weapon); }}
                                                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteWeapon(weapon.id); }}
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
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#121212]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Weapon/Special Prop</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g., John's Pistol"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    >
                                        {Object.entries(WEAPON_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.icon} {config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Make</label>
                                    <input
                                        type="text"
                                        value={form.make}
                                        onChange={(e) => setForm({ ...form, make: e.target.value })}
                                        placeholder="e.g., Colt"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Model</label>
                                    <input
                                        type="text"
                                        value={form.model}
                                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                                        placeholder="e.g., 1911"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Era</label>
                                    <input
                                        type="text"
                                        value={form.era}
                                        onChange={(e) => setForm({ ...form, era: e.target.value })}
                                        placeholder="e.g., WWII, Modern"
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_functional}
                                            onChange={(e) => setForm({ ...form, is_functional: e.target.checked, requires_armorer: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-red-400">Functional Weapon</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_replica}
                                            onChange={(e) => setForm({ ...form, is_replica: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-gray-400">Replica/Non-firing</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.is_rubber}
                                            onChange={(e) => setForm({ ...form, is_rubber: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-green-400">Rubber/Foam (Safe)</span>
                                    </label>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.requires_armorer}
                                            onChange={(e) => setForm({ ...form, requires_armorer: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-orange-400">Requires Armorer</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.requires_permit}
                                            onChange={(e) => setForm({ ...form, requires_permit: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-yellow-400">Requires Permit</span>
                                    </label>
                                </div>
                            </div>

                            {form.requires_armorer && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-500/5 rounded-xl">
                                    <div>
                                        <label className="block text-sm text-orange-400 mb-2">Armorer Name</label>
                                        <input
                                            type="text"
                                            value={form.armorer_name}
                                            onChange={(e) => setForm({ ...form, armorer_name: e.target.value })}
                                            className="w-full bg-black/30 border border-orange-500/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-orange-400 mb-2">Armorer Phone</label>
                                        <input
                                            type="text"
                                            value={form.armorer_phone}
                                            onChange={(e) => setForm({ ...form, armorer_phone: e.target.value })}
                                            className="w-full bg-black/30 border border-orange-500/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Safety Notes (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.safety_notes}
                                    onChange={(e) => setForm({ ...form, safety_notes: e.target.value })}
                                    placeholder="e.g., Always check clear, No live ammo on set"
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addWeapon}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Weapon
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
