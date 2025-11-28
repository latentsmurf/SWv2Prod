'use client';

import React, { useState } from 'react';
import {
    Archive, Copy, Trash2, Download, Share2, Settings,
    Loader2, Check, AlertTriangle, X, FolderArchive
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectActionsProps {
    projectId: string;
    projectName: string;
    isArchived?: boolean;
    onUpdate?: () => void;
}

export default function ProjectActions({
    projectId,
    projectName,
    isArchived = false,
    onUpdate
}: ProjectActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateName, setDuplicateName] = useState(`${projectName} (Copy)`);

    const handleArchive = async () => {
        setLoading('archive');
        try {
            const res = await fetch(`/api/projects/${projectId}/archive`, {
                method: 'POST'
            });
            if (res.ok) {
                onUpdate?.();
            }
        } catch (error) {
            console.error('Error archiving project:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleUnarchive = async () => {
        setLoading('unarchive');
        try {
            const res = await fetch(`/api/projects/${projectId}/unarchive`, {
                method: 'POST'
            });
            if (res.ok) {
                onUpdate?.();
            }
        } catch (error) {
            console.error('Error unarchiving project:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleDuplicate = async () => {
        setLoading('duplicate');
        try {
            const res = await fetch(`/api/projects/${projectId}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: duplicateName })
            });
            if (res.ok) {
                const newProject = await res.json();
                setShowDuplicateModal(false);
                router.push(`/production?projectId=${newProject.id}`);
            }
        } catch (error) {
            console.error('Error duplicating project:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async () => {
        setLoading('delete');
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setShowDeleteConfirm(false);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
        } finally {
            setLoading(null);
        }
    };

    const handleExportProject = async () => {
        setLoading('export');
        try {
            const res = await fetch(`/api/projects/${projectId}/export`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectName.replace(/\s+/g, '_')}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting project:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Duplicate */}
                <button
                    onClick={() => setShowDuplicateModal(true)}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                    title="Duplicate Project"
                >
                    {loading === 'duplicate' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Copy size={16} />
                    )}
                    <span className="hidden md:inline">Duplicate</span>
                </button>

                {/* Archive/Unarchive */}
                {isArchived ? (
                    <button
                        onClick={handleUnarchive}
                        disabled={loading !== null}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                        title="Unarchive Project"
                    >
                        {loading === 'unarchive' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <FolderArchive size={16} />
                        )}
                        <span className="hidden md:inline">Unarchive</span>
                    </button>
                ) : (
                    <button
                        onClick={handleArchive}
                        disabled={loading !== null}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                        title="Archive Project"
                    >
                        {loading === 'archive' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Archive size={16} />
                        )}
                        <span className="hidden md:inline">Archive</span>
                    </button>
                )}

                {/* Export */}
                <button
                    onClick={handleExportProject}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                    title="Export Project Data"
                >
                    {loading === 'export' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Download size={16} />
                    )}
                    <span className="hidden md:inline">Export</span>
                </button>

                {/* Delete */}
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading !== null}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                    title="Delete Project"
                >
                    {loading === 'delete' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Trash2 size={16} />
                    )}
                    <span className="hidden md:inline">Delete</span>
                </button>
            </div>

            {/* Duplicate Modal */}
            {showDuplicateModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <Copy className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Duplicate Project</h2>
                                    <p className="text-sm text-gray-500">Create a copy with all scenes and shots</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                New Project Name
                            </label>
                            <input
                                type="text"
                                value={duplicateName}
                                onChange={(e) => setDuplicateName(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
                                placeholder="Project name"
                            />
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDuplicateModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDuplicate}
                                disabled={!duplicateName.trim() || loading === 'duplicate'}
                                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading === 'duplicate' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Copy size={18} />
                                )}
                                Duplicate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-xl">
                                    <AlertTriangle className="text-red-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Delete Project</h2>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-300">
                                Are you sure you want to delete <strong className="text-white">{projectName}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                All scenes, shots, and associated data will be permanently removed.
                            </p>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading === 'delete'}
                                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading === 'delete' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Archived Projects List Component
export function ArchivedProjectsList() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchArchived = async () => {
            try {
                const res = await fetch('/api/projects?archived=true');
                if (res.ok) {
                    setProjects(await res.json());
                }
            } catch (error) {
                console.error('Error fetching archived projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchived();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-yellow-500" size={24} />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-12">
                <Archive className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">No archived projects</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-4"
                >
                    <div className="w-16 h-12 bg-black rounded-lg overflow-hidden">
                        {project.thumbnail ? (
                            <img
                                src={project.thumbnail}
                                alt={project.name}
                                className="w-full h-full object-cover opacity-50"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                <Archive size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-xs text-gray-500">
                            Archived {new Date(project.archived_at).toLocaleDateString()}
                        </p>
                    </div>
                    <ProjectActions
                        projectId={project.id}
                        projectName={project.name}
                        isArchived={true}
                        onUpdate={() => setProjects(prev => prev.filter(p => p.id !== project.id))}
                    />
                </div>
            ))}
        </div>
    );
}
