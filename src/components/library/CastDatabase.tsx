'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Edit, Trash2, Eye, X,
    Loader2, Upload, Star, Phone, Mail, Calendar, MapPin,
    User, Film, Clock, Check, Camera
} from 'lucide-react';

interface CastMember {
    id: string;
    name: string;
    character_name?: string;
    role_type: 'lead' | 'supporting' | 'day_player' | 'background' | 'stunt';
    gender?: string;
    age_range?: string;
    ethnicity?: string;
    height?: string;
    hair_color?: string;
    eye_color?: string;
    agency?: string;
    agent_name?: string;
    agent_phone?: string;
    agent_email?: string;
    personal_phone?: string;
    personal_email?: string;
    headshot_url?: string;
    reference_images: string[];
    notes?: string;
    rate_type?: 'sag' | 'non_sag' | 'tbd';
    daily_rate?: number;
    scenes?: string[];
    availability?: string;
    special_skills?: string[];
    status: 'available' | 'booked' | 'hold' | 'wrapped';
    created_at: string;
}

interface CastDatabaseProps {
    projectId?: string;
    onSelect?: (cast: CastMember) => void;
    selectionMode?: boolean;
}

const ROLE_TYPES = {
    lead: { label: 'Lead', color: 'bg-yellow-500/10 text-yellow-400' },
    supporting: { label: 'Supporting', color: 'bg-blue-500/10 text-blue-400' },
    day_player: { label: 'Day Player', color: 'bg-green-500/10 text-green-400' },
    background: { label: 'Background', color: 'bg-gray-500/10 text-gray-400' },
    stunt: { label: 'Stunt', color: 'bg-red-500/10 text-red-400' }
};

const STATUS_CONFIG = {
    available: { label: 'Available', color: 'bg-green-500/10 text-green-400' },
    booked: { label: 'Booked', color: 'bg-blue-500/10 text-blue-400' },
    hold: { label: 'On Hold', color: 'bg-yellow-500/10 text-yellow-400' },
    wrapped: { label: 'Wrapped', color: 'bg-purple-500/10 text-purple-400' }
};

