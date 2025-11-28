'use client';

import React, { useState, useEffect } from 'react';
import {
    History, Clock, User, ChevronRight, RotateCcw,
    Eye, Loader2, GitBranch, Check, X, Image
} from 'lucide-react';

interface Version {
    id: string;
    entity_type: 'shot' | 'scene' | 'project';
    entity_id: string;
    version_number: number;
    changes: VersionChange[];
    snapshot?: Record<string, any>;
    image_url?: string;
    user_id: string;
    user_name: string;
    created_at: string;
    is_current: boolean;
}

interface VersionChange {
    field: string;
    old_value: any;
    new_value: any;
}

interface VersionHistoryProps {
    entityType: 'shot' | 'scene' | 'project';
    entityId: string;
    onRestore?: (versionId: string) => void;
}

export default function VersionHistory({ entityType, entityId, onRestore }: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [comparing, setComparing] = useState<{ left: Version; right: Version } | null>(null);
    const [restoring, setRestoring] = useState(false);

    // Fetch versions
    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const res = await fetch(`/api/versions?entity_type=${entityType}&entity_id=${entityId}`);
                if (res.ok) {
                    const data = await res.json();
                    setVersions(data);
                }
            } catch (error) {
                console.error('Error fetching versions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [entityType, entityId]);

    // Restore version
    const handleRestore = async (version: Version) => {
        if (!confirm(`Restore to version ${version.version_number}? This will create a new version.`)) {
            return;
        }

        setRestoring(true);
        try {
            const res = await fetch(`/api/versions/${version.id}/restore`, {
                method: 'POST'
            });
            if (res.ok) {
                onRestore?.(version.id);
                // Refresh versions
                const updated = await fetch(`/api/versions?entity_type=${entityType}&entity_id=${entityId}`);
                if (updated.ok) {
                    setVersions(await updated.json());
                }
            }
        } catch (error) {
            console.error('Error restoring version:', error);
        } finally {
            setRestoring(false);
        }
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format change
    const formatChange = (change: VersionChange) => {
        if (change.field === 'image_url' || change.field === 'gcs_path') {
            return 'Image updated';
        }
        if (typeof change.new_value === 'string' && change.new_value.length > 50) {
            return `${change.field} modified`;
        }
        return `${change.field}: ${change.old_value || '(empty)'} → ${change.new_value}`;
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <History className="text-yellow-500" />
                            Version History
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {versions.length} versions
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Version List */}
                <div className="w-80 border-r border-white/5 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="p-6 text-center">
                            <History className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No version history</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {versions.map((version, index) => (
                                <button
                                    key={version.id}
                                    onClick={() => setSelectedVersion(version)}
                                    className={`w-full text-left p-4 rounded-xl transition-colors ${
                                        selectedVersion?.id === version.id
                                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                                            : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <GitBranch size={14} className="text-gray-500" />
                                            <span className="text-sm font-medium text-white">
                                                v{version.version_number}
                                            </span>
                                            {version.is_current && (
                                                <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-xs rounded">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User size={12} />
                                        <span>{version.user_name}</span>
                                        <span>•</span>
                                        <Clock size={12} />
                                        <span>{formatTime(version.created_at)}</span>
                                    </div>

                                    {version.changes.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                            {version.changes.length} change{version.changes.length !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Version Details */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedVersion ? (
                        <div className="space-y-6">
                            {/* Version Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Version {selectedVersion.version_number}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(selectedVersion.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!selectedVersion.is_current && (
                                    <button
                                        onClick={() => handleRestore(selectedVersion)}
                                        disabled={restoring}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                                    >
                                        {restoring ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <RotateCcw size={16} />
                                        )}
                                        Restore
                                    </button>
                                )}
                            </div>

                            {/* Image Preview (for shots) */}
                            {selectedVersion.image_url && (
                                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                                    <img
                                        src={selectedVersion.image_url}
                                        alt={`Version ${selectedVersion.version_number}`}
                                        className="w-full max-h-64 object-contain"
                                    />
                                </div>
                            )}

                            {/* Changes */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-3">Changes</h4>
                                {selectedVersion.changes.length === 0 ? (
                                    <p className="text-sm text-gray-500">Initial version</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedVersion.changes.map((change, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-white/5 rounded-lg"
                                            >
                                                <p className="text-sm text-white">
                                                    {formatChange(change)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Snapshot Data */}
                            {selectedVersion.snapshot && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-3">Snapshot</h4>
                                    <pre className="p-4 bg-[#121212] border border-white/5 rounded-xl text-xs text-gray-400 overflow-x-auto">
                                        {JSON.stringify(selectedVersion.snapshot, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <History className="mx-auto mb-4" size={48} />
                                <p>Select a version to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Compact version indicator
export function VersionBadge({
    currentVersion,
    totalVersions,
    onClick
}: {
    currentVersion: number;
    totalVersions: number;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-400 hover:text-white transition-colors"
        >
            <GitBranch size={12} />
            v{currentVersion}
            {totalVersions > 1 && (
                <span className="text-gray-600">({totalVersions})</span>
            )}
        </button>
    );
}
