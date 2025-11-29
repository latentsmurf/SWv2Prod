'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Maximize, Download, ChevronLeft, ChevronRight, Clock,
    Film, Music, Layers, Settings, Loader2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Shot {
    id: string;
    scene_id?: string;
    thumbnail_url?: string;
    video_url?: string;
    urls?: {
        high_res?: string;
        proxy?: string;
    };
    duration?: number;
    order?: number;
    shot_number?: number;
    description?: string;
}

interface AudioTrack {
    id: string;
    name: string;
    url: string;
    type: 'music' | 'voiceover' | 'sfx';
    start_time: number;
    duration: number;
    volume: number;
}

interface TimelinePreviewProps {
    projectId: string;
    shots: Shot[];
    audioTracks?: AudioTrack[];
    onExportAnimatic?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TimelinePreview({
    projectId,
    shots,
    audioTracks = [],
    onExportAnimatic
}: TimelinePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [currentShotIndex, setCurrentShotIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    // Calculate total duration
    useEffect(() => {
        const total = shots.reduce((sum, shot) => sum + (shot.duration || 3), 0);
        setDuration(total);
    }, [shots]);

    // Update current shot based on time
    useEffect(() => {
        let accumulated = 0;
        for (let i = 0; i < shots.length; i++) {
            accumulated += shots[i].duration || 3;
            if (currentTime < accumulated) {
                setCurrentShotIndex(i);
                break;
            }
        }
    }, [currentTime, shots]);

    // Playback timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isPlaying && currentTime < duration) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + (0.1 * playbackSpeed);
                    if (next >= duration) {
                        setIsPlaying(false);
                        return duration;
                    }
                    return next;
                });
            }, 100);
        }

        return () => clearInterval(interval);
    }, [isPlaying, duration, playbackSpeed]);

    // ========================================================================
    // CONTROLS
    // ========================================================================

    const togglePlay = () => {
        if (currentTime >= duration) {
            setCurrentTime(0);
        }
        setIsPlaying(!isPlaying);
    };

    const skipToShot = (index: number) => {
        let time = 0;
        for (let i = 0; i < index; i++) {
            time += shots[i]?.duration || 3;
        }
        setCurrentTime(time);
        setCurrentShotIndex(index);
    };

    const previousShot = () => {
        if (currentShotIndex > 0) {
            skipToShot(currentShotIndex - 1);
        }
    };

    const nextShot = () => {
        if (currentShotIndex < shots.length - 1) {
            skipToShot(currentShotIndex + 1);
        }
    };

    const seekTo = (time: number) => {
        setCurrentTime(Math.max(0, Math.min(time, duration)));
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seekTo(percent * duration);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const exportAnimatic = async () => {
        setIsExporting(true);
        try {
            // Call export API
            const res = await fetch(`/api/projects/${projectId}/export/animatic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shots: shots.map(s => s.id),
                    include_audio: audioTracks.length > 0
                })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animatic-${Date.now()}.mp4`;
                a.click();
                URL.revokeObjectURL(url);
            }

            onExportAnimatic?.();
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // ========================================================================
    // HELPERS
    // ========================================================================

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getShotAtTime = (time: number): Shot | null => {
        let accumulated = 0;
        for (const shot of shots) {
            accumulated += shot.duration || 3;
            if (time < accumulated) {
                return shot;
            }
        }
        return shots[shots.length - 1] || null;
    };

    const currentShot = shots[currentShotIndex];

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div 
            ref={containerRef}
            className="h-full flex flex-col bg-black"
        >
            {/* Preview Area */}
            <div className="flex-1 relative flex items-center justify-center bg-[#0a0a0a]">
                {currentShot ? (
                    currentShot.video_url ? (
                        <video
                            ref={videoRef}
                            src={currentShot.video_url}
                            className="max-h-full max-w-full object-contain"
                            muted={isMuted}
                        />
                    ) : currentShot.thumbnail_url ? (
                        <img
                            src={currentShot.thumbnail_url}
                            alt={currentShot.description || ''}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <Film className="text-gray-600" size={48} />
                        </div>
                    )
                ) : (
                    <div className="text-center">
                        <Film className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No shots to preview</p>
                    </div>
                )}

                {/* Shot Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <p className="text-xs text-gray-400">Shot {currentShotIndex + 1} of {shots.length}</p>
                    <p className="text-sm text-white truncate max-w-xs">
                        {currentShot?.description || 'Untitled shot'}
                    </p>
                </div>

                {/* Playback Speed */}
                {playbackSpeed !== 1 && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                        <p className="text-sm text-white">{playbackSpeed}x</p>
                    </div>
                )}
            </div>

            {/* Timeline Strip */}
            <div className="h-24 bg-[#121212] border-t border-white/10">
                <div className="flex h-16 overflow-x-auto scrollbar-hide">
                    {shots.map((shot, i) => {
                        const isActive = i === currentShotIndex;
                        const widthPercent = ((shot.duration || 3) / duration) * 100;

                        return (
                            <button
                                key={shot.id}
                                onClick={() => skipToShot(i)}
                                className={`
                                    relative flex-shrink-0 h-full border-r border-white/10 overflow-hidden
                                    transition-all
                                    ${isActive ? 'ring-2 ring-pink-500 ring-inset' : 'hover:brightness-110'}
                                `}
                                style={{ width: `${Math.max(widthPercent, 5)}%`, minWidth: 60 }}
                            >
                                {shot.thumbnail_url ? (
                                    <img 
                                        src={shot.thumbnail_url} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <Film size={16} className="text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1">
                                    <p className="text-[10px] text-white truncate">{i + 1}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div 
                    className="h-2 bg-white/5 cursor-pointer group"
                    onClick={handleProgressClick}
                >
                    <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Controls */}
                <div className="h-6 flex items-center justify-between px-4 bg-black/40">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={previousShot}
                            disabled={currentShotIndex === 0}
                            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                        >
                            <SkipBack size={14} />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full mx-2"
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                            onClick={nextShot}
                            disabled={currentShotIndex === shots.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                        >
                            <SkipForward size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Speed */}
                        <select
                            value={playbackSpeed}
                            onChange={e => setPlaybackSpeed(Number(e.target.value))}
                            className="bg-transparent text-xs text-gray-400 border-none focus:outline-none cursor-pointer"
                        >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                        </select>

                        {/* Volume */}
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            <Maximize size={14} />
                        </button>

                        {/* Export */}
                        <button
                            onClick={exportAnimatic}
                            disabled={isExporting || shots.length === 0}
                            className="flex items-center gap-1 px-2 py-1 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 rounded text-xs disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <Download size={12} />
                            )}
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
