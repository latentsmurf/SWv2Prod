'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Grid, List, Play, Pause, Download, RefreshCw, Loader2,
    ChevronLeft, ChevronRight, Maximize2, X, Camera, Film,
    Sparkles, CheckCircle, AlertCircle, Clock, Layers, Eye
} from 'lucide-react';
import { Scene, Shot, BatchGenerationProgress } from '@/types';
import { SHOT_TYPE_LABELS } from '@/lib/coverage-presets';

interface StoryboardViewerProps {
    projectId: string;
    scenes: Scene[];
    onExport?: () => void;
}

type ViewMode = 'grid' | 'filmstrip' | 'presentation';

export default function StoryboardViewer({ projectId, scenes, onExport }: StoryboardViewerProps) {
    const [shots, setShots] = useState<Shot[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedShot, setSelectedShot] = useState<Shot | null>(null);
    const [selectedSceneId, setSelectedSceneId] = useState<string | 'all'>('all');
    const [batchProgress, setBatchProgress] = useState<BatchGenerationProgress>({
        total: 0,
        completed: 0,
        failed: 0,
        status: 'idle'
    });

    // Fetch all shots for the project
    useEffect(() => {
        const fetchShots = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/shots`);
                if (res.ok) {
                    const data = await res.json();
                    setShots(data);
                }
            } catch (error) {
                console.error('Error fetching shots:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchShots();
            // Poll for updates during batch generation
            const interval = setInterval(fetchShots, 3000);
            return () => clearInterval(interval);
        }
    }, [projectId]);

    // Filter shots by scene
    const filteredShots = selectedSceneId === 'all'
        ? shots
        : shots.filter(s => s.scene_id === selectedSceneId);

    // Group shots by scene for display
    const shotsByScene = scenes.reduce((acc, scene) => {
        acc[scene.id] = shots.filter(s => s.scene_id === scene.id);
        return acc;
    }, {} as Record<string, Shot[]>);

    // Batch generate all pending shots
    const handleBatchGenerate = async () => {
        const pendingShots = filteredShots.filter(s => s.status === 'pending' || s.status === 'failed');

        if (pendingShots.length === 0) {
            alert('No pending shots to generate');
            return;
        }

        setBatchProgress({
            total: pendingShots.length,
            completed: 0,
            failed: 0,
            status: 'running'
        });

        try {
            const res = await fetch('/api/generate/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    shot_ids: pendingShots.map(s => s.id),
                    scene_ids: selectedSceneId === 'all' ? scenes.map(s => s.id) : [selectedSceneId]
                })
            });

            if (res.ok) {
                // Start polling for progress
                pollBatchProgress();
            }
        } catch (error) {
            console.error('Error starting batch generation:', error);
            setBatchProgress(prev => ({ ...prev, status: 'failed' }));
        }
    };

    const pollBatchProgress = useCallback(async () => {
        const checkProgress = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/batch-progress`);
                if (res.ok) {
                    const progress = await res.json();
                    setBatchProgress(progress);

                    if (progress.status === 'running') {
                        setTimeout(checkProgress, 2000);
                    }
                }
            } catch (error) {
                console.error('Error polling progress:', error);
            }
        };
        checkProgress();
    }, [projectId]);

    // Regenerate single shot
    const handleRegenerateShot = async (shot: Shot) => {
        try {
            setShots(prev => prev.map(s =>
                s.id === shot.id ? { ...s, status: 'processing' } : s
            ));

            const res = await fetch('/api/generate/shot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shot_id: shot.id,
                    scene_id: shot.scene_id,
                    user_prompt: shot.prompt
                })
            });

            if (!res.ok) {
                setShots(prev => prev.map(s =>
                    s.id === shot.id ? { ...s, status: 'failed' } : s
                ));
            }
        } catch (error) {
            console.error('Error regenerating shot:', error);
        }
    };

    // Stats
    const stats = {
        total: filteredShots.length,
        completed: filteredShots.filter(s => s.status === 'completed').length,
        processing: filteredShots.filter(s => s.status === 'processing').length,
        pending: filteredShots.filter(s => s.status === 'pending').length,
        failed: filteredShots.filter(s => s.status === 'failed').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-yellow-500" />
                            Storyboard
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.completed}/{stats.total} shots rendered
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {[
                                { mode: 'grid' as const, icon: Grid, label: 'Grid' },
                                { mode: 'filmstrip' as const, icon: List, label: 'Filmstrip' },
                                { mode: 'presentation' as const, icon: Play, label: 'Present' }
                            ].map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`p-2 rounded-md transition-colors ${viewMode === mode
                                        ? 'bg-yellow-500 text-black'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                    title={label}
                                >
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>

                        {/* Batch Generate Button */}
                        <button
                            onClick={handleBatchGenerate}
                            disabled={batchProgress.status === 'running' || stats.pending === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {batchProgress.status === 'running' ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {batchProgress.completed}/{batchProgress.total}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate All ({stats.pending + stats.failed})
                                </>
                            )}
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Scene Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedSceneId('all')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSceneId === 'all'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        All Scenes
                    </button>
                    {scenes.map((scene, index) => (
                        <button
                            key={scene.id}
                            onClick={() => setSelectedSceneId(scene.id)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSceneId === scene.id
                                ? 'bg-yellow-500 text-black'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                                }`}
                        >
                            Scene {index + 1}
                            <span className="ml-1 text-xs opacity-60">
                                ({shotsByScene[scene.id]?.length || 0})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Progress Bar (during batch generation) */}
                {batchProgress.status === 'running' && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">Generating storyboard...</span>
                            <span className="text-yellow-500 font-mono">
                                {Math.round((batchProgress.completed / batchProgress.total) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                                style={{ width: `${(batchProgress.completed / batchProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredShots.length === 0 ? (
                    <div className="text-center py-20">
                        <Camera className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No shots yet.</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Generate a shot breakdown from your scenes.
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <StoryboardGrid
                        shots={filteredShots}
                        scenes={scenes}
                        onSelectShot={setSelectedShot}
                        onRegenerate={handleRegenerateShot}
                    />
                ) : viewMode === 'filmstrip' ? (
                    <StoryboardFilmstrip
                        shots={filteredShots}
                        scenes={scenes}
                        onSelectShot={setSelectedShot}
                        onRegenerate={handleRegenerateShot}
                    />
                ) : (
                    <StoryboardPresentation
                        shots={filteredShots.filter(s => s.status === 'completed')}
                        scenes={scenes}
                        onClose={() => setViewMode('grid')}
                    />
                )}
            </div>

            {/* Shot Detail Modal */}
            {selectedShot && viewMode !== 'presentation' && (
                <ShotDetailModal
                    shot={selectedShot}
                    scene={scenes.find(s => s.id === selectedShot.scene_id)}
                    onClose={() => setSelectedShot(null)}
                    onRegenerate={() => handleRegenerateShot(selectedShot)}
                />
            )}
        </div>
    );
}

// Grid View
function StoryboardGrid({
    shots,
    scenes,
    onSelectShot,
    onRegenerate
}: {
    shots: Shot[];
    scenes: Scene[];
    onSelectShot: (shot: Shot) => void;
    onRegenerate: (shot: Shot) => void;
}) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {shots.map((shot, index) => {
                const scene = scenes.find(s => s.id === shot.scene_id);
                return (
                    <ShotCard
                        key={shot.id}
                        shot={shot}
                        scene={scene}
                        index={index}
                        onClick={() => onSelectShot(shot)}
                        onRegenerate={() => onRegenerate(shot)}
                    />
                );
            })}
        </div>
    );
}

// Filmstrip View (horizontal by scene)
function StoryboardFilmstrip({
    shots,
    scenes,
    onSelectShot,
    onRegenerate
}: {
    shots: Shot[];
    scenes: Scene[];
    onSelectShot: (shot: Shot) => void;
    onRegenerate: (shot: Shot) => void;
}) {
    // Group by scene
    const shotsByScene = scenes.map(scene => ({
        scene,
        shots: shots.filter(s => s.scene_id === scene.id)
    })).filter(group => group.shots.length > 0);

    return (
        <div className="space-y-8">
            {shotsByScene.map(({ scene, shots: sceneShots }, sceneIndex) => (
                <div key={scene.id}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-mono text-gray-500">
                            Scene {sceneIndex + 1}
                        </span>
                        <h3 className="text-white font-medium">{scene.slug_line}</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {sceneShots.map((shot, index) => (
                            <div key={shot.id} className="flex-shrink-0 w-64">
                                <ShotCard
                                    shot={shot}
                                    scene={scene}
                                    index={index}
                                    onClick={() => onSelectShot(shot)}
                                    onRegenerate={() => onRegenerate(shot)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Presentation Mode (fullscreen slideshow)
function StoryboardPresentation({
    shots,
    scenes,
    onClose
}: {
    shots: Shot[];
    scenes: Scene[];
    onClose: () => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentShot = shots[currentIndex];
    const currentScene = scenes.find(s => s.id === currentShot?.scene_id);

    // Auto-advance
    useEffect(() => {
        if (isPlaying && shots.length > 0) {
            const timer = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % shots.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [isPlaying, shots.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setCurrentIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentIndex(prev => Math.min(shots.length - 1, prev + 1));
            } else if (e.key === 'Escape') {
                onClose();
            } else if (e.key === ' ') {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shots.length, onClose]);

    if (!currentShot) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <p className="text-gray-500">No completed shots to present</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
                <div className="text-white">
                    <p className="text-sm text-gray-400">{currentScene?.slug_line}</p>
                    <p className="font-medium">
                        Shot {currentIndex + 1} of {shots.length}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center p-8">
                <img
                    src={currentShot.proxy_path || currentShot.gcs_path}
                    alt={`Shot ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                {/* Shot Info */}
                <div className="text-center mb-4">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                        {SHOT_TYPE_LABELS[currentShot.shot_type || 'medium']?.label || 'Medium Shot'}
                    </span>
                    <p className="text-gray-400 text-sm mt-2 max-w-2xl mx-auto">
                        {currentShot.description || currentShot.prompt}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1 max-w-4xl mx-auto mb-4">
                    {shots.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`flex-1 h-1 rounded-full transition-colors ${i === currentIndex ? 'bg-yellow-500' :
                                i < currentIndex ? 'bg-white/40' : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="p-3 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(prev => !prev)}
                        className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        onClick={() => setCurrentIndex(prev => Math.min(shots.length - 1, prev + 1))}
                        disabled={currentIndex === shots.length - 1}
                        className="p-3 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Shot Card Component
function ShotCard({
    shot,
    scene,
    index,
    onClick,
    onRegenerate
}: {
    shot: Shot;
    scene?: Scene;
    index: number;
    onClick: () => void;
    onRegenerate: () => void;
}) {
    const statusColors = {
        completed: 'bg-green-500',
        processing: 'bg-yellow-500 animate-pulse',
        pending: 'bg-gray-500',
        queued: 'bg-blue-500',
        failed: 'bg-red-500',
        ready: 'bg-green-500'
    };

    return (
        <div
            className="group relative bg-[#121212] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
            onClick={onClick}
        >
            {/* Image */}
            <div className="aspect-video bg-black relative">
                {shot.proxy_path || shot.gcs_path ? (
                    <img
                        src={shot.proxy_path || shot.gcs_path}
                        alt={`Shot ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                ) : shot.status === 'processing' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-yellow-500 mb-2" size={24} />
                        <span className="text-xs text-gray-500">Rendering...</span>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Camera size={32} />
                    </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusColors[shot.status]}`} />

                {/* Shot Number */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-mono text-white">
                    {SHOT_TYPE_LABELS[shot.shot_type || 'medium']?.abbrev || 'MED'}-{index + 1}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        <Eye size={18} />
                    </button>
                    {(shot.status === 'pending' || shot.status === 'failed') && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegenerate();
                            }}
                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-500 transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-sm text-white truncate">
                    {shot.description || shot.prompt?.slice(0, 50)}...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {SHOT_TYPE_LABELS[shot.shot_type || 'medium']?.label || 'Medium Shot'}
                </p>
            </div>
        </div>
    );
}

// Shot Detail Modal
function ShotDetailModal({
    shot,
    scene,
    onClose,
    onRegenerate
}: {
    shot: Shot;
    scene?: Scene;
    onClose: () => void;
    onRegenerate: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex">
                    {/* Image */}
                    <div className="flex-1 bg-black">
                        {shot.proxy_path || shot.gcs_path ? (
                            <img
                                src={shot.proxy_path || shot.gcs_path}
                                alt="Shot"
                                className="w-full h-auto"
                            />
                        ) : (
                            <div className="aspect-video flex items-center justify-center text-gray-600">
                                <Camera size={48} />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="w-80 p-6 border-l border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Shot Details</h3>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Scene</label>
                                <p className="text-white mt-1">{scene?.slug_line || 'Unknown'}</p>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Shot Type</label>
                                <p className="text-white mt-1">
                                    {SHOT_TYPE_LABELS[shot.shot_type || 'medium']?.label || 'Medium Shot'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {shot.status === 'completed' ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : shot.status === 'processing' ? (
                                        <Loader2 size={16} className="text-yellow-500 animate-spin" />
                                    ) : shot.status === 'failed' ? (
                                        <AlertCircle size={16} className="text-red-500" />
                                    ) : (
                                        <Clock size={16} className="text-gray-500" />
                                    )}
                                    <span className="text-white capitalize">{shot.status}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Prompt</label>
                                <p className="text-gray-300 text-sm mt-1">{shot.prompt}</p>
                            </div>

                            {shot.notes && (
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Notes</label>
                                    <p className="text-gray-300 text-sm mt-1">{shot.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <button
                                onClick={onRegenerate}
                                disabled={shot.status === 'processing'}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={16} />
                                Regenerate
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors">
                                <Download size={16} />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
