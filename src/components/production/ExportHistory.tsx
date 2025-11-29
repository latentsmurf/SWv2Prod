'use client';

import React, { useState, useEffect } from 'react';
import {
    Download, Clock, Check, X, Loader2, FileVideo, FileImage,
    FileText, Music, Film, Trash2, RefreshCw, ExternalLink,
    HardDrive, Calendar, ChevronDown, Filter
} from 'lucide-react';

interface ExportItem {
    id: string;
    project_id: string;
    project_name: string;
    type: 'video' | 'pdf' | 'images' | 'fcpxml' | 'audio';
    format: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    download_url?: string;
    file_size?: number;
    created_at: string;
    completed_at?: string;
    error?: string;
}

interface ExportHistoryProps {
    projectId?: string; // If provided, filter by project
    limit?: number;
}

const TYPE_CONFIG = {
    video: { icon: FileVideo, label: 'Video', color: 'text-purple-400' },
    pdf: { icon: FileText, label: 'PDF', color: 'text-red-400' },
    images: { icon: FileImage, label: 'Images', color: 'text-blue-400' },
    fcpxml: { icon: Film, label: 'FCPXML', color: 'text-yellow-400' },
    audio: { icon: Music, label: 'Audio', color: 'text-green-400' },
};

export default function ExportHistory({ projectId, limit }: ExportHistoryProps) {
    const [exports, setExports] = useState<ExportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Fetch export history
    useEffect(() => {
        const fetchExports = async () => {
            try {
                let url = '/api/exports';
                const params = new URLSearchParams();
                if (projectId) params.append('project_id', projectId);
                if (limit) params.append('limit', limit.toString());
                if (params.toString()) url += `?${params}`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setExports(data);
                }
            } catch (error) {
                console.error('Error fetching exports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExports();
        // Poll for updates
        const interval = setInterval(fetchExports, 10000);
        return () => clearInterval(interval);
    }, [projectId, limit]);

    // Delete export
    const deleteExport = async (id: string) => {
        try {
            const res = await fetch(`/api/exports/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setExports(prev => prev.filter(e => e.id !== id));
            }
        } catch (error) {
            console.error('Error deleting export:', error);
        }
    };

    // Retry failed export
    const retryExport = async (item: ExportItem) => {
        try {
            const res = await fetch(`/api/exports/${item.id}/retry`, { method: 'POST' });
            if (res.ok) {
                const updated = await res.json();
                setExports(prev => prev.map(e => e.id === item.id ? updated : e));
            }
        } catch (error) {
            console.error('Error retrying export:', error);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '--';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/10';
            case 'processing': return 'text-yellow-400 bg-yellow-500/10';
            case 'failed': return 'text-red-400 bg-red-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    // Filter exports
    const filteredExports = exports.filter(e => {
        if (filterType !== 'all' && e.type !== filterType) return false;
        if (filterStatus !== 'all' && e.status !== filterStatus) return false;
        return true;
    });

    const processingCount = exports.filter(e => e.status === 'processing').length;

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Download className="text-yellow-500" />
                            Export History
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {exports.length} exports
                            {processingCount > 0 && ` • ${processingCount} in progress`}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="video">Video</option>
                            <option value="pdf">PDF</option>
                            <option value="images">Images</option>
                            <option value="fcpxml">FCPXML</option>
                            <option value="audio">Audio</option>
                        </select>
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Export List */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                    </div>
                ) : filteredExports.length === 0 ? (
                    <div className="text-center py-20">
                        <Download className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No exports yet</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Export your project to see history here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredExports.map((item) => {
                            const typeConfig = TYPE_CONFIG[item.type];
                            const Icon = typeConfig?.icon || Download;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Type Icon */}
                                        <div className={`p-3 rounded-xl bg-white/5 ${typeConfig?.color || 'text-gray-400'}`}>
                                            <Icon size={24} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-white truncate">
                                                    {item.project_name}
                                                </p>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {typeConfig?.label || item.type} • {item.format.toUpperCase()}
                                                </span>
                                                {item.file_size && (
                                                    <span className="flex items-center gap-1">
                                                        <HardDrive size={12} />
                                                        {formatFileSize(item.file_size)}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            {item.status === 'processing' && item.progress !== undefined && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-gray-500">Exporting...</span>
                                                        <span className="text-yellow-500">{item.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-yellow-500 transition-all"
                                                            style={{ width: `${item.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Message */}
                                            {item.error && (
                                                <p className="text-xs text-red-400 mt-2">{item.error}</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {item.status === 'completed' && item.download_url && (
                                                <a
                                                    href={item.download_url}
                                                    download
                                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors"
                                                >
                                                    <Download size={16} />
                                                    Download
                                                </a>
                                            )}

                                            {item.status === 'failed' && (
                                                <button
                                                    onClick={() => retryExport(item)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                                                >
                                                    <RefreshCw size={16} />
                                                    Retry
                                                </button>
                                            )}

                                            {item.status === 'processing' && (
                                                <Loader2 size={20} className="animate-spin text-yellow-500" />
                                            )}

                                            <button
                                                onClick={() => deleteExport(item.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact version for sidebars
export function ExportHistoryCompact({ limit = 5 }: { limit?: number }) {
    const [exports, setExports] = useState<ExportItem[]>([]);

    useEffect(() => {
        const fetchExports = async () => {
            try {
                const res = await fetch(`/api/exports?limit=${limit}`);
                if (res.ok) {
                    setExports(await res.json());
                }
            } catch (error) {
                console.error('Error fetching exports:', error);
            }
        };

        fetchExports();
        const interval = setInterval(fetchExports, 10000);
        return () => clearInterval(interval);
    }, [limit]);

    if (exports.length === 0) return null;

    return (
        <div className="space-y-2">
            {exports.map((item) => {
                const config = TYPE_CONFIG[item.type];
                const Icon = config?.icon || Download;

                return (
                    <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                    >
                        <div className={`p-1.5 rounded ${config?.color || 'text-gray-400'}`}>
                            <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{item.project_name}</p>
                            <p className="text-[10px] text-gray-500">
                                {item.status === 'processing' ? `${item.progress}%` : item.status}
                            </p>
                        </div>
                        {item.status === 'completed' && item.download_url && (
                            <a
                                href={item.download_url}
                                download
                                className="p-1 text-yellow-500 hover:bg-yellow-500/10 rounded"
                            >
                                <Download size={14} />
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
