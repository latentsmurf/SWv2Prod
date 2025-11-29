'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, GitBranch, Clock, User, Download, Upload,
    Plus, Eye, Check, X, Loader2, ChevronRight, Diff,
    AlertTriangle, Palette
} from 'lucide-react';

interface ScriptRevision {
    id: string;
    version: string;
    color: string;
    color_name: string;
    title?: string;
    content: string;
    page_count: number;
    changes_summary?: string;
    created_by: string;
    created_at: string;
    is_current: boolean;
    locked: boolean;
}

interface ScriptChange {
    type: 'addition' | 'deletion' | 'modification';
    scene?: string;
    page: number;
    description: string;
}

interface ScriptRevisionsProps {
    projectId: string;
    onSelectRevision?: (revision: ScriptRevision) => void;
}

const REVISION_COLORS = [
    { name: 'White', color: '#FFFFFF', code: 'white' },
    { name: 'Blue', color: '#60A5FA', code: 'blue' },
    { name: 'Pink', color: '#F472B6', code: 'pink' },
    { name: 'Yellow', color: '#FACC15', code: 'yellow' },
    { name: 'Green', color: '#4ADE80', code: 'green' },
    { name: 'Goldenrod', color: '#DAA520', code: 'goldenrod' },
    { name: 'Buff', color: '#F5DEB3', code: 'buff' },
    { name: 'Salmon', color: '#FA8072', code: 'salmon' },
    { name: 'Cherry', color: '#DE3163', code: 'cherry' },
    { name: 'Tan', color: '#D2B48C', code: 'tan' },
];

