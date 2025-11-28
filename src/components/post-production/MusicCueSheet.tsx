'use client';

import React, { useState, useEffect } from 'react';
import {
    Music, Plus, Check, X, Loader2, Search, Clock,
    Download, AlertTriangle, DollarSign, FileText, Play,
    Pause, ExternalLink, Calendar, User
} from 'lucide-react';

interface MusicCue {
    id: string;
    cue_number: string;
    title: string;
    composer?: string;
    performer?: string;
    publisher?: string;
    scene_number: string;
    timecode_in: string;
    timecode_out: string;
    duration: number;
    usage_type: 'background' | 'featured' | 'source' | 'theme';
    license_type: 'sync' | 'master' | 'library' | 'original' | 'public_domain';
    license_status: 'pending' | 'requested' | 'negotiating' | 'cleared' | 'denied';
    license_fee?: number;
    license_territory?: string;
    license_term?: string;
    contact_name?: string;
    contact_email?: string;
    notes?: string;
    clearance_docs?: string[];
    pro_affiliation?: string; // ASCAP, BMI, SESAC
    iswc?: string;
    isrc?: string;
}

interface MusicCueSheetProps {
    projectId: string;
}

const USAGE_TYPES = {
    background: { label: 'Background', color: 'bg-blue-500/10 text-blue-400' },
    featured: { label: 'Featured', color: 'bg-purple-500/10 text-purple-400' },
    source: { label: 'Source', color: 'bg-green-500/10 text-green-400' },
    theme: { label: 'Theme', color: 'bg-yellow-500/10 text-yellow-400' }
};

const LICENSE_TYPES = {
    sync: { label: 'Sync License', description: 'Publishing rights' },
    master: { label: 'Master License', description: 'Recording rights' },
    library: { label: 'Library Music', description: 'Pre-cleared' },
    original: { label: 'Original Score', description: 'Composed for production' },
    public_domain: { label: 'Public Domain', description: 'No license required' }
};

const LICENSE_STATUS = {
    pending: { label: 'Pending', color: 'bg-gray-500/10 text-gray-400' },
    requested: { label: 'Requested', color: 'bg-blue-500/10 text-blue-400' },
    negotiating: { label: 'Negotiating', color: 'bg-yellow-500/10 text-yellow-400' },
    cleared: { label: 'Cleared', color: 'bg-green-500/10 text-green-400' },
    denied: { label: 'Denied', color: 'bg-red-500/10 text-red-400' }
};

