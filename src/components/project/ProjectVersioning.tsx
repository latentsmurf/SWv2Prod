'use client';

import React, { useState, useEffect } from 'react';
import {
    History, RotateCcw, Eye, GitBranch, Clock, User,
    ChevronRight, Check, X, AlertTriangle, Plus,
    Loader2, Download, Trash2, Tag
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ProjectVersion {
    id: string;
    version_number: string;
    name?: string;
    description?: string;
    created_by: string;
    created_at: string;
    changes_summary: string[];
    is_autosave: boolean;
    size_bytes?: number;
    is_current: boolean;
}

interface ProjectVersioningProps {
    projectId: string;
    onRestore?: (version: ProjectVersion) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectVersioning({
    projectId,
    onRestore
}: ProjectVersioningProps) {
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null);
    const [compareVersion, setCompareVersion] = useState<ProjectVersion | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');
    const [newVersionDesc, setNewVersionDesc] = useState('');

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    useEffect(() => {
        const fetchVersions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/versions`);
                if (res.ok) {
                    setVersions(await res.json());
                } else {
                    setVersions(MOCK_VERSIONS);
                }
            } catch (error) {
                console.error('Error fetching versions:', error);
                setVersions(MOCK_VERSIONS);
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [projectId]);

    // ========================================================================
    // ACTIONS
    // ========================================================================

    const createSnapshot = async () => {
        setIsCreating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newVersionName || undefined,
                    description: newVersionDesc || undefined
                })
            });

            if (res.ok) {
                const version = await res.json();
                setVersions(prev => [version, ...prev.map(v => ({ ...v, is_current: false }))]);
            } else {
                // Mock fallback
                const version: ProjectVersion = {
                    id: crypto.randomUUID(),
                    version_number: `v${versions.length + 1}.0`,
                    name: newVersionName || `Snapshot ${versions.length + 1}`,
                    description: newVersionDesc,
                    created_by: 'You',
                    created_at: new Date().toISOString(),
                    changes_summary: ['Manual snapshot created'],
                    is_autosave: false,
                    is_current: true
                };
                setVersions(prev => [version, ...prev.map(v => ({ ...v, is_current: false }))]);
            }

            setShowCreateModal(false);
            setNewVersionName('');
            setNewVersionDesc('');
        } catch (error) {
            console.error('Error creating snapshot:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const restoreVersion = async (version: ProjectVersion) => {
        if (!confirm(`Restore to "${version.name || version.version_number}"? Current changes will be saved as a new version.`)) {
            return;
        }

        setIsRestoring(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/versions/${version.id}/restore`, {
                method: 'POST'
            });

            if (res.ok) {
                setVersions(prev => prev.map(v => ({ ...v, is_current: v.id === version.id })));
                onRestore?.(version);
            }
        } catch (error) {
            console.error('Error restoring version:', error);
        } finally {
            setIsRestoring(false);
        }
    };

    const deleteVersion = async (version: ProjectVersion) => {
        if (version.is_current) return;
        if (!confirm('Delete this version? This cannot be undone.')) return;

        try {
            await fetch(`/api/projects/${projectId}/versions/${version.id}`, {
                method: 'DELETE'
            });
            setVersions(prev => prev.filter(v => v.id !== version.id));
        } catch (error) {
            console.error('Error deleting version:', error);
        }
    };

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const formatSize = (bytes?: number): string => {
        if (!bytes) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatRelativeTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center">
                            <History size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Version History</h2>
                            <p className="text-xs text-gray-500">{versions.length} versions saved</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-colors"
                    >
                        <Plus size={16} />
                        Save Snapshot
                    </button>
                </div>
            </div>

            {/* Version List */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                    {versions.map((version, index) => {
                        const isSelected = selectedVersion?.id === version.id;

                        return (
                            <div
                                key={version.id}
                                className={`
                                    relative p-4 bg-[#121212] border rounded-xl transition-all
                                    ${version.is_current ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 
                                      isSelected ? 'border-white/20' : 'border-white/5 hover:border-white/20'}
                                `}
                            >
                                {/* Current indicator */}
                                {version.is_current && (
                                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                                        Current
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Version Icon */}
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${version.is_autosave ? 'bg-blue-500/10' : 'bg-purple-500/10'}
                                    `}>
                                        {version.is_autosave ? (
                                            <Clock size={18} className="text-blue-400" />
                                        ) : (
                                            <Tag size={18} className="text-purple-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-mono text-gray-400">{version.version_number}</span>
                                            {version.name && (
                                                <span className="text-sm font-medium text-white">{version.name}</span>
                                            )}
                                            {version.is_autosave && (
                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded">Auto</span>
                                            )}
                                        </div>
                                        
                                        {version.description && (
                                            <p className="text-sm text-gray-400 mb-2">{version.description}</p>
                                        )}

                                        {/* Changes */}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {version.changes_summary.slice(0, 3).map((change, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/5 text-xs text-gray-500 rounded">
                                                    {change}
                                                </span>
                                            ))}
                                            {version.changes_summary.length > 3 && (
                                                <span className="text-xs text-gray-600">+{version.changes_summary.length - 3} more</span>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User size={10} />
                                                {version.created_by}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatRelativeTime(version.created_at)}
                                            </span>
                                            {version.size_bytes && (
                                                <span>{formatSize(version.size_bytes)}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {!version.is_current && (
                                            <>
                                                <button
                                                    onClick={() => restoreVersion(version)}
                                                    disabled={isRestoring}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg text-sm disabled:opacity-50"
                                                >
                                                    {isRestoring ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <RotateCcw size={14} />
                                                    )}
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => deleteVersion(version)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setSelectedVersion(isSelected ? null : version)}
                                            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Connection line */}
                                {index < versions.length - 1 && (
                                    <div className="absolute left-9 -bottom-3 w-0.5 h-6 bg-white/10" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Snapshot Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Save Snapshot</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name (optional)</label>
                                <input
                                    type="text"
                                    value={newVersionName}
                                    onChange={e => setNewVersionName(e.target.value)}
                                    placeholder="e.g., Before major edit"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description (optional)</label>
                                <textarea
                                    value={newVersionDesc}
                                    onChange={e => setNewVersionDesc(e.target.value)}
                                    placeholder="What's this version about?"
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={createSnapshot}
                                disabled={isCreating}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl disabled:opacity-50"
                            >
                                {isCreating ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Tag size={16} />
                                )}
                                Save Snapshot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_VERSIONS: ProjectVersion[] = [
    {
        id: '1',
        version_number: 'v3.2',
        name: 'Final Review Ready',
        description: 'All scenes complete, ready for director review',
        created_by: 'You',
        created_at: new Date().toISOString(),
        changes_summary: ['Updated Scene 5', 'Added music', 'Color grading complete'],
        is_autosave: false,
        size_bytes: 15728640,
        is_current: true
    },
    {
        id: '2',
        version_number: 'v3.1',
        created_by: 'System',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        changes_summary: ['Auto-saved'],
        is_autosave: true,
        size_bytes: 15200000,
        is_current: false
    },
    {
        id: '3',
        version_number: 'v3.0',
        name: 'Act 2 Complete',
        created_by: 'You',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        changes_summary: ['Scenes 4-8 complete', 'Added transitions'],
        is_autosave: false,
        size_bytes: 12582912,
        is_current: false
    },
    {
        id: '4',
        version_number: 'v2.0',
        name: 'First Draft',
        created_by: 'You',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        changes_summary: ['Initial shot generation', 'Basic timeline'],
        is_autosave: false,
        size_bytes: 8388608,
        is_current: false
    }
];
