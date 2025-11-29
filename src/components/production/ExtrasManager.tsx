'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Trash2, Eye, X,
    Loader2, DollarSign, Calendar, MapPin, Clock, User, Check
} from 'lucide-react';

interface Extra {
    id: string;
    name?: string;
    voucher_number?: string;
    type: 'general' | 'featured' | 'stand_in' | 'photo_double' | 'specialty';
    gender?: string;
    age_range?: string;
    ethnicity?: string;
    height?: string;
    wardrobe_type: 'provided' | 'personal' | 'costume';
    wardrobe_notes?: string;
    call_time?: string;
    wrap_time?: string;
    rate: number;
    bump?: number;
    scenes?: string[];
    location?: string;
    notes?: string;
    checked_in: boolean;
    checked_out: boolean;
    meal_in?: string;
    meal_out?: string;
    status: 'booked' | 'confirmed' | 'on_set' | 'wrapped' | 'cancelled';
    date: string;
    created_at: string;
}

interface ExtrasGroup {
    id: string;
    name: string;
    date: string;
    scene_id?: string;
    location?: string;
    call_time: string;
    extras: Extra[];
    total_count: number;
    notes?: string;
}

interface ExtrasManagerProps {
    projectId: string;
    date?: string;
}

const EXTRA_TYPES = {
    general: { label: 'General BG', color: 'bg-gray-500/10 text-gray-400' },
    featured: { label: 'Featured', color: 'bg-yellow-500/10 text-yellow-400' },
    stand_in: { label: 'Stand-In', color: 'bg-blue-500/10 text-blue-400' },
    photo_double: { label: 'Photo Double', color: 'bg-purple-500/10 text-purple-400' },
    specialty: { label: 'Specialty', color: 'bg-green-500/10 text-green-400' }
};

const STATUS_CONFIG = {
    booked: { label: 'Booked', color: 'bg-blue-500/10 text-blue-400' },
    confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-400' },
    on_set: { label: 'On Set', color: 'bg-yellow-500/10 text-yellow-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 line-through' }
};