export default function ScriptRevisions({ projectId, onSelectRevision }: ScriptRevisionsProps) {
    const [revisions, setRevisions] = useState<ScriptRevision[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRevision, setSelectedRevision] = useState<ScriptRevision | null>(null);
    const [comparingWith, setComparingWith] = useState<ScriptRevision | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Upload form
    const [uploadForm, setUploadForm] = useState({
        title: '',
        color: 'blue',
        file: null as File | null
    });

    // Fetch revisions
    useEffect(() => {
        const fetchRevisions = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/script/revisions`);
                if (res.ok) {
                    const data = await res.json();
                    setRevisions(data);
                    const current = data.find((r: ScriptRevision) => r.is_current);
                    if (current) setSelectedRevision(current);
                }
            } catch (error) {
                console.error('Error fetching revisions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevisions();
    }, [projectId]);

    // Upload new revision
    const uploadRevision = async () => {
        if (!uploadForm.file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', uploadForm.file);
        formData.append('title', uploadForm.title);
        formData.append('color', uploadForm.color);

        try {
            const res = await fetch(`/api/projects/${projectId}/script/revisions`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const newRevision = await res.json();
                setRevisions(prev => [newRevision, ...prev.map(r => ({ ...r, is_current: false }))]);
                setSelectedRevision(newRevision);
                setShowUploadModal(false);
                setUploadForm({ title: '', color: 'blue', file: null });
            }
        } catch (error) {
            console.error('Error uploading revision:', error);
        } finally {
            setUploading(false);
        }
    };

    // Set as current
    const setAsCurrent = async (revisionId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/script/revisions/${revisionId}/set-current`, {
                method: 'POST'
            });

            if (res.ok) {
                setRevisions(prev => prev.map(r => ({
                    ...r,
                    is_current: r.id === revisionId
                })));
            }
        } catch (error) {
            console.error('Error setting current:', error);
        }
    };

    // Download revision
    const downloadRevision = async (revision: ScriptRevision) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/script/revisions/${revision.id}/download`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `script_${revision.color_name}_${revision.version}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error downloading:', error);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get color config
    const getColorConfig = (colorCode: string) => {
        return REVISION_COLORS.find(c => c.code === colorCode) || REVISION_COLORS[0];
    };

    return (
        <div className="h-full flex">
            {/* Revisions List */}
            <div className="w-80 border-r border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <GitBranch className="text-yellow-500" />
                            Script Revisions
                        </h2>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="mx-auto animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : revisions.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No revisions yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {revisions.map((revision) => {
                                const colorConfig = getColorConfig(revision.color);
                                const isSelected = selectedRevision?.id === revision.id;
                                const isComparing = comparingWith?.id === revision.id;

                                return (
                                    <button
                                        key={revision.id}
                                        onClick={() => {
                                            setSelectedRevision(revision);
                                            onSelectRevision?.(revision);
                                        }}
                                        className={`w-full text-left p-4 hover:bg-white/5 ${
                                            isSelected ? 'bg-white/5' : ''
                                        } ${isComparing ? 'ring-2 ring-purple-500' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-4 h-full min-h-[60px] rounded-full"
                                                style={{ backgroundColor: colorConfig.color }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-medium">
                                                        {revision.version}
                                                    </span>
                                                    <span
                                                        className="px-2 py-0.5 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: colorConfig.color + '30',
                                                            color: colorConfig.color
                                                        }}
                                                    >
                                                        {colorConfig.name}
                                                    </span>
                                                    {revision.is_current && (
                                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                                                            Current
                                                        </span>
                                                    )}
                                                    {revision.locked && (
                                                        <span className="text-yellow-500" title="Locked">🔒</span>
                                                    )}
                                                </div>
                                                {revision.title && (
                                                    <p className="text-sm text-gray-400 truncate">{revision.title}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <FileText size={12} />
                                                        {revision.page_count} pages
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatDate(revision.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <div className="flex-1 overflow-y-auto">
                {selectedRevision ? (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: getColorConfig(selectedRevision.color).color + '30' }}
                                >
                                    <FileText size={32} style={{ color: getColorConfig(selectedRevision.color).color }} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRevision.version}</h3>
                                    <p className="text-gray-400">
                                        {getColorConfig(selectedRevision.color).name} Revision
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!selectedRevision.is_current && (
                                    <button
                                        onClick={() => setAsCurrent(selectedRevision.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl"
                                    >
                                        <Check size={16} />
                                        Set as Current
                                    </button>
                                )}
                                <button
                                    onClick={() => downloadRevision(selectedRevision)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500 mb-1">Pages</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRevision.page_count}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500 mb-1">Created By</p>
                                <p className="text-lg font-medium text-white">{selectedRevision.created_by}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-sm text-gray-500 mb-1">Date</p>
                                <p className="text-lg font-medium text-white">
                                    {formatDate(selectedRevision.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Changes Summary */}
                        {selectedRevision.changes_summary && (
                            <div className="bg-white/5 rounded-xl p-4 mb-6">
                                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                                    <Diff size={16} className="text-yellow-500" />
                                    Changes Summary
                                </h4>
                                <p className="text-gray-400 whitespace-pre-wrap">
                                    {selectedRevision.changes_summary}
                                </p>
                            </div>
                        )}

                        {/* Compare Section */}
                        <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                                <GitBranch size={16} className="text-purple-500" />
                                Compare with Previous
                            </h4>
                            <div className="flex items-center gap-4">
                                <select
                                    value={comparingWith?.id || ''}
                                    onChange={(e) => {
                                        const rev = revisions.find(r => r.id === e.target.value);
                                        setComparingWith(rev || null);
                                    }}
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="">Select revision to compare</option>
                                    {revisions
                                        .filter(r => r.id !== selectedRevision.id)
                                        .map(rev => (
                                            <option key={rev.id} value={rev.id}>
                                                {rev.version} ({getColorConfig(rev.color).name})
                                            </option>
                                        ))}
                                </select>
                                {comparingWith && (
                                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl">
                                        <Eye size={16} />
                                        View Diff
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Color Timeline */}
                        <div className="mt-6">
                            <h4 className="font-medium text-white mb-4">Revision History</h4>
                            <div className="flex items-center gap-1">
                                {revisions.slice().reverse().map((rev, index) => {
                                    const color = getColorConfig(rev.color);
                                    return (
                                        <div
                                            key={rev.id}
                                            className={`flex-1 h-8 flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 ${
                                                rev.id === selectedRevision.id ? 'ring-2 ring-white' : ''
                                            }`}
                                            style={{ backgroundColor: color.color, color: '#000' }}
                                            onClick={() => setSelectedRevision(rev)}
                                            title={`${rev.version} - ${color.name}`}
                                        >
                                            {rev.version.split(' ')[0]}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <GitBranch className="mx-auto mb-4" size={48} />
                            <p>Select a revision to view details</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Upload New Revision</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Revision Title (optional)</label>
                                <input
                                    type="text"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder="e.g., Director's notes incorporated"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Revision Color</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {REVISION_COLORS.map((color) => (
                                        <button
                                            key={color.code}
                                            onClick={() => setUploadForm({ ...uploadForm, color: color.code })}
                                            className={`h-10 rounded-lg flex items-center justify-center text-xs font-medium ${
                                                uploadForm.color === color.code ? 'ring-2 ring-white' : ''
                                            }`}
                                            style={{ backgroundColor: color.color, color: '#000' }}
                                            title={color.name}
                                        >
                                            {uploadForm.color === color.code && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Script File</label>
                                <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-yellow-500/50">
                                    <input
                                        type="file"
                                        accept=".pdf,.fdx,.fountain"
                                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                                        className="hidden"
                                    />
                                    {uploadForm.file ? (
                                        <div className="text-center">
                                            <FileText className="mx-auto mb-2 text-green-400" size={32} />
                                            <p className="text-white">{uploadForm.file.name}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="mx-auto mb-2 text-gray-500" size={32} />
                                            <p className="text-gray-500">Click to upload PDF, FDX, or Fountain</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadRevision}
                                disabled={!uploadForm.file || uploading}
                                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                {uploading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Upload size={18} />
                                )}
                                Upload Revision
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
