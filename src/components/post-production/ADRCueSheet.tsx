'use client';

import React, { useState, useEffect } from 'react';
import {
    Mic, Plus, Check, X, Loader2, Search, Filter,
    Clock, User, Play, Download, Volume2, AlertCircle,
    ChevronDown, Edit, Trash2
} from 'lucide-react';

interface ADRCue {
    id: string;
    cue_number: string;
    scene_number: string;
    character: string;
    actor_name?: string;
    timecode_in: string;
    timecode_out: string;
    original_line: string;
    replacement_line?: string;
    reason: 'technical' | 'performance' | 'rewrite' | 'addition' | 'foreign';
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'scheduled' | 'recorded' | 'approved';
    notes?: string;
    takes?: number;
    selected_take?: number;
    session_date?: string;
    recorded_by?: string;
}

interface FoleyCue {
    id: string;
    cue_number: string;
    scene_number: string;
    timecode_in: string;
    timecode_out: string;
    description: string;
    category: 'footsteps' | 'cloth' | 'props' | 'body' | 'specifics';
    sync_level: 'hard' | 'soft' | 'wild';
    status: 'pending' | 'recorded' | 'approved';
    notes?: string;
    surface?: string;
    props_needed?: string[];
}

interface ADRCueSheetProps {
    projectId: string;
}

const ADR_REASONS = {
    technical: { label: 'Technical Issue', color: 'bg-red-500/10 text-red-400' },
    performance: { label: 'Performance', color: 'bg-purple-500/10 text-purple-400' },
    rewrite: { label: 'Rewrite', color: 'bg-blue-500/10 text-blue-400' },
    addition: { label: 'Addition', color: 'bg-green-500/10 text-green-400' },
    foreign: { label: 'Foreign Dub', color: 'bg-orange-500/10 text-orange-400' }
};

const FOLEY_CATEGORIES = {
    footsteps: { label: 'Footsteps', icon: '👣' },
    cloth: { label: 'Cloth/Movement', icon: '👔' },
    props: { label: 'Props', icon: '🎭' },
    body: { label: 'Body Falls', icon: '🤸' },
    specifics: { label: 'Specifics', icon: '✨' }
};

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-gray-500/10 text-gray-400' },
    scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-400' },
    recorded: { label: 'Recorded', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' }
};

