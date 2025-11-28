'use client';

import React, { useState, useEffect } from 'react';
import {
    HardDrive, Plus, Search, Filter, Check, AlertTriangle,
    X, Loader2, Download, Upload, Eye, Copy, RefreshCw,
    Database, Folder, Clock, Shield, CheckCircle
} from 'lucide-react';

interface MediaCard {
    id: string;
    card_name: string;
    card_type: 'cfast' | 'ssd' | 'sdxc' | 'cfexpress' | 'p2' | 'sxs' | 'other';
    capacity_gb: number;
    camera?: string;
    day_number: number;
    roll_number: string;
    shoot_date: string;
    format?: string;
    codec?: string;
    clips_count: number;
    duration_minutes: number;
    file_size_gb: number;
    status: 'shooting' | 'ingested' | 'backed_up' | 'verified' | 'offloaded' | 'formatted';
    primary_backup?: BackupInfo;
    secondary_backup?: BackupInfo;
    lto_archive?: string;
    checksum?: string;
    checksum_verified: boolean;
    notes?: string;
    ingested_by?: string;
    ingested_at?: string;
}

interface BackupInfo {
    location: string;
    path: string;
    completed_at: string;
    verified: boolean;
    size_gb: number;
}

interface MediaManagementProps {
    projectId: string;
}

