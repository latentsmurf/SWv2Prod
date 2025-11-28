'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Images, Search, Filter, Download, Trash2, RefreshCw, Play, Pause,
    Grid, List, Check, X, Loader2, Calendar, Film, Camera, Eye,
    MoreHorizontal, FolderOpen, Clock, Sparkles, ChevronDown, ImageIcon,
    Video, Maximize2, ChevronLeft, ChevronRight, Info, Copy, ExternalLink,
    Archive, Tag, SlidersHorizontal, Zap
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface GeneratedMedia {
    id: string;
    project_id: string;
    scene_id?: string;
    scene_number?: number;
    shot_number?: number;
    type: 'image' | 'video';
    status: 'queued' | 'processing' | 'completed' | 'failed';
    prompt: string;
    gcs_path?: string;
    proxy_path?: string;
    public_url?: string;
    thumbnail_url?: string;
    duration?: number;
    resolution?: string;
    file_size?: number;
    style_preset?: string;
    created_at: string;
    updated_at?: string;
    versions?: MediaVersion[];
    tags?: string[];
    used_in?: string[]; // Export IDs where this media is used
}

interface MediaVersion {
    id: string;
    created_at: string;
    thumbnail_url?: string;
    prompt?: string;
    type: 'original' | 'edited' | 'upscaled' | 'variation';
}

interface Project {
    id: string;
    name: string;
}

interface Scene {
    id: string;
    scene_number: number;
    heading?: string;
}

interface GeneratedMediaLibraryProps {
    projectId?: string;
    onSelectMedia?: (media: GeneratedMedia) => void;
    selectionMode?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG = {
    queued: { label: 'Queued', color: 'bg-gray-500/10 text-gray-400', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400', icon: Loader2 },
    completed: { label: 'Completed', color: 'bg-green-500/10 text-green-400', icon: Check },
    failed: { label: 'Failed', color: 'bg-red-500/10 text-red-400', icon: X },
};

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'scene', label: 'By Scene' },
    { value: 'status', label: 'By Status' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GeneratedMediaLibrary({ 
    projectId: initialProjectId, 
    onSelectMedia,
    selectionMode = false 
}: GeneratedMediaLibraryProps) {
    // State
    const [media, setMedia] = useState<GeneratedMedia[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId || null);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterScene, setFilterScene] = useState<string>('all');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    const [sortBy, setSortBy] = useState('newest');
    
    // View
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [previewMedia, setPreviewMedia] = useState<GeneratedMedia | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Bulk actions
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects');
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                    if (!selectedProjectId && data.length > 0) {
                        // Sort by created_at and select latest
                        data.sort((a: any, b: any) => 
                            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                        );
                        setSelectedProjectId(data[0].id || data[0]._id);
                    }
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, []);