export default function ExtrasManager({ projectId, date }: ExtrasManagerProps) {
    const [groups, setGroups] = useState<ExtrasGroup[]>([]);
    const [extras, setExtras] = useState<Extra[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state for individual extra
    const [form, setForm] = useState({
        name: '',
        voucher_number: '',
        type: 'general' as Extra['type'],
        gender: '',
        age_range: '',
        ethnicity: '',
        wardrobe_type: 'personal' as Extra['wardrobe_type'],
        wardrobe_notes: '',
        call_time: '07:00',
        rate: 150,
        bump: 0,
        location: '',
        notes: ''
    });

    // Bulk add form
    const [bulkForm, setBulkForm] = useState({
        count: 10,
        type: 'general' as Extra['type'],
        call_time: '07:00',
        rate: 150,
        location: '',
        wardrobe_type: 'personal' as Extra['wardrobe_type'],
        notes: ''
    });

    // Fetch extras
    useEffect(() => {
        const fetchExtras = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/extras?date=${selectedDate}`);
                if (res.ok) {
                    const data = await res.json();
                    setExtras(data.extras || []);
                    setGroups(data.groups || []);
                }
            } catch (error) {
                console.error('Error fetching extras:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExtras();
    }, [projectId, selectedDate]);

    // Filter extras
    const filteredExtras = extras.filter(extra => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return extra.name?.toLowerCase().includes(query) ||
                extra.voucher_number?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add single extra
    const addExtra = async () => {
        const newExtra: Extra = {
            id: crypto.randomUUID(),
            ...form,
            checked_in: false,
            checked_out: false,
            status: 'booked',
            date: selectedDate,
            created_at: new Date().toISOString()
        };

        setExtras(prev => [...prev, newExtra]);
        setShowAddModal(false);
        resetForm();

        try {
            await fetch(`/api/projects/${projectId}/extras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExtra)
            });
        } catch (error) {
            console.error('Error adding extra:', error);
        }
    };

    // Bulk add extras
    const bulkAddExtras = async () => {
        const newExtras: Extra[] = [];
        for (let i = 0; i < bulkForm.count; i++) {
            newExtras.push({
                id: crypto.randomUUID(),
                type: bulkForm.type,
                call_time: bulkForm.call_time,
                rate: bulkForm.rate,
                wardrobe_type: bulkForm.wardrobe_type,
                location: bulkForm.location,
                notes: bulkForm.notes,
                checked_in: false,
                checked_out: false,
                status: 'booked',
                date: selectedDate,
                created_at: new Date().toISOString()
            });
        }

        setExtras(prev => [...prev, ...newExtras]);
        setShowBulkModal(false);

        try {
            await fetch(`/api/projects/${projectId}/extras/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extras: newExtras })
            });
        } catch (error) {
            console.error('Error bulk adding extras:', error);
        }
    };

    // Check in/out
    const toggleCheckIn = async (extraId: string) => {
        setExtras(prev => prev.map(e => e.id === extraId ? { ...e, checked_in: !e.checked_in, status: !e.checked_in ? 'on_set' : 'confirmed' } : e));

        try {
            await fetch(`/api/projects/${projectId}/extras/${extraId}/check-in`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleCheckOut = async (extraId: string) => {
        setExtras(prev => prev.map(e => e.id === extraId ? { ...e, checked_out: !e.checked_out, status: !e.checked_out ? 'wrapped' : 'on_set' } : e));

        try {
            await fetch(`/api/projects/${projectId}/extras/${extraId}/check-out`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Delete extra
    const deleteExtra = async (extraId: string) => {
        if (!confirm('Remove this extra?')) return;

        setExtras(prev => prev.filter(e => e.id !== extraId));

        try {
            await fetch(`/api/projects/${projectId}/extras/${extraId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', voucher_number: '', type: 'general', gender: '',
            age_range: '', ethnicity: '', wardrobe_type: 'personal',
            wardrobe_notes: '', call_time: '07:00', rate: 150, bump: 0,
            location: '', notes: ''
        });
    };

    // Stats
    const stats = {
        total: extras.length,
        checkedIn: extras.filter(e => e.checked_in && !e.checked_out).length,
        wrapped: extras.filter(e => e.checked_out).length,
        totalCost: extras.reduce((sum, e) => sum + e.rate + (e.bump || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="text-yellow-500" />
                        Extras / Background
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage background talent for {selectedDate}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                    />
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                    >
                        <Plus size={18} />
                        Bulk Add
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Extra
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Booked</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Checked In</p>
                    <p className="text-2xl font-bold text-green-400">{stats.checkedIn}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Wrapped</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.wrapped}</p>
                </div>
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-yellow-400">${stats.totalCost.toLocaleString()}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or voucher..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                />
            </div>

            {/* Extras Table */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Check</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Voucher</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Name</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Type</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Call</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Rate</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Status</th>
                                <th className="text-left text-sm text-gray-500 font-medium p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExtras.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        No extras for this date
                                    </td>
                                </tr>
                            ) : (
                                filteredExtras.map((extra) => {
                                    const typeConfig = EXTRA_TYPES[extra.type];
                                    const statusConfig = STATUS_CONFIG[extra.status];

                                    return (
                                        <tr key={extra.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleCheckIn(extra.id)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                            extra.checked_in
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-white/5 text-gray-500 hover:text-white'
                                                        }`}
                                                        title="Check In"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCheckOut(extra.id)}
                                                        disabled={!extra.checked_in}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                            extra.checked_out
                                                                ? 'bg-purple-500 text-white'
                                                                : 'bg-white/5 text-gray-500 hover:text-white disabled:opacity-30'
                                                        }`}
                                                        title="Check Out"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-white font-mono text-sm">
                                                {extra.voucher_number || '-'}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-white">{extra.name || 'TBD'}</p>
                                                {extra.gender && (
                                                    <p className="text-xs text-gray-500">{extra.gender}, {extra.age_range}</p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
                                                    {typeConfig.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {extra.call_time || '-'}
                                            </td>
                                            <td className="p-4 text-green-400 text-sm">
                                                ${extra.rate}
                                                {extra.bump ? <span className="text-yellow-400"> +${extra.bump}</span> : null}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => deleteExtra(extra.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Single Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add Extra</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Voucher #</label>
                                    <input
                                        type="text"
                                        value={form.voucher_number}
                                        onChange={(e) => setForm({ ...form, voucher_number: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(EXTRA_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Call Time</label>
                                    <input
                                        type="time"
                                        value={form.call_time}
                                        onChange={(e) => setForm({ ...form, call_time: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Rate ($)</label>
                                    <input
                                        type="number"
                                        value={form.rate}
                                        onChange={(e) => setForm({ ...form, rate: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Bump ($)</label>
                                    <input
                                        type="number"
                                        value={form.bump}
                                        onChange={(e) => setForm({ ...form, bump: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addExtra}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                            >
                                Add Extra
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Add Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Bulk Add Extras</h3>
                            <button onClick={() => setShowBulkModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Number of Extras</label>
                                    <input
                                        type="number"
                                        value={bulkForm.count}
                                        onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value) })}
                                        min="1"
                                        max="100"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={bulkForm.type}
                                        onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(EXTRA_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Call Time</label>
                                    <input
                                        type="time"
                                        value={bulkForm.call_time}
                                        onChange={(e) => setBulkForm({ ...bulkForm, call_time: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Rate ($)</label>
                                    <input
                                        type="number"
                                        value={bulkForm.rate}
                                        onChange={(e) => setBulkForm({ ...bulkForm, rate: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-500/10 rounded-xl">
                                <p className="text-yellow-400 text-sm">
                                    This will add <strong>{bulkForm.count}</strong> {EXTRA_TYPES[bulkForm.type].label} extras 
                                    at <strong>${bulkForm.rate}</strong> each = <strong>${bulkForm.count * bulkForm.rate}</strong> total
                                </p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={bulkAddExtras}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                            >
                                Add {bulkForm.count} Extras
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