const CARD_TYPES = {
    cfast: { label: 'CFast', color: 'bg-blue-500/10 text-blue-400' },
    ssd: { label: 'SSD', color: 'bg-purple-500/10 text-purple-400' },
    sdxc: { label: 'SDXC', color: 'bg-green-500/10 text-green-400' },
    cfexpress: { label: 'CFexpress', color: 'bg-orange-500/10 text-orange-400' },
    p2: { label: 'P2', color: 'bg-red-500/10 text-red-400' },
    sxs: { label: 'SxS', color: 'bg-cyan-500/10 text-cyan-400' },
    other: { label: 'Other', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    shooting: { label: 'Shooting', color: 'bg-red-500/10 text-red-400', icon: '🔴' },
    ingested: { label: 'Ingested', color: 'bg-blue-500/10 text-blue-400', icon: '📥' },
    backed_up: { label: 'Backed Up', color: 'bg-yellow-500/10 text-yellow-400', icon: '💾' },
    verified: { label: 'Verified', color: 'bg-green-500/10 text-green-400', icon: '✅' },
    offloaded: { label: 'Offloaded', color: 'bg-purple-500/10 text-purple-400', icon: '📤' },
    formatted: { label: 'Formatted', color: 'bg-gray-500/10 text-gray-400', icon: '🔄' }
};

export default function MediaManagement({ projectId }: MediaManagementProps) {
    const [cards, setCards] = useState<MediaCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDay, setFilterDay] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState<MediaCard | null>(null);

    // Form state
    const [form, setForm] = useState({
        card_name: '',
        card_type: 'cfexpress' as MediaCard['card_type'],
        capacity_gb: 256,
        camera: '',
        day_number: 1,
        roll_number: '',
        shoot_date: new Date().toISOString().split('T')[0],
        format: '',
        codec: '',
        notes: ''
    });

    // Fetch cards
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/media`);
                if (res.ok) {
                    setCards(await res.json());
                }
            } catch (error) {
                console.error('Error fetching media:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, [projectId]);

    // Filter cards
    const filteredCards = cards.filter(card => {
        if (filterStatus !== 'all' && card.status !== filterStatus) return false;
        if (filterDay !== 'all' && card.day_number !== parseInt(filterDay)) return false;
        if (searchQuery && !card.card_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !card.roll_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Get unique days
    const shootDays = [...new Set(cards.map(c => c.day_number))].sort((a, b) => a - b);

    // Stats
    const stats = {
        total_cards: cards.length,
        total_clips: cards.reduce((sum, c) => sum + c.clips_count, 0),
        total_data: cards.reduce((sum, c) => sum + c.file_size_gb, 0),
        total_duration: cards.reduce((sum, c) => sum + c.duration_minutes, 0),
        needs_backup: cards.filter(c => c.status === 'ingested' && !c.primary_backup).length,
        not_verified: cards.filter(c => !c.checksum_verified && c.status !== 'shooting' && c.status !== 'formatted').length
    };

    // Add card
    const addCard = async () => {
        const newCard: MediaCard = {
            id: crypto.randomUUID(),
            ...form,
            clips_count: 0,
            duration_minutes: 0,
            file_size_gb: 0,
            status: 'shooting',
            checksum_verified: false
        };

        setCards(prev => [...prev, newCard]);
        setShowAddModal(false);
        setForm({
            card_name: '', card_type: 'cfexpress', capacity_gb: 256, camera: '',
            day_number: 1, roll_number: '', shoot_date: new Date().toISOString().split('T')[0],
            format: '', codec: '', notes: ''
        });

        try {
            await fetch(`/api/projects/${projectId}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCard)
            });
        } catch (error) {
            console.error('Error adding card:', error);
        }
    };

    // Update status
    const updateStatus = async (cardId: string, status: MediaCard['status']) => {
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, status } : c));

        try {
            await fetch(`/api/projects/${projectId}/media/${cardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Verify checksum
    const verifyChecksum = async (cardId: string) => {
        // Simulate verification
        setCards(prev => prev.map(c =>
            c.id === cardId ? { ...c, checksum_verified: true, status: 'verified' } : c
        ));

        try {
            await fetch(`/api/projects/${projectId}/media/${cardId}/verify`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error verifying:', error);
        }
    };

    // Format duration
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Get backup status
    const getBackupStatus = (card: MediaCard) => {
        const hasBackups = (card.primary_backup ? 1 : 0) + (card.secondary_backup ? 1 : 0);
        const verified = (card.primary_backup?.verified ? 1 : 0) + (card.secondary_backup?.verified ? 1 : 0);
        return { hasBackups, verified };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <HardDrive className="text-yellow-500" />
                        Media Management
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track media cards, backups, and data integrity
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Card
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-6 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Cards</p>
                    <p className="text-2xl font-bold text-white">{stats.total_cards}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Clips</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.total_clips}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Data</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.total_data.toFixed(1)} GB</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Duration</p>
                    <p className="text-2xl font-bold text-green-400">{formatDuration(stats.total_duration)}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Needs Backup</p>
                    <p className={`text-2xl font-bold ${stats.needs_backup > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {stats.needs_backup}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Not Verified</p>
                    <p className={`text-2xl font-bold ${stats.not_verified > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {stats.not_verified}
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {(stats.needs_backup > 0 || stats.not_verified > 0) && (
                <div className="space-y-2">
                    {stats.needs_backup > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                            <AlertTriangle className="text-red-500" size={20} />
                            <p className="text-red-400">{stats.needs_backup} card(s) need backup</p>
                        </div>
                    )}
                    {stats.not_verified > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
                            <Shield className="text-yellow-500" size={20} />
                            <p className="text-yellow-400">{stats.not_verified} card(s) pending checksum verification</p>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search cards..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Days</option>
                    {shootDays.map(day => (
                        <option key={day} value={day}>Day {day}</option>
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

            {/* Cards List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Card / Roll</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Day</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Camera</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Clips</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Size</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Backups</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Verified</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCards.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-gray-500">
                                        No media cards found
                                    </td>
                                </tr>
                            ) : (
                                filteredCards.map((card) => {
                                    const typeConfig = CARD_TYPES[card.card_type];
                                    const statusConfig = STATUS_CONFIG[card.status];
                                    const backupStatus = getBackupStatus(card);

                                    return (
                                        <tr key={card.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                                                        <HardDrive size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{card.card_name}</p>
                                                        <p className="text-xs text-gray-500">Roll {card.roll_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-sm">
                                                    Day {card.day_number}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-400">{card.camera || '-'}</span>
                                            </td>
                                            <td className="p-4 text-center text-white">{card.clips_count}</td>
                                            <td className="p-4 text-center text-white">{card.file_size_gb.toFixed(1)} GB</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {[0, 1].map(i => (
                                                        <div
                                                            key={i}
                                                            className={`w-4 h-4 rounded ${
                                                                i < backupStatus.hasBackups
                                                                    ? i < backupStatus.verified
                                                                        ? 'bg-green-500'
                                                                        : 'bg-yellow-500'
                                                                    : 'bg-white/10'
                                                            }`}
                                                            title={
                                                                i < backupStatus.hasBackups
                                                                    ? i < backupStatus.verified
                                                                        ? 'Verified'
                                                                        : 'Not verified'
                                                                    : 'No backup'
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {card.checksum_verified ? (
                                                    <CheckCircle className="mx-auto text-green-400" size={18} />
                                                ) : card.status !== 'shooting' && card.status !== 'formatted' ? (
                                                    <button
                                                        onClick={() => verifyChecksum(card.id)}
                                                        className="mx-auto text-yellow-500 hover:text-yellow-400"
                                                        title="Verify checksum"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <select
                                                    value={card.status}
                                                    onChange={(e) => updateStatus(card.id, e.target.value as any)}
                                                    className={`px-3 py-1 rounded-lg text-sm ${statusConfig.color} bg-transparent`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.icon} {config.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedCard(card)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                                >
                                                    <Eye size={16} />
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

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add Media Card</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Card Name</label>
                                    <input
                                        type="text"
                                        value={form.card_name}
                                        onChange={(e) => setForm({ ...form, card_name: e.target.value })}
                                        placeholder="e.g., A001"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Card Type</label>
                                    <select
                                        value={form.card_type}
                                        onChange={(e) => setForm({ ...form, card_type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(CARD_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Day #</label>
                                    <input
                                        type="number"
                                        value={form.day_number}
                                        onChange={(e) => setForm({ ...form, day_number: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Roll #</label>
                                    <input
                                        type="text"
                                        value={form.roll_number}
                                        onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                                        placeholder="R001"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Capacity (GB)</label>
                                    <input
                                        type="number"
                                        value={form.capacity_gb}
                                        onChange={(e) => setForm({ ...form, capacity_gb: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Camera</label>
                                    <input
                                        type="text"
                                        value={form.camera}
                                        onChange={(e) => setForm({ ...form, camera: e.target.value })}
                                        placeholder="e.g., A Cam, B Cam"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Shoot Date</label>
                                    <input
                                        type="date"
                                        value={form.shoot_date}
                                        onChange={(e) => setForm({ ...form, shoot_date: e.target.value })}
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
                                onClick={addCard}
                                disabled={!form.card_name || !form.roll_number}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
