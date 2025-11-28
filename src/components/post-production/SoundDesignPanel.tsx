'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Volume2, Play, Pause, Plus, Trash2, Upload, Search,
    Loader2, Layers, Clock, Download, VolumeX,
    ChevronDown, Music, Mic, Zap, Wind, Footprints
} from 'lucide-react';

interface SoundEffect {
    id: string;
    name: string;
    category: string;
    duration: number;
    url: string;
    waveform_url?: string;
    tags: string[];
}

interface PlacedSound {
    id: string;
    sound_id: string;
    sound: SoundEffect;
    start_time: number;
    duration: number;
    volume: number;
    fade_in?: number;
    fade_out?: number;
    loop: boolean;
    track: number;
}

interface SoundDesignPanelProps {
    projectId: string;
    videoDuration: number;
    onSoundsChange?: (sounds: PlacedSound[]) => void;
}

const SOUND_CATEGORIES = [
    { id: 'ambience', label: 'Ambience', icon: Wind },
    { id: 'foley', label: 'Foley', icon: Footprints },
    { id: 'sfx', label: 'SFX', icon: Zap },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'dialogue', label: 'Dialogue', icon: Mic },
];

export default function SoundDesignPanel({
    projectId,
    videoDuration,
    onSoundsChange
}: SoundDesignPanelProps) {
    const [library, setLibrary] = useState<SoundEffect[]>([]);
    const [placedSounds, setPlacedSounds] = useState<PlacedSound[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSound, setSelectedSound] = useState<PlacedSound | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [zoom, setZoom] = useState(1);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Fetch sound library
    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const res = await fetch(`/api/sounds/library`);
                if (res.ok) {
                    setLibrary(await res.json());
                }
            } catch (error) {
                console.error('Error fetching library:', error);
            }
        };

        fetchLibrary();
    }, []);

    // Fetch placed sounds
    useEffect(() => {
        const fetchPlaced = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/sounds`);
                if (res.ok) {
                    setPlacedSounds(await res.json());
                }
            } catch (error) {
                console.error('Error fetching sounds:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaced();
    }, [projectId]);

    // Filter library
    const filteredLibrary = library.filter(sound => {
        if (selectedCategory !== 'all' && sound.category !== selectedCategory) return false;
        if (searchQuery && !sound.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Play sound preview
    const playSound = (url: string, id: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }

        if (playingId === id) {
            setPlayingId(null);
            return;
        }

        const audio = new Audio(url);
        audio.onended = () => setPlayingId(null);
        audio.play();
        audioRef.current = audio;
        setPlayingId(id);
    };

    // Add sound to timeline
    const addToTimeline = async (sound: SoundEffect) => {
        const newPlaced: PlacedSound = {
            id: crypto.randomUUID(),
            sound_id: sound.id,
            sound,
            start_time: currentTime,
            duration: sound.duration,
            volume: 1,
            loop: false,
            track: 0
        };

        // Find available track
        const tracks = [...new Set(placedSounds.map(s => s.track))];
        for (let t = 0; t <= tracks.length; t++) {
            const hasOverlap = placedSounds.some(s =>
                s.track === t &&
                newPlaced.start_time < s.start_time + s.duration &&
                newPlaced.start_time + newPlaced.duration > s.start_time
            );
            if (!hasOverlap) {
                newPlaced.track = t;
                break;
            }
        }

        const updated = [...placedSounds, newPlaced];
        setPlacedSounds(updated);
        onSoundsChange?.(updated);

        try {
            await fetch(`/api/projects/${projectId}/sounds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlaced)
            });
        } catch (error) {
            console.error('Error adding sound:', error);
        }
    };

    // Update placed sound
    const updatePlacedSound = (soundId: string, updates: Partial<PlacedSound>) => {
        const updated = placedSounds.map(s =>
            s.id === soundId ? { ...s, ...updates } : s
        );
        setPlacedSounds(updated);
        onSoundsChange?.(updated);
    };

    // Remove placed sound
    const removePlacedSound = async (soundId: string) => {
        const updated = placedSounds.filter(s => s.id !== soundId);
        setPlacedSounds(updated);
        setSelectedSound(null);
        onSoundsChange?.(updated);

        try {
            await fetch(`/api/projects/${projectId}/sounds/${soundId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error removing sound:', error);
        }
    };

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get tracks count
    const trackCount = Math.max(3, ...placedSounds.map(s => s.track + 1));

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Volume2 className="text-yellow-500" />
                        Sound Design
                    </h2>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white">
                            <Upload size={16} />
                            Import Sound
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Library */}
                <div className="w-80 border-r border-white/5 flex flex-col">
                    {/* Search & Filter */}
                    <div className="p-4 space-y-3 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search sounds..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-3 py-1 rounded-lg text-xs ${
                                    selectedCategory === 'all'
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-white/5 text-gray-400'
                                }`}
                            >
                                All
                            </button>
                            {SOUND_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${
                                        selectedCategory === cat.id
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-white/5 text-gray-400'
                                    }`}
                                >
                                    <cat.icon size={12} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sound List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredLibrary.length === 0 ? (
                            <div className="p-8 text-center">
                                <Volume2 className="mx-auto text-gray-600 mb-2" size={32} />
                                <p className="text-sm text-gray-500">No sounds found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredLibrary.map((sound) => (
                                    <div
                                        key={sound.id}
                                        className="p-3 hover:bg-white/5 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => playSound(sound.url, sound.id)}
                                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10"
                                            >
                                                {playingId === sound.id ? (
                                                    <Pause size={16} className="text-yellow-500" />
                                                ) : (
                                                    <Play size={16} className="text-gray-400" />
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{sound.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatTime(sound.duration)} • {sound.category}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => addToTimeline(sound)}
                                                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg opacity-0 group-hover:opacity-100"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline & Editor */}
                <div className="flex-1 flex flex-col">
                    {/* Sound Properties */}
                    {selectedSound && (
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">{selectedSound.sound.name}</h3>
                                <button
                                    onClick={() => removePlacedSound(selectedSound.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Volume</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedSound.volume}
                                        onChange={(e) => updatePlacedSound(selectedSound.id, { volume: parseFloat(e.target.value) })}
                                        className="w-full"
                                    />
                                    <span className="text-xs text-gray-400">{Math.round(selectedSound.volume * 100)}%</span>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                                    <input
                                        type="number"
                                        value={selectedSound.start_time.toFixed(2)}
                                        onChange={(e) => updatePlacedSound(selectedSound.id, { start_time: parseFloat(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                    <input
                                        type="number"
                                        value={selectedSound.duration.toFixed(2)}
                                        onChange={(e) => updatePlacedSound(selectedSound.id, { duration: parseFloat(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Loop</label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedSound.loop}
                                            onChange={(e) => updatePlacedSound(selectedSound.id, { loop: e.target.checked })}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm text-gray-400">Enabled</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="flex-1 overflow-auto" ref={timelineRef}>
                        {/* Time ruler */}
                        <div className="h-8 border-b border-white/5 flex sticky top-0 bg-[#0a0a0a] z-10">
                            {Array.from({ length: Math.ceil(videoDuration / 5) }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 border-l border-white/10"
                                    style={{ width: `${(5 / videoDuration) * 100 * zoom}%` }}
                                >
                                    <span className="text-[10px] text-gray-600 ml-1">
                                        {formatTime(i * 5)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Tracks */}
                        <div className="relative">
                            {Array.from({ length: trackCount }).map((_, trackIndex) => (
                                <div
                                    key={trackIndex}
                                    className="h-16 border-b border-white/5 relative"
                                >
                                    {/* Track label */}
                                    <div className="absolute left-0 top-0 w-12 h-full bg-[#121212] border-r border-white/5 flex items-center justify-center">
                                        <span className="text-xs text-gray-600">{trackIndex + 1}</span>
                                    </div>

                                    {/* Placed sounds */}
                                    {placedSounds
                                        .filter(s => s.track === trackIndex)
                                        .map((sound) => {
                                            const left = (sound.start_time / videoDuration) * 100 * zoom;
                                            const width = (sound.duration / videoDuration) * 100 * zoom;
                                            const category = SOUND_CATEGORIES.find(c => c.id === sound.sound.category);
                                            const Icon = category?.icon || Volume2;

                                            return (
                                                <button
                                                    key={sound.id}
                                                    onClick={() => setSelectedSound(sound)}
                                                    className={`absolute top-1 h-14 rounded-lg overflow-hidden ${
                                                        selectedSound?.id === sound.id
                                                            ? 'ring-2 ring-yellow-500'
                                                            : ''
                                                    }`}
                                                    style={{
                                                        left: `calc(${left}% + 3rem)`,
                                                        width: `${width}%`,
                                                        backgroundColor: `${
                                                            sound.sound.category === 'ambience' ? '#3B82F6' :
                                                            sound.sound.category === 'foley' ? '#22C55E' :
                                                            sound.sound.category === 'sfx' ? '#F97316' :
                                                            sound.sound.category === 'music' ? '#A855F7' :
                                                            '#6B7280'
                                                        }40`
                                                    }}
                                                >
                                                    <div className="h-full px-2 flex items-center gap-2">
                                                        <Icon size={14} className="text-white/70 flex-shrink-0" />
                                                        <span className="text-xs text-white truncate">
                                                            {sound.sound.name}
                                                        </span>
                                                    </div>
                                                    {/* Volume indicator */}
                                                    <div
                                                        className="absolute bottom-0 left-0 h-1 bg-white/30"
                                                        style={{ width: `${sound.volume * 100}%` }}
                                                    />
                                                </button>
                                            );
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zoom control */}
                    <div className="p-2 border-t border-white/5 flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-500">Zoom:</span>
                        <input
                            type="range"
                            min="0.5"
                            max="4"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-xs text-gray-400 w-12">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