export default function CastDatabase({ projectId, onSelect, selectionMode }: CastDatabaseProps) {
    const [cast, setCast] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<CastMember | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form state
    const [form, setForm] = useState({
        name: '',
        character_name: '',
        role_type: 'supporting' as CastMember['role_type'],
        gender: '',
        age_range: '',
        ethnicity: '',
        height: '',
        hair_color: '',
        eye_color: '',
        agency: '',
        agent_name: '',
        agent_phone: '',
        agent_email: '',
        personal_phone: '',
        personal_email: '',
        headshot_url: '',
        notes: '',
        rate_type: 'tbd' as CastMember['rate_type'],
        daily_rate: 0,
        special_skills: ''
    });

    // Fetch cast
    useEffect(() => {
        const fetchCast = async () => {
            try {
                const url = projectId 
                    ? `/api/projects/${projectId}/cast`
                    : '/api/library/cast';
                const res = await fetch(url);
                if (res.ok) {
                    setCast(await res.json());
                }
            } catch (error) {
                console.error('Error fetching cast:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCast();
    }, [projectId]);

    // Filter cast
    const filteredCast = cast.filter(member => {
        if (filterRole !== 'all' && member.role_type !== filterRole) return false;
        if (filterStatus !== 'all' && member.status !== filterStatus) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return member.name.toLowerCase().includes(query) ||
                member.character_name?.toLowerCase().includes(query) ||
                member.agency?.toLowerCase().includes(query);
        }
        return true;
    });

    // Add cast member
    const addCastMember = async () => {
        const newMember: CastMember = {
            id: crypto.randomUUID(),
            name: form.name,
            character_name: form.character_name,
            role_type: form.role_type,
            gender: form.gender,
            age_range: form.age_range,
            ethnicity: form.ethnicity,
            height: form.height,
            hair_color: form.hair_color,
            eye_color: form.eye_color,
            agency: form.agency,
            agent_name: form.agent_name,
            agent_phone: form.agent_phone,
            agent_email: form.agent_email,
            personal_phone: form.personal_phone,
            personal_email: form.personal_email,
            headshot_url: form.headshot_url,
            reference_images: [],
            notes: form.notes,
            rate_type: form.rate_type,
            daily_rate: form.daily_rate,
            special_skills: form.special_skills.split(',').map(s => s.trim()).filter(Boolean),
            status: 'available',
            created_at: new Date().toISOString()
        };

        setCast(prev => [...prev, newMember]);
        setShowAddModal(false);
        resetForm();

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/cast`
                : '/api/library/cast';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
        } catch (error) {
            console.error('Error adding cast member:', error);
        }
    };

    // Delete cast member
    const deleteMember = async (memberId: string) => {
        if (!confirm('Delete this cast member?')) return;

        setCast(prev => prev.filter(m => m.id !== memberId));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/cast/${memberId}`
                : `/api/library/cast/${memberId}`;
            await fetch(url, { method: 'DELETE' });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Update status
    const updateStatus = async (memberId: string, status: CastMember['status']) => {
        setCast(prev => prev.map(m => m.id === memberId ? { ...m, status } : m));

        try {
            const url = projectId 
                ? `/api/projects/${projectId}/cast/${memberId}`
                : `/api/library/cast/${memberId}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', character_name: '', role_type: 'supporting', gender: '',
            age_range: '', ethnicity: '', height: '', hair_color: '', eye_color: '',
            agency: '', agent_name: '', agent_phone: '', agent_email: '',
            personal_phone: '', personal_email: '', headshot_url: '', notes: '',
            rate_type: 'tbd', daily_rate: 0, special_skills: ''
        });
    };

    // Stats
    const stats = {
        total: cast.length,
        leads: cast.filter(c => c.role_type === 'lead').length,
        supporting: cast.filter(c => c.role_type === 'supporting').length,
        booked: cast.filter(c => c.status === 'booked').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-yellow-500" />
                        Cast Database
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage actors and talent
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Cast
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Cast</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Lead Roles</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.leads}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Supporting</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.supporting}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Booked</p>
                    <p className="text-2xl font-bold text-green-400">{stats.booked}</p>
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
                        placeholder="Search cast..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Roles</option>
                    {Object.entries(ROLE_TYPES).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
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

            {/* Cast Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredCast.length === 0 ? (
                        <div className="col-span-4 bg-[#121212] border border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No cast members found
                        </div>
                    ) : (
                        filteredCast.map((member) => {
                            const roleConfig = ROLE_TYPES[member.role_type];
                            const statusConfig = STATUS_CONFIG[member.status];

                            return (
                                <div
                                    key={member.id}
                                    className={`bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-colors ${
                                        selectionMode ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() => selectionMode && onSelect?.(member)}
                                >
                                    {/* Headshot */}
                                    <div className="aspect-[3/4] bg-white/5 relative">
                                        {member.headshot_url ? (
                                            <img
                                                src={member.headshot_url}
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="text-gray-600" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded text-xs ${roleConfig.color}`}>
                                                {roleConfig.label}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-white font-bold truncate">{member.name}</h3>
                                        {member.character_name && (
                                            <p className="text-sm text-yellow-500">as {member.character_name}</p>
                                        )}
                                        {member.agency && (
                                            <p className="text-xs text-gray-500 mt-1">{member.agency}</p>
                                        )}

                                        {/* Quick Info */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {member.age_range && (
                                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                    {member.age_range}
                                                </span>
                                            )}
                                            {member.gender && (
                                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-400">
                                                    {member.gender}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!selectionMode && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <select
                                                    value={member.status}
                                                    onChange={(e) => updateStatus(member.id, e.target.value as any)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs bg-transparent border-none text-gray-400"
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteMember(member.id); }}
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
                            <h3 className="text-lg font-bold text-white">Add Cast Member</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Actor Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Character Name</label>
                                    <input
                                        type="text"
                                        value={form.character_name}
                                        onChange={(e) => setForm({ ...form, character_name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Role Type</label>
                                    <select
                                        value={form.role_type}
                                        onChange={(e) => setForm({ ...form, role_type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(ROLE_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Gender</label>
                                    <input
                                        type="text"
                                        value={form.gender}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                        placeholder="e.g., Male, Female"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Age Range</label>
                                    <input
                                        type="text"
                                        value={form.age_range}
                                        onChange={(e) => setForm({ ...form, age_range: e.target.value })}
                                        placeholder="e.g., 25-35"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            {/* Physical */}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Ethnicity</label>
                                    <input
                                        type="text"
                                        value={form.ethnicity}
                                        onChange={(e) => setForm({ ...form, ethnicity: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Height</label>
                                    <input
                                        type="text"
                                        value={form.height}
                                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                                        placeholder="e.g., 5'10"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Hair Color</label>
                                    <input
                                        type="text"
                                        value={form.hair_color}
                                        onChange={(e) => setForm({ ...form, hair_color: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Eye Color</label>
                                    <input
                                        type="text"
                                        value={form.eye_color}
                                        onChange={(e) => setForm({ ...form, eye_color: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            {/* Agency */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Agency</label>
                                    <input
                                        type="text"
                                        value={form.agency}
                                        onChange={(e) => setForm({ ...form, agency: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Agent Name</label>
                                    <input
                                        type="text"
                                        value={form.agent_name}
                                        onChange={(e) => setForm({ ...form, agent_name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            {/* Headshot */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Headshot URL</label>
                                <input
                                    type="text"
                                    value={form.headshot_url}
                                    onChange={(e) => setForm({ ...form, headshot_url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            {/* Special Skills */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Special Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.special_skills}
                                    onChange={(e) => setForm({ ...form, special_skills: e.target.value })}
                                    placeholder="e.g., Martial Arts, Horse Riding, Accents"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addCastMember}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Cast Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">{selectedMember.name}</h3>
                            <button onClick={() => setSelectedMember(null)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-6">
                                {/* Headshot */}
                                <div className="w-48 flex-shrink-0">
                                    <div className="aspect-[3/4] bg-white/5 rounded-xl overflow-hidden">
                                        {selectedMember.headshot_url ? (
                                            <img src={selectedMember.headshot_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="text-gray-600" size={48} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-4">
                                    {selectedMember.character_name && (
                                        <div>
                                            <p className="text-sm text-gray-500">Character</p>
                                            <p className="text-yellow-400 font-medium">{selectedMember.character_name}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Role Type</p>
                                            <p className="text-white">{ROLE_TYPES[selectedMember.role_type].label}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p className="text-white">{STATUS_CONFIG[selectedMember.status].label}</p>
                                        </div>
                                    </div>

                                    {selectedMember.agency && (
                                        <div>
                                            <p className="text-sm text-gray-500">Agency</p>
                                            <p className="text-white">{selectedMember.agency}</p>
                                            {selectedMember.agent_name && (
                                                <p className="text-sm text-gray-400">{selectedMember.agent_name}</p>
                                            )}
                                        </div>
                                    )}

                                    {selectedMember.special_skills && selectedMember.special_skills.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Special Skills</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedMember.special_skills.map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
