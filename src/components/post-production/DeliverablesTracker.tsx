'use client';

import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Check, Clock, AlertTriangle, Download,
    Upload, Loader2, X, Eye, Send, FileText, Film, Music,
    Image, HardDrive, ChevronDown, ExternalLink
} from 'lucide-react';

interface Deliverable {
    id: string;
    name: string;
    type: 'master' | 'promo' | 'trailer' | 'bts' | 'stills' | 'audio' | 'other';
    format: string;
    resolution?: string;
    duration?: number;
    file_size?: number;
    status: 'pending' | 'in_progress' | 'review' | 'approved' | 'delivered';
    due_date?: string;
    delivered_date?: string;
    recipient?: string;
    url?: string;
    notes?: string;
    specs?: DeliverableSpec[];
    versions: DeliverableVersion[];
}

interface DeliverableSpec {
    name: string;
    value: string;
    required: boolean;
    met: boolean;
}

interface DeliverableVersion {
    id: string;
    version_number: number;
    url: string;
    uploaded_by: string;
    uploaded_at: string;
    notes?: string;
}

interface DeliverablesTrackerProps {
    projectId: string;
}

const TYPE_CONFIG = {
    master: { label: 'Master', icon: Film, color: 'text-purple-400 bg-purple-500/10' },
    promo: { label: 'Promo', icon: Film, color: 'text-blue-400 bg-blue-500/10' },
    trailer: { label: 'Trailer', icon: Film, color: 'text-red-400 bg-red-500/10' },
    bts: { label: 'BTS', icon: Film, color: 'text-orange-400 bg-orange-500/10' },
    stills: { label: 'Stills', icon: Image, color: 'text-green-400 bg-green-500/10' },
    audio: { label: 'Audio', icon: Music, color: 'text-pink-400 bg-pink-500/10' },
    other: { label: 'Other', icon: FileText, color: 'text-gray-400 bg-gray-500/10' }
};

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-gray-500/10 text-gray-400' },
    in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400' },
    review: { label: 'Review', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' },
    delivered: { label: 'Delivered', color: 'bg-purple-500/10 text-purple-400' }
};

export default function DeliverablesTracker({ projectId }: DeliverablesTrackerProps) {
    const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Form state
    const [form, setForm] = useState({
        name: '',
        type: 'master' as Deliverable['type'],
        format: '',
        resolution: '',
        due_date: '',
        recipient: '',
        notes: ''
    });

    // Fetch deliverables
    useEffect(() => {
        const fetchDeliverables = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/deliverables`);
                if (res.ok) {
                    setDeliverables(await res.json());
                }
            } catch (error) {
                console.error('Error fetching deliverables:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliverables();
    }, [projectId]);

    // Add deliverable
    const addDeliverable = async () => {
        const newDeliverable: Deliverable = {
            id: crypto.randomUUID(),
            name: form.name,
            type: form.type,
            format: form.format,
            resolution: form.resolution,
            due_date: form.due_date,
            recipient: form.recipient,
            notes: form.notes,
            status: 'pending',
            versions: []
        };

        setDeliverables(prev => [...prev, newDeliverable]);
        setShowAddModal(false);
        setForm({ name: '', type: 'master', format: '', resolution: '', due_date: '', recipient: '', notes: '' });

        try {
            await fetch(`/api/projects/${projectId}/deliverables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDeliverable)
            });
        } catch (error) {
            console.error('Error adding deliverable:', error);
        }
    };

    // Update status
    const updateStatus = async (deliverableId: string, status: Deliverable['status']) => {
        const updates: any = { status };
        if (status === 'delivered') {
            updates.delivered_date = new Date().toISOString();
        }

        setDeliverables(prev => prev.map(d =>
            d.id === deliverableId ? { ...d, ...updates } : d
        ));

        try {
            await fetch(`/api/projects/${projectId}/deliverables/${deliverableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Filter deliverables
    const filteredDeliverables = deliverables.filter(d => {
        if (filterType !== 'all' && d.type !== filterType) return false;
        if (filterStatus !== 'all' && d.status !== filterStatus) return false;
        return true;
    });

    // Calculate stats
    const stats = {
        total: deliverables.length,
        pending: deliverables.filter(d => d.status === 'pending').length,
        in_progress: deliverables.filter(d => d.status === 'in_progress' || d.status === 'review').length,
        delivered: deliverables.filter(d => d.status === 'delivered').length,
        overdue: deliverables.filter(d => d.due_date && new Date(d.due_date) < new Date() && d.status !== 'delivered').length
    };

    // Format file size
    const formatSize = (bytes?: number) => {
        if (!bytes) return '-';
        const gb = bytes / (1024 * 1024 * 1024);
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    // Check if overdue
    const isOverdue = (deliverable: Deliverable) => {
        return deliverable.due_date &&
            new Date(deliverable.due_date) < new Date() &&
            deliverable.status !== 'delivered';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Package className="text-yellow-500" />
                        Deliverables Tracker
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track and manage final deliverables
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Deliverable
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-400">{stats.pending}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.in_progress}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-green-400">{stats.delivered}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                </select>
            </div>

            {/* Deliverables List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Deliverable</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Format</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Due Date</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-500">Recipient</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeliverables.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No deliverables found
                                    </td>
                                </tr>
                            ) : (
                                filteredDeliverables.map((deliverable) => {
                                    const typeConfig = TYPE_CONFIG[deliverable.type];
                                    const Icon = typeConfig.icon;
                                    const statusConfig = STATUS_CONFIG[deliverable.status];
                                    const overdue = isOverdue(deliverable);

                                    return (
                                        <tr key={deliverable.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{deliverable.name}</p>
                                                        <p className="text-xs text-gray-500">{typeConfig.label}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-400">{deliverable.format}</p>
                                                {deliverable.resolution && (
                                                    <p className="text-xs text-gray-600">{deliverable.resolution}</p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {deliverable.due_date ? (
                                                    <div className={`flex items-center gap-2 ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
                                                        {overdue && <AlertTriangle size={14} />}
                                                        <span className="text-sm">
                                                            {new Date(deliverable.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-400">{deliverable.recipient || '-'}</span>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={deliverable.status}
                                                    onChange={(e) => updateStatus(deliverable.id, e.target.value as any)}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig.color} bg-transparent`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {deliverable.url && (
                                                        <a
                                                            href={deliverable.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedDeliverable(deliverable)}
                                                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
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
                            <h3 className="text-lg font-bold text-white">Add Deliverable</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g., Final Master 4K"
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
                                        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Format</label>
                                    <input
                                        type="text"
                                        value={form.format}
                                        onChange={(e) => setForm({ ...form, format: e.target.value })}
                                        placeholder="e.g., ProRes 4444"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Resolution</label>
                                    <input
                                        type="text"
                                        value={form.resolution}
                                        onChange={(e) => setForm({ ...form, resolution: e.target.value })}
                                        placeholder="e.g., 4096x2160"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={form.due_date}
                                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Recipient</label>
                                <input
                                    type="text"
                                    value={form.recipient}
                                    onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                                    placeholder="e.g., Netflix, Client Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Specs, requirements..."
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addDeliverable}
                                disabled={!form.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Deliverable
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
