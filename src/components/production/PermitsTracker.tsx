'use client';

import React, { useState, useEffect } from 'react';
import {
    FileCheck, Plus, Search, Filter, Calendar, AlertTriangle,
    Check, X, Loader2, Download, Upload, Eye, MapPin,
    Clock, DollarSign, Building, FileText, ExternalLink
} from 'lucide-react';

interface Permit {
    id: string;
    permit_type: 'filming' | 'parking' | 'street_closure' | 'pyro' | 'drone' | 'stunts' | 'noise' | 'other';
    location: string;
    address?: string;
    jurisdiction: string;
    issuing_authority: string;
    permit_number?: string;
    application_date?: string;
    issue_date?: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'submitted' | 'pending' | 'approved' | 'denied' | 'expired';
    fee?: number;
    fee_paid: boolean;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    requirements?: string[];
    restrictions?: string[];
    documents?: PermitDocument[];
    notes?: string;
    scenes?: string[];
}

interface PermitDocument {
    id: string;
    name: string;
    type: 'application' | 'approval' | 'insurance' | 'map' | 'other';
    url?: string;
    uploaded_at: string;
}

interface PermitsTrackerProps {
    projectId: string;
}

const PERMIT_TYPES = {
    filming: { label: 'Filming Permit', icon: '🎬', color: 'bg-blue-500/10 text-blue-400' },
    parking: { label: 'Parking Permit', icon: '🅿️', color: 'bg-green-500/10 text-green-400' },
    street_closure: { label: 'Street Closure', icon: '🚧', color: 'bg-orange-500/10 text-orange-400' },
    pyro: { label: 'Pyrotechnics', icon: '🔥', color: 'bg-red-500/10 text-red-400' },
    drone: { label: 'Drone/UAV', icon: '🚁', color: 'bg-purple-500/10 text-purple-400' },
    stunts: { label: 'Stunts', icon: '🤸', color: 'bg-yellow-500/10 text-yellow-400' },
    noise: { label: 'Noise Variance', icon: '🔊', color: 'bg-pink-500/10 text-pink-400' },
    other: { label: 'Other', icon: '📋', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-400' },
    submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-400' },
    pending: { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-400' },
    denied: { label: 'Denied', color: 'bg-red-500/10 text-red-400' },
    expired: { label: 'Expired', color: 'bg-gray-500/10 text-gray-400' }
};

export default function PermitsTracker({ projectId }: PermitsTrackerProps) {
    const [permits, setPermits] = useState<Permit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

    // Form state
    const [form, setForm] = useState({
        permit_type: 'filming' as Permit['permit_type'],
        location: '',
        address: '',
        jurisdiction: '',
        issuing_authority: '',
        start_date: '',
        end_date: '',
        fee: 0,
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        notes: ''
    });

    // Fetch permits
    useEffect(() => {
        const fetchPermits = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/permits`);
                if (res.ok) {
                    setPermits(await res.json());
                }
            } catch (error) {
                console.error('Error fetching permits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPermits();
    }, [projectId]);

    // Filter permits
    const filteredPermits = permits.filter(permit => {
        if (filterStatus !== 'all' && permit.status !== filterStatus) return false;
        if (filterType !== 'all' && permit.permit_type !== filterType) return false;
        if (searchQuery && !permit.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !permit.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Stats
    const stats = {
        total: permits.length,
        approved: permits.filter(p => p.status === 'approved').length,
        pending: permits.filter(p => p.status === 'pending' || p.status === 'submitted').length,
        total_fees: permits.reduce((sum, p) => sum + (p.fee || 0), 0),
        expiring_soon: permits.filter(p => {
            if (p.status !== 'approved') return false;
            const endDate = new Date(p.end_date);
            const now = new Date();
            const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= 7;
        }).length
    };

    // Add permit
    const addPermit = async () => {
        const newPermit: Permit = {
            id: crypto.randomUUID(),
            ...form,
            status: 'draft',
            fee_paid: false,
            documents: [],
            requirements: [],
            restrictions: []
        };

        setPermits(prev => [...prev, newPermit]);
        setShowAddModal(false);
        setForm({
            permit_type: 'filming', location: '', address: '', jurisdiction: '',
            issuing_authority: '', start_date: '', end_date: '', fee: 0,
            contact_name: '', contact_phone: '', contact_email: '', notes: ''
        });

        try {
            await fetch(`/api/projects/${projectId}/permits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPermit)
            });
        } catch (error) {
            console.error('Error adding permit:', error);
        }
    };

    // Update status
    const updateStatus = async (permitId: string, status: Permit['status']) => {
        setPermits(prev => prev.map(p => p.id === permitId ? { ...p, status } : p));

        try {
            await fetch(`/api/projects/${projectId}/permits/${permitId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Check expiring soon
    const isExpiringSoon = (permit: Permit) => {
        if (permit.status !== 'approved') return false;
        const endDate = new Date(permit.end_date);
        const now = new Date();
        const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 7;
    };

    // Check expired
    const isExpired = (permit: Permit) => {
        const endDate = new Date(permit.end_date);
        return endDate < new Date();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileCheck className="text-yellow-500" />
                        Permits & Clearances
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track filming permits and legal clearances
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <Plus size={18} />
                    Add Permit
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Permits</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Expiring Soon</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.expiring_soon}</p>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Fees</p>
                    <p className="text-2xl font-bold text-blue-400">${stats.total_fees.toLocaleString()}</p>
                </div>
            </div>

            {/* Alerts */}
            {stats.expiring_soon > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" size={20} />
                        <div>
                            <p className="text-orange-400 font-medium">{stats.expiring_soon} permit(s) expiring within 7 days</p>
                            <p className="text-sm text-orange-500/70">Review and renew if needed</p>
                        </div>
                    </div>
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
                        placeholder="Search permits..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                >
                    <option value="all">All Types</option>
                    {Object.entries(PERMIT_TYPES).map(([key, config]) => (
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

            {/* Permits List */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredPermits.length === 0 ? (
                        <div className="bg-[#121212] border border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No permits found
                        </div>
                    ) : (
                        filteredPermits.map((permit) => {
                            const typeConfig = PERMIT_TYPES[permit.permit_type];
                            const statusConfig = STATUS_CONFIG[permit.status];
                            const expiringSoon = isExpiringSoon(permit);
                            const expired = isExpired(permit);

                            return (
                                <div
                                    key={permit.id}
                                    className={`bg-[#121212] border rounded-xl p-6 ${
                                        expiringSoon ? 'border-orange-500/50' : expired ? 'border-red-500/50' : 'border-white/5'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`text-3xl p-3 rounded-xl ${typeConfig.color}`}>
                                                {typeConfig.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-white">{permit.location}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${typeConfig.color}`}>
                                                        {typeConfig.label}
                                                    </span>
                                                    {expiringSoon && (
                                                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded text-xs flex items-center gap-1">
                                                            <AlertTriangle size={12} />
                                                            Expiring Soon
                                                        </span>
                                                    )}
                                                </div>
                                                {permit.address && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {permit.address}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-sm">
                                                    <span className="text-gray-400 flex items-center gap-1">
                                                        <Building size={14} />
                                                        {permit.jurisdiction}
                                                    </span>
                                                    <span className="text-gray-400 flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(permit.start_date).toLocaleDateString()} - {new Date(permit.end_date).toLocaleDateString()}
                                                    </span>
                                                    {permit.fee && (
                                                        <span className="text-gray-400 flex items-center gap-1">
                                                            <DollarSign size={14} />
                                                            ${permit.fee}
                                                            {permit.fee_paid && <Check size={12} className="text-green-400" />}
                                                        </span>
                                                    )}
                                                </div>
                                                {permit.permit_number && (
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        Permit #: {permit.permit_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={permit.status}
                                                onChange={(e) => updateStatus(permit.id, e.target.value as any)}
                                                className={`px-3 py-1 rounded-lg text-sm ${statusConfig.color} bg-transparent`}
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.label}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setSelectedPermit(permit)}
                                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Requirements/Restrictions preview */}
                                    {(permit.requirements?.length || permit.restrictions?.length) && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-6">
                                            {permit.requirements && permit.requirements.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Requirements</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {permit.requirements.slice(0, 3).map((req, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
                                                                {req}
                                                            </span>
                                                        ))}
                                                        {permit.requirements.length > 3 && (
                                                            <span className="text-xs text-gray-600">+{permit.requirements.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {permit.restrictions && permit.restrictions.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Restrictions</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {permit.restrictions.slice(0, 3).map((res, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                                                                {res}
                                                            </span>
                                                        ))}
                                                        {permit.restrictions.length > 3 && (
                                                            <span className="text-xs text-gray-600">+{permit.restrictions.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212]">
                            <h3 className="text-lg font-bold text-white">Add Permit</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Permit Type</label>
                                    <select
                                        value={form.permit_type}
                                        onChange={(e) => setForm({ ...form, permit_type: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        {Object.entries(PERMIT_TYPES).map(([key, config]) => (
                                            <option key={key} value={key}>{config.icon} {config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Fee ($)</label>
                                    <input
                                        type="number"
                                        value={form.fee}
                                        onChange={(e) => setForm({ ...form, fee: parseInt(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Location Name</label>
                                <input
                                    type="text"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    placeholder="e.g., Central Park, Main Street"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Address</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Jurisdiction</label>
                                    <input
                                        type="text"
                                        value={form.jurisdiction}
                                        onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                                        placeholder="e.g., NYC, LA County"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Issuing Authority</label>
                                    <input
                                        type="text"
                                        value={form.issuing_authority}
                                        onChange={(e) => setForm({ ...form, issuing_authority: e.target.value })}
                                        placeholder="e.g., Film Office"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={form.start_date}
                                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                            </div>

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
                                onClick={addPermit}
                                disabled={!form.location || !form.jurisdiction}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Permit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