export default function ADRCueSheet({ projectId }: ADRCueSheetProps) {
    const [activeTab, setActiveTab] = useState<'adr' | 'foley'>('adr');
    const [adrCues, setAdrCues] = useState<ADRCue[]>([]);
    const [foleyCues, setFoleyCues] = useState<FoleyCue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCharacter, setFilterCharacter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // ADR form state
    const [adrForm, setAdrForm] = useState({
        scene_number: '',
        character: '',
        timecode_in: '00:00:00:00',
        timecode_out: '00:00:00:00',
        original_line: '',
        replacement_line: '',
        reason: 'technical' as ADRCue['reason'],
        priority: 'medium' as ADRCue['priority'],
        notes: ''
    });

    // Foley form state
    const [foleyForm, setFoleyForm] = useState({
        scene_number: '',
        timecode_in: '00:00:00:00',
        timecode_out: '00:00:00:00',
        description: '',
        category: 'footsteps' as FoleyCue['category'],
        sync_level: 'hard' as FoleyCue['sync_level'],
        surface: '',
        notes: ''
    });

    // Fetch cues
    useEffect(() => {
        const fetchCues = async () => {
            try {
                const [adrRes, foleyRes] = await Promise.all([
                    fetch(`/api/projects/${projectId}/adr`),
                    fetch(`/api/projects/${projectId}/foley`)
                ]);

                if (adrRes.ok) setAdrCues(await adrRes.json());
                if (foleyRes.ok) setFoleyCues(await foleyRes.json());
            } catch (error) {
                console.error('Error fetching cues:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCues();
    }, [projectId]);

    // Get unique characters
    const characters = [...new Set(adrCues.map(c => c.character))];

    // Filter ADR cues
    const filteredAdrCues = adrCues.filter(cue => {
        if (filterStatus !== 'all' && cue.status !== filterStatus) return false;
        if (filterCharacter !== 'all' && cue.character !== filterCharacter) return false;
        if (searchQuery && !cue.original_line.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Filter Foley cues
    const filteredFoleyCues = foleyCues.filter(cue => {
        if (filterStatus !== 'all' && cue.status !== filterStatus) return false;
        if (searchQuery && !cue.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Add ADR cue
    const addAdrCue = async () => {
        const newCue: ADRCue = {
            id: crypto.randomUUID(),
            cue_number: `ADR-${String(adrCues.length + 1).padStart(3, '0')}`,
            ...adrForm,
            status: 'pending'
        };

        setAdrCues(prev => [...prev, newCue]);
        setShowAddModal(false);
        setAdrForm({
            scene_number: '', character: '', timecode_in: '00:00:00:00', timecode_out: '00:00:00:00',
            original_line: '', replacement_line: '', reason: 'technical', priority: 'medium', notes: ''
        });

        try {
            await fetch(`/api/projects/${projectId}/adr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCue)
            });
        } catch (error) {
            console.error('Error adding ADR cue:', error);
        }
    };

    // Add Foley cue
    const addFoleyCue = async () => {
        const newCue: FoleyCue = {
            id: crypto.randomUUID(),
            cue_number: `FOL-${String(foleyCues.length + 1).padStart(3, '0')}`,
            ...foleyForm,
            status: 'pending'
        };

        setFoleyCues(prev => [...prev, newCue]);
        setShowAddModal(false);
        setFoleyForm({
            scene_number: '', timecode_in: '00:00:00:00', timecode_out: '00:00:00:00',
            description: '', category: 'footsteps', sync_level: 'hard', surface: '', notes: ''
        });

        try {
            await fetch(`/api/projects/${projectId}/foley`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCue)
            });
        } catch (error) {
            console.error('Error adding Foley cue:', error);
        }
    };

    // Update status
    const updateAdrStatus = async (cueId: string, status: ADRCue['status']) => {
        setAdrCues(prev => prev.map(c => c.id === cueId ? { ...c, status } : c));
        try {
            await fetch(`/api/projects/${projectId}/adr/${cueId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const updateFoleyStatus = async (cueId: string, status: FoleyCue['status']) => {
        setFoleyCues(prev => prev.map(c => c.id === cueId ? { ...c, status } : c));
        try {
            await fetch(`/api/projects/${projectId}/foley/${cueId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Stats
    const adrStats = {
        total: adrCues.length,
        pending: adrCues.filter(c => c.status === 'pending').length,
        recorded: adrCues.filter(c => c.status === 'recorded' || c.status === 'approved').length
    };

    const foleyStats = {
        total: foleyCues.length,
        pending: foleyCues.filter(c => c.status === 'pending').length,
        recorded: foleyCues.filter(c => c.status === 'recorded' || c.status === 'approved').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Mic className="text-yellow-500" />
                        ADR & Foley Cue Sheet
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track dialogue replacement and sound effects
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white">
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

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 w-fit">
                <button
                    onClick={() => setActiveTab('adr')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'adr' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    ADR ({adrCues.length})
                </button>
                <button
                    onClick={() => setActiveTab('foley')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'foley' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Foley ({foleyCues.length})
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Cues</p>
                    <p className="text-2xl font-bold text-white">
                        {activeTab === 'adr' ? adrStats.total : foleyStats.total}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                        {activeTab === 'adr' ? adrStats.pending : foleyStats.pending}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Recorded</p>
                    <p className="text-2xl font-bold text-green-400">
                        {activeTab === 'adr' ? adrStats.recorded : foleyStats.recorded}
                    </p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">{activeTab === 'adr' ? 'Characters' : 'Categories'}</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {activeTab === 'adr' ? characters.length : Object.keys(FOLEY_CATEGORIES).length}
                    </p>
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
                        placeholder={activeTab === 'adr' ? 'Search dialogue...' : 'Search effects...'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
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
                {activeTab === 'adr' && (
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

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : activeTab === 'adr' ? (
                // ADR List
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Cue #</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Scene</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Character</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Timecode</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Line</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Reason</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdrCues.map((cue) => (
                                <tr key={cue.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4 text-yellow-500 font-mono">{cue.cue_number}</td>
                                    <td className="p-4 text-gray-400">{cue.scene_number}</td>
                                    <td className="p-4 text-white font-medium">{cue.character}</td>
                                    <td className="p-4 text-gray-400 font-mono text-sm">{cue.timecode_in}</td>
                                    <td className="p-4">
                                        <p className="text-gray-400 max-w-[300px] truncate">{cue.original_line}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${ADR_REASONS[cue.reason].color}`}>
                                            {ADR_REASONS[cue.reason].label}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <select
                                            value={cue.status}
                                            onChange={(e) => updateAdrStatus(cue.id, e.target.value as any)}
                                            className={`px-3 py-1 rounded text-sm ${STATUS_CONFIG[cue.status].color} bg-transparent`}
                                        >
                                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Foley List
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Cue #</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Scene</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Timecode</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Description</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Category</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Sync</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFoleyCues.map((cue) => (
                                <tr key={cue.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4 text-yellow-500 font-mono">{cue.cue_number}</td>
                                    <td className="p-4 text-gray-400">{cue.scene_number}</td>
                                    <td className="p-4 text-gray-400 font-mono text-sm">{cue.timecode_in}</td>
                                    <td className="p-4">
                                        <p className="text-gray-400 max-w-[300px] truncate">{cue.description}</p>
                                        {cue.surface && <p className="text-xs text-gray-600">Surface: {cue.surface}</p>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-lg" title={FOLEY_CATEGORIES[cue.category].label}>
                                            {FOLEY_CATEGORIES[cue.category].icon}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            cue.sync_level === 'hard' ? 'bg-red-500/10 text-red-400' :
                                            cue.sync_level === 'soft' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                            {cue.sync_level}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <select
                                            value={cue.status}
                                            onChange={(e) => updateFoleyStatus(cue.id, e.target.value as any)}
                                            className={`px-3 py-1 rounded text-sm ${STATUS_CONFIG[cue.status].color} bg-transparent`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="recorded">Recorded</option>
                                            <option value="approved">Approved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                Add {activeTab === 'adr' ? 'ADR' : 'Foley'} Cue
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {activeTab === 'adr' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Scene</label>
                                            <input
                                                type="text"
                                                value={adrForm.scene_number}
                                                onChange={(e) => setAdrForm({ ...adrForm, scene_number: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Character</label>
                                            <input
                                                type="text"
                                                value={adrForm.character}
                                                onChange={(e) => setAdrForm({ ...adrForm, character: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">TC In</label>
                                            <input
                                                type="text"
                                                value={adrForm.timecode_in}
                                                onChange={(e) => setAdrForm({ ...adrForm, timecode_in: e.target.value })}
                                                placeholder="00:00:00:00"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">TC Out</label>
                                            <input
                                                type="text"
                                                value={adrForm.timecode_out}
                                                onChange={(e) => setAdrForm({ ...adrForm, timecode_out: e.target.value })}
                                                placeholder="00:00:00:00"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Original Line</label>
                                        <textarea
                                            value={adrForm.original_line}
                                            onChange={(e) => setAdrForm({ ...adrForm, original_line: e.target.value })}
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Reason</label>
                                            <select
                                                value={adrForm.reason}
                                                onChange={(e) => setAdrForm({ ...adrForm, reason: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            >
                                                {Object.entries(ADR_REASONS).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Priority</label>
                                            <select
                                                value={adrForm.priority}
                                                onChange={(e) => setAdrForm({ ...adrForm, priority: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            >
                                                <option value="high">High</option>
                                                <option value="medium">Medium</option>
                                                <option value="low">Low</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Scene</label>
                                            <input
                                                type="text"
                                                value={foleyForm.scene_number}
                                                onChange={(e) => setFoleyForm({ ...foleyForm, scene_number: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Category</label>
                                            <select
                                                value={foleyForm.category}
                                                onChange={(e) => setFoleyForm({ ...foleyForm, category: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            >
                                                {Object.entries(FOLEY_CATEGORIES).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.icon} {config.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Description</label>
                                        <textarea
                                            value={foleyForm.description}
                                            onChange={(e) => setFoleyForm({ ...foleyForm, description: e.target.value })}
                                            placeholder="Describe the foley effect..."
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Sync Level</label>
                                            <select
                                                value={foleyForm.sync_level}
                                                onChange={(e) => setFoleyForm({ ...foleyForm, sync_level: e.target.value as any })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            >
                                                <option value="hard">Hard Sync</option>
                                                <option value="soft">Soft Sync</option>
                                                <option value="wild">Wild</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Surface</label>
                                            <input
                                                type="text"
                                                value={foleyForm.surface}
                                                onChange={(e) => setFoleyForm({ ...foleyForm, surface: e.target.value })}
                                                placeholder="e.g., Concrete, Wood"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={activeTab === 'adr' ? addAdrCue : addFoleyCue}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
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
