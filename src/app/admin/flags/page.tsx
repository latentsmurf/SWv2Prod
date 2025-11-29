'use client';

import React, { useState, useEffect } from 'react';
import {
    Flag, Search, Filter, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
    RefreshCw, Loader2, X, Settings, Bot, CreditCard, Palette, FlaskConical,
    TestTube, Users, Percent, ChevronDown
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    enabled: boolean;
    type: 'boolean' | 'percentage' | 'user_segment';
    percentage?: number;
    segments?: string[];
    created_at: string;
    updated_at: string;
    category: 'ai' | 'ui' | 'billing' | 'experimental' | 'beta';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [enabledFilter, setEnabledFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch flags from API
    const fetchFlags = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter !== 'all') params.set('category', categoryFilter);
            if (enabledFilter !== 'all') params.set('enabled', enabledFilter);
            
            const res = await fetch(`/api/admin/feature-flags?${params}`);
            if (res.ok) {
                const data = await res.json();
                setFlags(data.flags);
            }
        } catch (error) {
            console.error('Error fetching flags:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, [categoryFilter, enabledFilter]);

    // Toggle flag
    const toggleFlag = async (flagId: string) => {
        setActionLoading(flagId);
        try {
            const res = await fetch('/api/admin/feature-flags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', flagId })
            });
            
            if (res.ok) {
                const data = await res.json();
                setFlags(prev => prev.map(f => f.id === flagId ? data.flag : f));
            }
        } catch (error) {
            console.error('Error toggling flag:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Delete flag
    const deleteFlag = async (flagId: string) => {
        if (!confirm('Are you sure you want to delete this feature flag?')) return;
        
        setActionLoading(flagId);
        try {
            const res = await fetch('/api/admin/feature-flags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', flagId })
            });
            
            if (res.ok) {
                setFlags(prev => prev.filter(f => f.id !== flagId));
            }
        } catch (error) {
            console.error('Error deleting flag:', error);
        } finally {
            setActionLoading(null);
        }
    };

    // Filter flags by search
    const filteredFlags = flags.filter(flag => {
        const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             flag.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Category icons
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ai': return <Bot size={14} />;
            case 'ui': return <Palette size={14} />;
            case 'billing': return <CreditCard size={14} />;
            case 'experimental': return <FlaskConical size={14} />;
            case 'beta': return <TestTube size={14} />;
            default: return <Settings size={14} />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'ai': return 'bg-purple-500/20 text-purple-400';
            case 'ui': return 'bg-blue-500/20 text-blue-400';
            case 'billing': return 'bg-green-500/20 text-green-400';
            case 'experimental': return 'bg-orange-500/20 text-orange-400';
            case 'beta': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    // Stats
    const stats = {
        total: flags.length,
        enabled: flags.filter(f => f.enabled).length,
        disabled: flags.filter(f => !f.enabled).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
                    <p className="text-sm text-gray-500">Control feature rollouts and experiments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchFlags()}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm transition-colors"
                    >
                        <Plus size={14} />
                        New Flag
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Flags</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Enabled</p>
                    <p className="text-2xl font-bold text-green-400">{stats.enabled}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Disabled</p>
                    <p className="text-2xl font-bold text-gray-400">{stats.disabled}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search flags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    />
                </div>
                
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="all">All Categories</option>
                    <option value="ai">AI</option>
                    <option value="ui">UI</option>
                    <option value="billing">Billing</option>
                    <option value="experimental">Experimental</option>
                    <option value="beta">Beta</option>
                </select>
                
                <select
                    value={enabledFilter}
                    onChange={(e) => setEnabledFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="all">All Status</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                </select>
            </div>

            {/* Flags List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                    </div>
                ) : filteredFlags.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Flag size={40} className="mx-auto mb-4 opacity-50" />
                        <p>No feature flags found</p>
                    </div>
                ) : (
                    filteredFlags.map((flag) => (
                        <div
                            key={flag.id}
                            className={`bg-[#0a0a0a] border rounded-xl p-5 transition-colors ${
                                flag.enabled ? 'border-green-500/30' : 'border-white/10'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-white">{flag.name}</h3>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getCategoryColor(flag.category)}`}>
                                            {getCategoryIcon(flag.category)}
                                            {flag.category}
                                        </span>
                                        {flag.type === 'percentage' && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                                <Percent size={12} />
                                                {flag.percentage}%
                                            </span>
                                        )}
                                        {flag.type === 'user_segment' && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                                <Users size={12} />
                                                {flag.segments?.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{flag.description}</p>
                                    <p className="text-xs text-gray-600 font-mono">{flag.key}</p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setEditingFlag(flag)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteFlag(flag.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => toggleFlag(flag.id)}
                                        disabled={actionLoading === flag.id}
                                        className={`p-2 rounded-lg transition-colors ${
                                            flag.enabled 
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        }`}
                                    >
                                        {actionLoading === flag.id ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : flag.enabled ? (
                                            <ToggleRight size={18} />
                                        ) : (
                                            <ToggleLeft size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal - Simple implementation */}
            {(showCreateModal || editingFlag) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingFlag(null);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-sm text-gray-400">
                                Feature flag creation/editing form would go here.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                This is a demonstration - full functionality would include form fields for key, name, description, type, percentage, segments, and category.
                            </p>
                        </div>
                        
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingFlag(null);
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
                            >
                                {editingFlag ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
