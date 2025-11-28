'use client';

import React, { useState, useEffect } from 'react';
import {
    Wand2, Plus, Filter, Search, Clock, AlertTriangle,
    Check, X, Loader2, ExternalLink, Upload, Eye, Edit,
    ChevronDown, Building, DollarSign, Calendar, User
} from 'lucide-react';

interface VFXShot {
    id: string;
    shot_id: string;
    shot_number: string;
    scene_number: string;
    description: string;
    vfx_description: string;
    complexity: 'simple' | 'medium' | 'complex' | 'hero';
    status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'approved' | 'final';
    vendor?: VFXVendor;
    assigned_artist?: string;
    frame_count: number;
    start_frame: number;
    end_frame: number;
    due_date?: string;
    delivery_date?: string;
    cost_estimate?: number;
    final_cost?: number;
    notes?: string;
    versions: VFXVersion[];
    elements: string[];
    reference_images?: string[];
    thumbnail?: string;
}

interface VFXVendor {
    id: string;
    name: string;
    contact_email?: string;
    contact_name?: string;
}

interface VFXVersion {
    id: string;
    version_number: number;
    status: 'submitted' | 'review' | 'approved' | 'rejected';
    url?: string;
    thumbnail?: string;
    notes?: string;
    submitted_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
}

interface VFXTrackingProps {
    projectId: string;
}

const COMPLEXITY_CONFIG = {
    simple: { label: 'Simple', color: 'bg-green-500/10 text-green-400', cost: '$' },
    medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-400', cost: '$$' },
    complex: { label: 'Complex', color: 'bg-orange-500/10 text-orange-400', cost: '$$$' },
    hero: { label: 'Hero', color: 'bg-red-500/10 text-red-400', cost: '$$$$' }
};

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-gray-500/10 text-gray-400' },
    assigned: { label: 'Assigned', color: 'bg-blue-500/10 text-blue-400' },
    in_progress: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-400' },
    review: { label: 'Review', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' },
    final: { label: 'Final', color: 'bg-emerald-500/10 text-emerald-400' }
};