export default function MusicCueSheet({ projectId }: MusicCueSheetProps) {
    const [cues, setCues] = useState<MusicCue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterUsage, setFilterUsage] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCue, setSelectedCue] = useState<MusicCue | null>(null);

    // Form state
    const [form, setForm] = useState({
        title: '',
        composer: '',
        performer: '',
        publisher: '',
        scene_number: '',
        timecode_in: '00:00:00:00',
        timecode_out: '00:00:00:00',
        duration: 0,
        usage_type: 'background' as MusicCue['usage_type'],
        license_type: 'sync' as MusicCue['license_type'],
        license_fee: 0,
        contact_name: '',
        contact_email: '',
        notes: ''
    });

    // Fetch cues
    useEffect(() => {
        const fetchCues = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/music-cues`);
                if (res.ok) {
                    setCues(await res.json());
                }
            } catch (error) {
                console.error('Error fetching music cues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCues();
    }, [projectId]);

    // Filter cues
    const filteredCues = cues.filter(cue => {
        if (filterStatus !== 'all' && cue.license_status !== filterStatus) return false;
        if (filterUsage !== 'all' && cue.usage_type !== filterUsage) return false;
        if (searchQuery && !cue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !cue.composer?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Stats
    const stats = {
        total: cues.length,
        cleared: cues.filter(c => c.license_status === 'cleared').length,
        pending: cues.filter(c => c.license_status !== 'cleared' && c.license_status !== 'denied').length,
        total_fees: cues.reduce((sum, c) => sum + (c.license_fee || 0), 0),
        total_duration: cues.reduce((sum, c) => sum + c.duration, 0)
    };

    // Add cue
    const addCue = async () => {
        const newCue: MusicCue = {
            id: crypto.randomUUID(),
            cue_number: `MUS-${String(cues.length + 1).padStart(3, '0')}`,
            ...form,
            license_status: 'pending'
        };

        setCues(prev => [...prev, newCue]);
        setShowAddModal(false);
        setForm({
            title: '', composer: '', performer: '', publisher: '', scene_number: '',
            timecode_in: '00:00:00:00', timecode_out: '00:00:00:00', duration: 0,
            usage_type: 'background', license_type: 'sync', license_fee: 0,
            contact_name: '', contact_email: '', notes: ''
        });

        try {
            await fetch(`/api/projects/${projectId}/music-cues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCue)
            });
        } catch (error) {
            console.error('Error adding cue:', error);
        }
    };

    // Update license status
    const updateStatus = async (cueId: string, status: MusicCue['license_status']) => {
        setCues(prev => prev.map(c => c.id === cueId ? { ...c, license_status: status } : c));

        try {
            await fetch(`/api/projects/${projectId}/music-cues/${cueId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ license_status: status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Export cue sheet
    const exportCueSheet = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/music-cues/export`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'music_cue_sheet.pdf';
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Music className="text-yellow-500" />
                        Music Cue Sheet
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track music usage and licensing
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCueSheet}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Cue
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Cues</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Cleared</p>
                    <p className="text-2xl font-bold text-green-400">{stats.cleared}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Duration</p>
                    <p className="text-2xl font-bold text-blue-400">{formatDuration(stats.total_duration)}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">License Fees</p>
                    <p className="text-2xl font-bold text-purple-400">${stats.total_fees.toLocaleString()}</p>
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
                        placeholder="Search by title or composer..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Status</option>
                    {Object.entries(LICENSE_STATUS).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <select
                    value={filterUsage}
                    onChange={(e) => setFilterUsage(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Usage</option>
                    {Object.entries(USAGE_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Cue List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Cue #</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Title / Composer</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Scene</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Timecode</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Usage</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">License</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-500">Fee</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCues.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        No music cues found
                                    </td>
                                </tr>
                            ) : (
                                filteredCues.map((cue) => (
                                    <tr key={cue.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 text-yellow-500 font-mono">{cue.cue_number}</td>
                                        <td className="p-4">
                                            <p className="text-white font-medium">{cue.title}</p>
                                            {cue.composer && (
                                                <p className="text-xs text-gray-500">{cue.composer}</p>
                                            )}
                                            {cue.performer && (
                                                <p className="text-xs text-gray-600">Performed by {cue.performer}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-400">{cue.scene_number}</td>
                                        <td className="p-4">
                                            <p className="text-gray-400 font-mono text-sm">{cue.timecode_in}</p>
                                            <p className="text-xs text-gray-600">{formatDuration(cue.duration)}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${USAGE_TYPES[cue.usage_type].color}`}>
                                                {USAGE_TYPES[cue.usage_type].label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-sm text-gray-400">{LICENSE_TYPES[cue.license_type].label}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {cue.license_fee ? (
                                                <span className="text-green-400">${cue.license_fee.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <select
                                                value={cue.license_status}
                                                onChange={(e) => updateStatus(cue.id, e.target.value as any)}
                                                className={`px-3 py-1 rounded text-sm ${LICENSE_STATUS[cue.license_status].color} bg-transparent`}
                                            >
                                                {Object.entries(LICENSE_STATUS).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Clearance Summary */}
            {stats.pending > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-yellow-500" size={20} />
                        <div>
                            <p className="text-yellow-400 font-medium">{stats.pending} cues pending clearance</p>
                            <p className="text-sm text-yellow-500/70">Ensure all music is cleared before final delivery</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]">
                            <h3 className="text-lg font-bold text-white">Add Music Cue</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Song or composition title"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Composer</label>
                                    <input
                                        type="text"
                                        value={form.composer}
                                        onChange={(e) => setForm({ ...form, composer: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Performer</label>
                                    <input
                                        type="text"
                                        value={form.performer}
                                        onChange={(e) => setForm({ ...form, performer: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Scene</label>
                                    <input
                                        type="text"
                                        value={form.scene_number}
                                        onChange={(e) => setForm({ ...form, scene_number: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">TC In</label>
                                    <input
                                        type="text"
                                        value={form.timecode_in}
                                        onChange={(e) => setForm({ ...form, timecode_in: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Duration (sec)</label>
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Usage Type</label>
                                    <select
                                        value={form.usage_type}
                                        onChange={(e) => setForm({ ...form, usage_type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(USAGE_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">License Type</label>
                                    <select
                                        value={form.license_type}
                                        onChange={(e) => setForm({ ...form, license_type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(LICENSE_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">License Fee ($)</label>
                                <input
                                    type="number"
                                    value={form.license_fee}
                                    onChange={(e) => setForm({ ...form, license_fee: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addCue}
                                disabled={!form.title}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Cue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
