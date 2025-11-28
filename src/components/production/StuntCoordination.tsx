'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap, Plus, Search, Trash2, Eye, X, Loader2, AlertTriangle,
    User, Clock, FileText, Shield, Check, Camera
} from 'lucide-react';

interface StuntSequence {
    id: string;
    name: string;
    description: string;
    type: 'fight' | 'fall' | 'fire' | 'vehicle' | 'wire' | 'water' | 'explosion' | 'weapon' | 'other';
    risk_level: 'low' | 'medium' | 'high' | 'extreme';
    scene_id?: string;
    shot_ids?: string[];
    
    // Personnel
    stunt_coordinator?: string;
    stunt_performers: StuntPerformer[];
    safety_supervisor?: string;
    medic_required: boolean;
    fire_safety_required: boolean;
    
    // Planning
    rehearsal_needed: boolean;
    rehearsal_date?: string;
    rehearsal_notes?: string;
    pre_viz_url?: string;
    
    // Equipment
    equipment_needed: string[];
    rigging_notes?: string;
    padding_required?: string[];
    
    // Safety
    safety_briefing_completed: boolean;
    safety_briefing_date?: string;
    safety_meeting_notes?: string;
    emergency_procedures?: string;
    hospital_location?: string;
    
    // Insurance/Permits
    insurance_notified: boolean;
    permits_required?: string[];
    permits_obtained: boolean;
    
    // Status
    status: 'planning' | 'rehearsing' | 'approved' | 'ready' | 'completed' | 'cancelled';
    notes?: string;
    created_at: string;
}

interface StuntPerformer {
    id: string;
    name: string;
    role: string;
    doubling_for?: string;
    rate?: number;
    is_sag: boolean;
}

interface StuntCoordinationProps {
    projectId: string;
    sceneId?: string;
}

const STUNT_TYPES = {
    fight: { label: 'Fight/Combat', icon: '🥊', color: 'bg-red-500/10 text-red-400' },
    fall: { label: 'Falls/High Fall', icon: '🪂', color: 'bg-orange-500/10 text-orange-400' },
    fire: { label: 'Fire/Burns', icon: '🔥', color: 'bg-yellow-500/10 text-yellow-400' },
    vehicle: { label: 'Vehicle', icon: '🚗', color: 'bg-blue-500/10 text-blue-400' },
    wire: { label: 'Wire Work', icon: '🎪', color: 'bg-purple-500/10 text-purple-400' },
    water: { label: 'Water/Underwater', icon: '🌊', color: 'bg-cyan-500/10 text-cyan-400' },
    explosion: { label: 'Explosions/Pyro', icon: '💥', color: 'bg-red-500/10 text-red-400' },
    weapon: { label: 'Weapons', icon: '⚔️', color: 'bg-gray-500/10 text-gray-400' },
    other: { label: 'Other', icon: '🎬', color: 'bg-gray-500/10 text-gray-400' }
};

const RISK_LEVELS = {
    low: { label: 'Low Risk', color: 'bg-green-500/10 text-green-400' },
    medium: { label: 'Medium Risk', color: 'bg-yellow-500/10 text-yellow-400' },
    high: { label: 'High Risk', color: 'bg-orange-500/10 text-orange-400' },
    extreme: { label: 'Extreme Risk', color: 'bg-red-500/10 text-red-400' }
};

const STATUS_CONFIG = {
    planning: { label: 'Planning', color: 'bg-gray-500/10 text-gray-400' },
    rehearsing: { label: 'Rehearsing', color: 'bg-blue-500/10 text-blue-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' },
    ready: { label: 'Ready', color: 'bg-yellow-500/10 text-yellow-400' },
    completed: { label: 'Completed', color: 'bg-purple-500/10 text-purple-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400' }
};

