'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Play, Pause, ZoomIn, ZoomOut, ChevronDown, Image,
    Film, Music, Mic, Clock, MoreHorizontal, Move
} from 'lucide-react';
import { Scene, Shot } from '@/types';

interface TimelineTrack {
    id: string;
    type: 'video' | 'audio' | 'voiceover' | 'music';
    label: string;
    color: string;
    items: TimelineItem[];
}

interface TimelineItem {
    id: string;
    start: number; // in seconds
    duration: number;
    label: string;
    thumbnail?: string;
    color?: string;
}

interface TimelineOverviewProps {
    scenes: Scene[];
    shots: Shot[];
    totalDuration?: number;
    currentTime?: number;
    onSeek?: (time: number) => void;
    onShotClick?: (shot: Shot) => void;
}

const TRACK_CONFIG = {
    video: { icon: Image, color: 'bg-purple-500', label: 'Video' },
    audio: { icon: Film, color: 'bg-blue-500', label: 'Audio' },
    voiceover: { icon: Mic, color: 'bg-green-500', label: 'Voice Over' },
    music: { icon: Music, color: 'bg-yellow-500', label: 'Music' },
};

export default function TimelineOverview({
    scenes,
    shots,
    totalDuration = 120,
    currentTime = 0,
    onSeek,
    onShotClick
}: TimelineOverviewProps) {
    const [zoom, setZoom] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [expandedTracks, setExpandedTracks] = useState<string[]>(['video']);
    const timelineRef = useRef<HTMLDivElement>(null);
    const playheadRef = useRef<HTMLDivElement>(null);

    // Calculate pixel width per second based on zoom
    const pixelsPerSecond = 50 * zoom;
    const timelineWidth = totalDuration * pixelsPerSecond;

    // Generate time markers
    const timeMarkers: number[] = [];
    const markerInterval = zoom >= 2 ? 5 : zoom >= 1 ? 10 : 30;
    for (let t = 0; t <= totalDuration; t += markerInterval) {
        timeMarkers.push(t);
    }

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Build tracks from data
    const tracks: TimelineTrack[] = [
        {
            id: 'video',
            type: 'video',
            label: 'Shots',
            color: 'bg-purple-500',
            items: shots.map((shot, index) => ({
                id: shot.id,
                start: index * 3, // Assume 3 seconds per shot for demo
                duration: 3,
                label: `Shot ${shot.shot_number}`,
                thumbnail: shot.gcs_path || shot.proxy_path,
            }))
        },
        {
            id: 'voiceover',
            type: 'voiceover',
            label: 'Voice Over',
            color: 'bg-green-500',
            items: scenes.map((scene, index) => ({
                id: `vo-${scene.id}`,
                start: index * 15,
                duration: 12,
                label: scene.slug_line || `Scene ${index + 1}`,
            }))
        },
        {
            id: 'music',
            type: 'music',
            label: 'Music',
            color: 'bg-yellow-500',
            items: [
                { id: 'music-1', start: 0, duration: totalDuration, label: 'Background Score' }
            ]
        }
    ];

    // Handle timeline click for seeking
    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollLeft;
        const time = x / pixelsPerSecond;
        onSeek?.(Math.max(0, Math.min(totalDuration, time)));
    };

    // Handle scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
    };

    // Toggle track expansion
    const toggleTrack = (trackId: string) => {
        setExpandedTracks(prev => 
            prev.includes(trackId) 
                ? prev.filter(id => id !== trackId)
                : [...prev, trackId]
        );
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Film className="text-yellow-500" size={18} />
                        Timeline Overview
                    </h3>
                    <span className="text-sm text-gray-500">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ZoomIn size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="flex">
                {/* Track Labels */}
                <div className="w-40 flex-shrink-0 border-r border-white/5">
                    {/* Time ruler spacer */}
                    <div className="h-8 border-b border-white/5" />
                    
                    {/* Track headers */}
                    {tracks.map((track) => {
                        const config = TRACK_CONFIG[track.type];
                        const Icon = config.icon;
                        const isExpanded = expandedTracks.includes(track.id);

                        return (
                            <div
                                key={track.id}
                                className="border-b border-white/5"
                            >
                                <button
                                    onClick={() => toggleTrack(track.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5"
                                >
                                    <ChevronDown
                                        size={14}
                                        className={`text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                    />
                                    <div className={`w-2 h-2 rounded-full ${config.color}`} />
                                    <Icon size={14} className="text-gray-400" />
                                    <span className="text-sm text-white">{track.label}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Timeline Area */}
                <div
                    className="flex-1 overflow-x-auto overflow-y-hidden"
                    onScroll={handleScroll}
                >
                    <div style={{ width: timelineWidth, minWidth: '100%' }}>
                        {/* Time Ruler */}
                        <div
                            ref={timelineRef}
                            className="h-8 border-b border-white/5 relative cursor-pointer"
                            onClick={handleTimelineClick}
                        >
                            {timeMarkers.map((time) => (
                                <div
                                    key={time}
                                    className="absolute top-0 bottom-0 border-l border-white/10"
                                    style={{ left: time * pixelsPerSecond }}
                                >
                                    <span className="absolute top-1 left-1 text-[10px] text-gray-500">
                                        {formatTime(time)}
                                    </span>
                                </div>
                            ))}

                            {/* Playhead */}
                            <div
                                ref={playheadRef}
                                className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                                style={{ left: currentTime * pixelsPerSecond }}
                            >
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-500 rotate-45" />
                            </div>
                        </div>

                        {/* Tracks */}
                        {tracks.map((track) => {
                            const config = TRACK_CONFIG[track.type];
                            const isExpanded = expandedTracks.includes(track.id);

                            return (
                                <div
                                    key={track.id}
                                    className={`border-b border-white/5 relative ${isExpanded ? 'h-16' : 'h-8'} transition-all`}
                                >
                                    {/* Background grid */}
                                    {timeMarkers.map((time) => (
                                        <div
                                            key={time}
                                            className="absolute top-0 bottom-0 border-l border-white/5"
                                            style={{ left: time * pixelsPerSecond }}
                                        />
                                    ))}

                                    {/* Track items */}
                                    {track.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`absolute top-1 bottom-1 rounded-lg ${config.color} opacity-80 hover:opacity-100 cursor-pointer flex items-center gap-2 px-2 overflow-hidden transition-all`}
                                            style={{
                                                left: item.start * pixelsPerSecond,
                                                width: item.duration * pixelsPerSecond - 2
                                            }}
                                            onClick={() => {
                                                const shot = shots.find(s => s.id === item.id);
                                                if (shot) onShotClick?.(shot);
                                            }}
                                        >
                                            {/* Thumbnail for video track */}
                                            {track.type === 'video' && item.thumbnail && isExpanded && (
                                                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-xs text-white font-medium truncate">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Playhead line */}
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10 pointer-events-none"
                                        style={{ left: currentTime * pixelsPerSecond }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Scene Markers */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {scenes.map((scene, index) => (
                        <button
                            key={scene.id}
                            onClick={() => onSeek?.(index * 15)}
                            className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white"
                        >
                            Scene {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Compact mini timeline for headers
export function MiniTimeline({
    totalDuration,
    currentTime,
    onSeek
}: {
    totalDuration: number;
    currentTime: number;
    onSeek?: (time: number) => void;
}) {
    const progress = (currentTime / totalDuration) * 100;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * totalDuration;
        onSeek?.(time);
    };

    return (
        <div
            className="h-1 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={handleClick}
        >
            <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${progress}%` }}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
        </div>
    );
}