export default function VFXTracking({ projectId }: VFXTrackingProps) {
    const [shots, setShots] = useState<VFXShot[]>([]);
    const [vendors, setVendors] = useState<VFXVendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShot, setSelectedShot] = useState<VFXShot | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterComplexity, setFilterComplexity] = useState<string>('all');
    const [filterVendor, setFilterVendor] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [form, setForm] = useState({
        shot_number: '',
        scene_number: '',
        vfx_description: '',
        complexity: 'medium' as VFXShot['complexity'],
        frame_count: 0,
        elements: [] as string[],
        notes: ''
    });

    // Fetch VFX shots
    useEffect(() => {
        const fetchVFX = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/vfx`);
                if (res.ok) {
                    const data = await res.json();
                    setShots(data.shots || []);
                    setVendors(data.vendors || []);
                }
            } catch (error) {
                console.error('Error fetching VFX:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVFX();
    }, [projectId]);

    // Filter shots
    const filteredShots = shots.filter(shot => {
        if (filterStatus !== 'all' && shot.status !== filterStatus) return false;
        if (filterComplexity !== 'all' && shot.complexity !== filterComplexity) return false;
        if (filterVendor !== 'all' && shot.vendor?.id !== filterVendor) return false;
        if (searchQuery && !shot.shot_number.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !shot.vfx_description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Calculate stats
    const stats = {
        total: shots.length,
        pending: shots.filter(s => s.status === 'pending' || s.status === 'assigned').length,
        in_progress: shots.filter(s => s.status === 'in_progress' || s.status === 'review').length,
        completed: shots.filter(s => s.status === 'approved' || s.status === 'final').length,
        total_frames: shots.reduce((sum, s) => sum + s.frame_count, 0),
        estimated_cost: shots.reduce((sum, s) => sum + (s.cost_estimate || 0), 0),
        overdue: shots.filter(s => s.due_date && new Date(s.due_date) < new Date() && s.status !== 'final').length
    };

    // Update shot status
    const updateStatus = async (shotId: string, status: VFXShot['status']) => {
        setShots(prev => prev.map(s => s.id === shotId ? { ...s, status } : s));

        try {
            await fetch(`/api/projects/${projectId}/vfx/${shotId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Add VFX shot
    const addShot = async () => {
        const newShot: VFXShot = {
            id: crypto.randomUUID(),
            shot_id: '',
            shot_number: form.shot_number,
            scene_number: form.scene_number,
            description: '',
            vfx_description: form.vfx_description,
            complexity: form.complexity,
            status: 'pending',
            frame_count: form.frame_count,
            start_frame: 0,
            end_frame: form.frame_count,
            notes: form.notes,
            versions: [],
            elements: form.elements
        };

        setShots(prev => [...prev, newShot]);
        setShowAddModal(false);
        setForm({ shot_number: '', scene_number: '', vfx_description: '', complexity: 'medium', frame_count: 0, elements: [], notes: '' });

        try {
            await fetch(`/api/projects/${projectId}/vfx`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShot)
            });
        } catch (error) {
            console.error('Error adding shot:', error);
        }
    };

    // Check if overdue
    const isOverdue = (shot: VFXShot) => {
        return shot.due_date && new Date(shot.due_date) < new Date() && shot.status !== 'final';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Wand2 className="text-yellow-500" />
                        VFX Shot Tracking
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track visual effects shots and vendor progress
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add VFX Shot
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-6 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Shots</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.in_progress}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Frames</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.total_frames.toLocaleString()}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Est. Cost</p>
                    <p className="text-2xl font-bold text-yellow-400">${stats.estimated_cost.toLocaleString()}</p>
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
                        placeholder="Search shots..."
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
                <select
                    value={filterComplexity}
                    onChange={(e) => setFilterComplexity(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Complexity</option>
                    {Object.entries(COMPLEXITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <select
                    value={filterVendor}
                    onChange={(e) => setFilterVendor(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Vendors</option>
                    {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                </select>
            </div>

            {/* VFX Shots List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Shot</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">VFX Description</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Complexity</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Frames</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Vendor</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Due Date</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShots.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        No VFX shots found
                                    </td>
                                </tr>
                            ) : (
                                filteredShots.map((shot) => {
                                    const complexityConfig = COMPLEXITY_CONFIG[shot.complexity];
                                    const statusConfig = STATUS_CONFIG[shot.status];
                                    const overdue = isOverdue(shot);

                                    return (
                                        <tr key={shot.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {shot.thumbnail ? (
                                                        <img src={shot.thumbnail} alt="" className="w-16 h-10 object-cover rounded" />
                                                    ) : (
                                                        <div className="w-16 h-10 bg-white/5 rounded flex items-center justify-center">
                                                            <Wand2 className="text-gray-600" size={16} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium">{shot.shot_number}</p>
                                                        <p className="text-xs text-gray-500">Scene {shot.scene_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-400 max-w-[200px] truncate">{shot.vfx_description}</p>
                                                {shot.elements.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {shot.elements.slice(0, 2).map((el, i) => (
                                                            <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-xs text-gray-500">{el}</span>
                                                        ))}
                                                        {shot.elements.length > 2 && (
                                                            <span className="text-xs text-gray-600">+{shot.elements.length - 2}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${complexityConfig.color}`}>
                                                    {complexityConfig.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-white">{shot.frame_count}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-400">{shot.vendor?.name || 'Unassigned'}</span>
                                            </td>
                                            <td className="p-4">
                                                {shot.due_date ? (
                                                    <div className={`flex items-center gap-2 ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                                                        {overdue && <AlertTriangle size={14} />}
                                                        <span className="text-sm">
                                                            {new Date(shot.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={shot.status}
                                                    onChange={(e) => updateStatus(shot.id, e.target.value as any)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig.color} bg-transparent`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => setSelectedShot(shot)}
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
                            <h3 className="text-lg font-bold text-white">Add VFX Shot</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Shot Number</label>
                                    <input
                                        type="text"
                                        value={form.shot_number}
                                        onChange={(e) => setForm({ ...form, shot_number: e.target.value })}
                                        placeholder="e.g., 1A"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Scene Number</label>
                                    <input
                                        type="text"
                                        value={form.scene_number}
                                        onChange={(e) => setForm({ ...form, scene_number: e.target.value })}
                                        placeholder="e.g., 12"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">VFX Description</label>
                                <textarea
                                    value={form.vfx_description}
                                    onChange={(e) => setForm({ ...form, vfx_description: e.target.value })}
                                    placeholder="Describe the VFX work needed..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Complexity</label>
                                    <select
                                        value={form.complexity}
                                        onChange={(e) => setForm({ ...form, complexity: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(COMPLEXITY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label} {config.cost}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Frame Count</label>
                                    <input
                                        type="number"
                                        value={form.frame_count}
                                        onChange={(e) => setForm({ ...form, frame_count: parseInt(e.target.value) })}
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
                                onClick={addShot}
                                disabled={!form.shot_number || !form.vfx_description}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Shot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