    // Fetch media when project changes
    useEffect(() => {
        if (!selectedProjectId) return;
        
        const fetchMedia = async () => {
            setLoading(true);
            try {
                // Fetch shots for this project
                const res = await fetch(`/api/projects/${selectedProjectId}/shots`);
                if (res.ok) {
                    const shots = await res.json();
                    // Transform shots to media format
                    const mediaItems: GeneratedMedia[] = shots.map((shot: any) => ({
                        id: shot.id || shot._id,
                        project_id: shot.project_id,
                        scene_id: shot.scene_id,
                        scene_number: shot.scene_number,
                        shot_number: shot.shot_number,
                        type: shot.gcs_path?.endsWith('.mp4') ? 'video' : 'image',
                        status: shot.status || 'completed',
                        prompt: shot.prompt || shot.prompt_data?.full_prompt || shot.description || '',
                        gcs_path: shot.gcs_path,
                        proxy_path: shot.proxy_path,
                        public_url: shot.proxy_path || shot.urls?.proxy,
                        thumbnail_url: shot.proxy_path || shot.urls?.proxy,
                        duration: shot.duration,
                        style_preset: shot.style_preset,
                        created_at: shot.created_at,
                        updated_at: shot.updated_at,
                        tags: shot.tags || [],
                    }));
                    setMedia(mediaItems);
                }
                
                // Fetch scenes for filter
                const scenesRes = await fetch(`/api/projects/${selectedProjectId}/scenes`);
                if (scenesRes.ok) {
                    setScenes(await scenesRes.json());
                }
            } catch (error) {
                console.error('Error fetching media:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchMedia();
    }, [selectedProjectId]);

    // ========================================================================
    // FILTERING & SORTING
    // ========================================================================

    const filteredMedia = media.filter(item => {
        // Status filter
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        
        // Scene filter
        if (filterScene !== 'all' && item.scene_id !== filterScene) return false;
        
        // Type filter
        if (filterType !== 'all' && item.type !== filterType) return false;
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                item.prompt?.toLowerCase().includes(query) ||
                item.tags?.some(t => t.toLowerCase().includes(query)) ||
                `scene ${item.scene_number}`.includes(query) ||
                `shot ${item.shot_number}`.includes(query)
            );
        }
        
        return true;
    });

    const sortedMedia = [...filteredMedia].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'scene':
                return (a.scene_number || 0) - (b.scene_number || 0) || 
                       (a.shot_number || 0) - (b.shot_number || 0);
            case 'status':
                return a.status.localeCompare(b.status);
            default:
                return 0;
        }
    });

    // ========================================================================
    // SELECTION
    // ========================================================================

    const toggleSelection = (id: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAll = () => {
        if (selectedItems.size === sortedMedia.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(sortedMedia.map(m => m.id)));
        }
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
    };

    // ========================================================================
    // BULK ACTIONS
    // ========================================================================

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;
        if (!confirm(`Delete ${selectedItems.size} item(s)? This cannot be undone.`)) return;
        
        setIsDeleting(true);
        try {
            await fetch('/api/media/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [...selectedItems] })
            });
            
            setMedia(prev => prev.filter(m => !selectedItems.has(m.id)));
            setSelectedItems(new Set());
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkExport = async () => {
        if (selectedItems.size === 0) return;
        
        setIsExporting(true);
        try {
            const res = await fetch('/api/media/bulk-export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ids: [...selectedItems],
                    project_id: selectedProjectId
                })
            });
            
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `media-export-${Date.now()}.zip`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
            // Fallback: download individually
            selectedItems.forEach(id => {
                const item = media.find(m => m.id === id);
                if (item?.public_url) {
                    window.open(item.public_url, '_blank');
                }
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleRegenerate = async (mediaId: string) => {
        const item = media.find(m => m.id === mediaId);
        if (!item) return;
        
        try {
            await fetch(`/api/projects/${selectedProjectId}/shots/${mediaId}/regenerate`, {
                method: 'POST'
            });
            
            // Update status to processing
            setMedia(prev => prev.map(m => 
                m.id === mediaId ? { ...m, status: 'processing' as const } : m
            ));
        } catch (error) {
            console.error('Error regenerating:', error);
        }
    };

    // ========================================================================
    // STATS
    // ========================================================================

    const stats = {
        total: media.length,
        completed: media.filter(m => m.status === 'completed').length,
        processing: media.filter(m => m.status === 'processing').length,
        failed: media.filter(m => m.status === 'failed').length,
        images: media.filter(m => m.type === 'image').length,
        videos: media.filter(m => m.type === 'video').length,
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                            <Images size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Generated Media</h2>
                            <p className="text-xs text-gray-500">
                                {stats.total} items • {stats.completed} completed • {stats.processing} processing
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Project Selector */}
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                        >
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>

                        {/* Bulk Actions */}
                        {selectedItems.size > 0 && (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                                <span className="text-sm text-gray-400">{selectedItems.size} selected</span>
                                <button
                                    onClick={handleBulkExport}
                                    disabled={isExporting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
                                >
                                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                    Export
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                                >
                                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Delete
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="p-1.5 text-gray-500 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by prompt, scene, or tags..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        {['all', 'image', 'video'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type as any)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    filterType === type
                                        ? 'bg-purple-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {type === 'all' ? 'All' : type === 'image' ? '🖼️ Images' : '🎬 Videos'}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="all">All Status</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>

                    {/* Scene Filter */}
                    {scenes.length > 0 && (
                        <select
                            value={filterScene}
                            onChange={(e) => setFilterScene(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="all">All Scenes</option>
                            {scenes.map(scene => (
                                <option key={scene.id} value={scene.id}>
                                    Scene {scene.scene_number}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <List size={16} />
                        </button>
                    </div>

                    {/* Select All */}
                    <button
                        onClick={selectAll}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title={selectedItems.size === sortedMedia.length ? 'Deselect all' : 'Select all'}
                    >
                        <Check size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="animate-spin text-purple-500 mx-auto mb-3" size={32} />
                            <p className="text-gray-500 text-sm">Loading media...</p>
                        </div>
                    </div>
                ) : sortedMedia.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Images className="text-gray-600" size={28} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No media found</h3>
                            <p className="text-gray-500 text-sm max-w-sm">
                                {searchQuery || filterStatus !== 'all' || filterScene !== 'all'
                                    ? 'Try adjusting your filters.'
                                    : 'Generate some shots to see them here.'}
                            </p>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {sortedMedia.map(item => (
                            <MediaCard
                                key={item.id}
                                media={item}
                                isSelected={selectedItems.has(item.id)}
                                onSelect={() => toggleSelection(item.id)}
                                onPreview={() => setPreviewMedia(item)}
                                onRegenerate={() => handleRegenerate(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedMedia.map(item => (
                            <MediaListItem
                                key={item.id}
                                media={item}
                                isSelected={selectedItems.has(item.id)}
                                onSelect={() => toggleSelection(item.id)}
                                onPreview={() => setPreviewMedia(item)}
                                onRegenerate={() => handleRegenerate(item.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewMedia && (
                <MediaPreviewModal
                    media={previewMedia}
                    allMedia={sortedMedia}
                    onClose={() => setPreviewMedia(null)}
                    onNavigate={(media) => setPreviewMedia(media)}
                    onRegenerate={() => handleRegenerate(previewMedia.id)}
                />
            )}
        </div>
    );
}

// ============================================================================
// MEDIA CARD COMPONENT
// ============================================================================

function MediaCard({
    media,
    isSelected,
    onSelect,
    onPreview,
    onRegenerate
}: {
    media: GeneratedMedia;
    isSelected: boolean;
    onSelect: () => void;
    onPreview: () => void;
    onRegenerate: () => void;
}) {
    const statusConfig = STATUS_CONFIG[media.status];
    const StatusIcon = statusConfig.icon;

    return (
        <div
            className={`group relative bg-[#121212] border rounded-xl overflow-hidden transition-all cursor-pointer ${
                isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-white/5 hover:border-white/20'
            }`}
            onClick={onPreview}
        >
            {/* Thumbnail */}
            <div className="aspect-video bg-black relative">
                {media.thumbnail_url || media.public_url ? (
                    media.type === 'video' ? (
                        <video
                            src={media.public_url}
                            className="w-full h-full object-cover"
                            muted
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        />
                    ) : (
                        <img
                            src={media.thumbnail_url || media.public_url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                        {media.type === 'video' ? <Video size={24} /> : <ImageIcon size={24} />}
                    </div>
                )}

                {/* Processing overlay */}
                {media.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-purple-400" size={24} />
                    </div>
                )}

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        media.type === 'video' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                        {media.type === 'video' ? '🎬' : '🖼️'}
                    </span>
                </div>

                {/* Selection checkbox */}
                <button
                    onClick={(e) => { e.stopPropagation(); onSelect(); }}
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                            ? 'bg-purple-500 border-purple-500'
                            : 'bg-black/50 border-white/30 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    {isSelected && <Check size={12} className="text-white" />}
                </button>

                {/* Status badge */}
                <div className={`absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(); }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        <Eye size={16} />
                    </button>
                    {media.status === 'completed' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            title="Regenerate"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                    {media.public_url && (
                        <a
                            href={media.public_url}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                            <Download size={16} />
                        </a>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-xs text-gray-400 mb-1">
                    Scene {media.scene_number || '?'} • Shot {media.shot_number || '?'}
                </p>
                <p className="text-sm text-white line-clamp-2 leading-tight">
                    {media.prompt || 'No description'}
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// MEDIA LIST ITEM COMPONENT
// ============================================================================

function MediaListItem({
    media,
    isSelected,
    onSelect,
    onPreview,
    onRegenerate
}: {
    media: GeneratedMedia;
    isSelected: boolean;
    onSelect: () => void;
    onPreview: () => void;
    onRegenerate: () => void;
}) {
    const statusConfig = STATUS_CONFIG[media.status];

    return (
        <div
            className={`flex items-center gap-4 p-3 bg-[#121212] border rounded-xl cursor-pointer transition-all ${
                isSelected
                    ? 'border-purple-500 bg-purple-500/5'
                    : 'border-white/5 hover:border-white/20'
            }`}
            onClick={onPreview}
        >
            {/* Selection */}
            <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                }`}
            >
                {isSelected && <Check size={12} className="text-white" />}
            </button>

            {/* Thumbnail */}
            <div className="w-20 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                {media.thumbnail_url || media.public_url ? (
                    <img src={media.thumbnail_url || media.public_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        {media.type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                        Scene {media.scene_number || '?'} • Shot {media.shot_number || '?'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusConfig.color}`}>
                        {statusConfig.label}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        media.type === 'video' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                        {media.type}
                    </span>
                </div>
                <p className="text-sm text-white truncate">{media.prompt || 'No description'}</p>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-500 flex-shrink-0">
                {new Date(media.created_at).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {media.status === 'completed' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <RefreshCw size={14} />
                    </button>
                )}
                {media.public_url && (
                    <a
                        href={media.public_url}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Download size={14} />
                    </a>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// PREVIEW MODAL COMPONENT
// ============================================================================

function MediaPreviewModal({
    media,
    allMedia,
    onClose,
    onNavigate,
    onRegenerate
}: {
    media: GeneratedMedia;
    allMedia: GeneratedMedia[];
    onClose: () => void;
    onNavigate: (media: GeneratedMedia) => void;
    onRegenerate: () => void;
}) {
    const currentIndex = allMedia.findIndex(m => m.id === media.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < allMedia.length - 1;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft' && hasPrev) onNavigate(allMedia[currentIndex - 1]);
        if (e.key === 'ArrowRight' && hasNext) onNavigate(allMedia[currentIndex + 1]);
    }, [currentIndex, hasPrev, hasNext, allMedia, onClose, onNavigate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex" onClick={onClose}>
            {/* Navigation - Left */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate(allMedia[currentIndex - 1]); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {/* Navigation - Right */}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate(allMedia[currentIndex + 1]); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
                <X size={20} />
            </button>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-16" onClick={(e) => e.stopPropagation()}>
                <div className="max-w-5xl w-full">
                    {/* Media */}
                    <div className="bg-black rounded-xl overflow-hidden mb-4">
                        {media.type === 'video' ? (
                            <video
                                src={media.public_url}
                                controls
                                autoPlay
                                className="w-full max-h-[70vh] object-contain"
                            />
                        ) : (
                            <img
                                src={media.public_url || media.thumbnail_url}
                                alt=""
                                className="w-full max-h-[70vh] object-contain"
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="bg-[#121212] rounded-xl p-4 border border-white/5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-gray-400">
                                        Scene {media.scene_number || '?'} • Shot {media.shot_number || '?'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[media.status].color}`}>
                                        {STATUS_CONFIG[media.status].label}
                                    </span>
                                </div>
                                <p className="text-white">{media.prompt || 'No description'}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Created {new Date(media.created_at).toLocaleString()}
                                    {media.style_preset && ` • Style: ${media.style_preset}`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onRegenerate}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
                                >
                                    <RefreshCw size={14} />
                                    Regenerate
                                </button>
                                {media.public_url && (
                                    <a
                                        href={media.public_url}
                                        download
                                        className="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg text-sm text-white transition-colors"
                                    >
                                        <Download size={14} />
                                        Download
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Counter */}
                    <div className="text-center mt-4 text-sm text-gray-500">
                        {currentIndex + 1} of {allMedia.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