export default function StuntCoordination({ projectId, sceneId }: StuntCoordinationProps) {
    const [sequences, setSequences] = useState<StuntSequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSequence, setSelectedSequence] = useState<StuntSequence | null>(null);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'fight' as StuntSequence['type'],
        risk_level: 'medium' as StuntSequence['risk_level'],
        stunt_coordinator: '',
        safety_supervisor: '',
        medic_required: true,
        fire_safety_required: false,
        rehearsal_needed: true,
        equipment_needed: '',
        emergency_procedures: '',
        notes: ''
    });

    // Fetch sequences
    useEffect(() => {
        const fetchSequences = async () => {
            try {
                let url = `/api/projects/${projectId}/stunts`;
                if (sceneId) url += `?scene=${sceneId}`;
                const res = await fetch(url);
                if (res.ok) {
                    setSequences(await res.json());
                }
            } catch (error) {
                console.error('Error fetching stunts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSequences();
    }, [projectId, sceneId]);

    // Add sequence
    const addSequence = async () => {
        const newSequence: StuntSequence = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            type: form.type,
            risk_level: form.risk_level,
            scene_id: sceneId,
            stunt_coordinator: form.stunt_coordinator,
            stunt_performers: [],
            safety_supervisor: form.safety_supervisor,
            medic_required: form.medic_required,
            fire_safety_required: form.fire_safety_required,
            rehearsal_needed: form.rehearsal_needed,
            equipment_needed: form.equipment_needed.split(',').map(e => e.trim()).filter(Boolean),
            safety_briefing_completed: false,
            insurance_notified: false,
            permits_obtained: false,
            emergency_procedures: form.emergency_procedures,
            notes: form.notes,
            status: 'planning',
            created_at: new Date().toISOString()
        };

        setSequences(prev => [...prev, newSequence]);
        setShowAddModal(false);
        resetForm();

        try {
            await fetch(`/api/projects/${projectId}/stunts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSequence)
            });
        } catch (error) {
            console.error('Error adding stunt:', error);
        }
    };

    // Update status
    const updateStatus = async (seqId: string, status: StuntSequence['status']) => {
        setSequences(prev => prev.map(s => s.id === seqId ? { ...s, status } : s));

        try {
            await fetch(`/api/projects/${projectId}/stunts/${seqId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    // Toggle safety checklist item
    const toggleSafetyItem = async (seqId: string, field: string) => {
        setSequences(prev => prev.map(s => {
            if (s.id === seqId) {
                return { ...s, [field]: !s[field as keyof StuntSequence] };
            }
            return s;
        }));
    };

    // Delete sequence
    const deleteSequence = async (seqId: string) => {
        if (!confirm('Delete this stunt sequence?')) return;

        setSequences(prev => prev.filter(s => s.id !== seqId));

        try {
            await fetch(`/api/projects/${projectId}/stunts/${seqId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            name: '', description: '', type: 'fight', risk_level: 'medium',
            stunt_coordinator: '', safety_supervisor: '', medic_required: true,
            fire_safety_required: false, rehearsal_needed: true,
            equipment_needed: '', emergency_procedures: '', notes: ''
        });
    };

    // Stats
    const stats = {
        total: sequences.length,
        highRisk: sequences.filter(s => s.risk_level === 'high' || s.risk_level === 'extreme').length,
        ready: sequences.filter(s => s.status === 'ready' || s.status === 'approved').length,
        needsBriefing: sequences.filter(s => !s.safety_briefing_completed && s.status !== 'completed').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Zap className="text-yellow-500" />
                        Stunt Coordination
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Plan and manage stunt sequences
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Stunt
                </button>
            </div>

            {/* Safety Warning */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="text-red-400 font-medium">Safety First</p>
                    <p className="text-sm text-red-400/70">
                        All stunts require proper safety protocols, trained coordinators, and appropriate insurance coverage.
                        Never perform stunts without proper safety briefings and equipment checks.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Sequences</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">High/Extreme Risk</p>
                    <p className="text-2xl font-bold text-red-400">{stats.highRisk}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Ready to Shoot</p>
                    <p className="text-2xl font-bold text-green-400">{stats.ready}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Needs Safety Briefing</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.needsBriefing}</p>
                </div>
            </div>

            {/* Sequences List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="space-y-4">
                    {sequences.length === 0 ? (
                        <div className="bg-[#121212] border border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No stunt sequences planned
                        </div>
                    ) : (
                        sequences.map((seq) => {
                            const typeConfig = STUNT_TYPES[seq.type];
                            const riskConfig = RISK_LEVELS[seq.risk_level];
                            const statusConfig = STATUS_CONFIG[seq.status];

                            return (
                                <div
                                    key={seq.id}
                                    className={`bg-[#121212] border rounded-xl overflow-hidden ${
                                        seq.risk_level === 'extreme' ? 'border-red-500/30' :
                                        seq.risk_level === 'high' ? 'border-orange-500/30' :
                                        'border-white/5'
                                    }`}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="text-3xl">{typeConfig.icon}</div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-white font-bold text-lg">{seq.name}</h3>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${typeConfig.color}`}>
                                                            {typeConfig.label}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${riskConfig.color}`}>
                                                            {riskConfig.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">{seq.description}</p>
                                                    
                                                    {/* Coordinator */}
                                                    {seq.stunt_coordinator && (
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                                                            <User size={14} />
                                                            Coordinator: {seq.stunt_coordinator}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={seq.status}
                                                    onChange={(e) => updateStatus(seq.id, e.target.value as any)}
                                                    className={`text-xs rounded px-2 py-1 ${statusConfig.color} bg-transparent border-none`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => setSelectedSequence(seq)}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteSequence(seq.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Safety Checklist */}
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <p className="text-sm text-gray-500 mb-2">Safety Checklist</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => toggleSafetyItem(seq.id, 'safety_briefing_completed')}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                                        seq.safety_briefing_completed
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-white/5 text-gray-500'
                                                    }`}
                                                >
                                                    <Check size={12} />
                                                    Safety Briefing
                                                </button>
                                                <button
                                                    onClick={() => toggleSafetyItem(seq.id, 'insurance_notified')}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                                        seq.insurance_notified
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-white/5 text-gray-500'
                                                    }`}
                                                >
                                                    <Check size={12} />
                                                    Insurance Notified
                                                </button>
                                                {seq.medic_required && (
                                                    <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">
                                                        Medic Required
                                                    </span>
                                                )}
                                                {seq.fire_safety_required && (
                                                    <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs">
                                                        Fire Safety Required
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
                            <h3 className="text-lg font-bold text-white">Add Stunt Sequence</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Sequence Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., Rooftop Chase Fight"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(STUNT_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.icon} {config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
                                    <select
                                        value={form.risk_level}
                                        onChange={(e) => setForm({ ...form, risk_level: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(RISK_LEVELS).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe the stunt sequence..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Stunt Coordinator</label>
                                    <input
                                        type="text"
                                        value={form.stunt_coordinator}
                                        onChange={(e) => setForm({ ...form, stunt_coordinator: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Safety Supervisor</label>
                                    <input
                                        type="text"
                                        value={form.safety_supervisor}
                                        onChange={(e) => setForm({ ...form, safety_supervisor: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Equipment Needed (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.equipment_needed}
                                    onChange={(e) => setForm({ ...form, equipment_needed: e.target.value })}
                                    placeholder="e.g., Crash pads, Wire rig, Breakaway glass"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.medic_required}
                                        onChange={(e) => setForm({ ...form, medic_required: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-red-400">Medic Required</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.fire_safety_required}
                                        onChange={(e) => setForm({ ...form, fire_safety_required: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-orange-400">Fire Safety Required</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.rehearsal_needed}
                                        onChange={(e) => setForm({ ...form, rehearsal_needed: e.target.checked })}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray-400">Rehearsal Needed</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#121212]">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={addSequence}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Stunt Sequence
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
