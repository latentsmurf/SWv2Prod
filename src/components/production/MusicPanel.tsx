'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Music, Play, Pause, Download, Loader2, Volume2, VolumeX,
    RefreshCw, Trash2, Plus, Wand2, Clock, SkipBack, SkipForward,
    Repeat, Shuffle, Heart, ChevronDown, ChevronRight, Sliders
} from 'lucide-react';
import { Scene } from '@/types';

interface MusicTrack {
    id: string;
    name: string;
    audio_url?: string;
    duration: number;
    genre: string;
    mood: string;
    tempo: number;
    status: 'pending' | 'generating' | 'ready' | 'failed';
    created_at: string;
    is_favorite?: boolean;
}

interface MusicPanelProps {
    projectId: string;
    scenes: Scene[];
    onTrackSelect?: (track: MusicTrack) => void;
}

const GENRES = [
    { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
    { id: 'electronic', name: 'Electronic', icon: '🎹' },
    { id: 'orchestral', name: 'Orchestral', icon: '🎻' },
    { id: 'ambient', name: 'Ambient', icon: '🌊' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'rock', name: 'Rock', icon: '🎸' },
    { id: 'acoustic', name: 'Acoustic', icon: '🪕' },
    { id: 'hiphop', name: 'Hip Hop', icon: '🎤' },
];

const MOODS = [
    { id: 'epic', name: 'Epic', color: 'text-red-400' },
    { id: 'tense', name: 'Tense', color: 'text-orange-400' },
    { id: 'uplifting', name: 'Uplifting', color: 'text-yellow-400' },
    { id: 'melancholic', name: 'Melancholic', color: 'text-blue-400' },
    { id: 'mysterious', name: 'Mysterious', color: 'text-purple-400' },
    { id: 'romantic', name: 'Romantic', color: 'text-pink-400' },
    { id: 'playful', name: 'Playful', color: 'text-green-400' },
    { id: 'dark', name: 'Dark', color: 'text-gray-400' },
];

export default function MusicPanel({ projectId, scenes, onTrackSelect }: MusicPanelProps) {
    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [showGenerator, setShowGenerator] = useState(false);
    
    // Generation form state
    const [selectedGenre, setSelectedGenre] = useState('cinematic');
    const [selectedMood, setSelectedMood] = useState('epic');
    const [targetDuration, setTargetDuration] = useState(60);
    const [tempo, setTempo] = useState(120);
    const [customPrompt, setCustomPrompt] = useState('');

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch existing tracks
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/music`);
                if (res.ok) {
                    const data = await res.json();
                    setTracks(data);
                }
            } catch (error) {
                console.error('Error fetching music tracks:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchTracks();
    }, [projectId]);

    // Audio playback controls
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const playTrack = (track: MusicTrack) => {
        if (!track.audio_url) return;

        if (playingTrackId === track.id) {
            audioRef.current?.pause();
            setPlayingTrackId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = track.audio_url;
                audioRef.current.play();
            }
            setPlayingTrackId(track.id);
            onTrackSelect?.(track);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        setPlayingTrackId(null);
        setCurrentTime(0);
    };

    // Generate new track
    const generateTrack = async () => {
        setGenerating(true);
        
        const genre = GENRES.find(g => g.id === selectedGenre);
        const mood = MOODS.find(m => m.id === selectedMood);
        
        const trackName = customPrompt 
            ? customPrompt.slice(0, 30) 
            : `${mood?.name} ${genre?.name} Score`;

        try {
            const res = await fetch(`/api/projects/${projectId}/music/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genre: selectedGenre,
                    mood: selectedMood,
                    duration: targetDuration,
                    tempo,
                    prompt: customPrompt || `${mood?.name} ${genre?.name} music for film scene`,
                    name: trackName
                })
            });

            if (res.ok) {
                const newTrack = await res.json();
                setTracks(prev => [newTrack, ...prev]);
                setShowGenerator(false);
                setCustomPrompt('');
            }
        } catch (error) {
            console.error('Error generating track:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Delete track
    const deleteTrack = async (trackId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/music/${trackId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setTracks(prev => prev.filter(t => t.id !== trackId));
                if (playingTrackId === trackId) {
                    audioRef.current?.pause();
                    setPlayingTrackId(null);
                }
            }
        } catch (error) {
            console.error('Error deleting track:', error);
        }
    };

    // Toggle favorite
    const toggleFavorite = (trackId: string) => {
        setTracks(prev => prev.map(t => 
            t.id === trackId ? { ...t, is_favorite: !t.is_favorite } : t
        ));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentTrack = tracks.find(t => t.id === playingTrackId);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Music className="text-green-500" />
                            Music & Score
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {tracks.length} tracks • AI-generated soundtracks
                        </p>
                    </div>

                    <button
                        onClick={() => setShowGenerator(!showGenerator)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Generate Track
                    </button>
                </div>

                {/* Generator Panel */}
                {showGenerator && (
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4 space-y-4">
                        {/* Genre Selection */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">Genre</label>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map(genre => (
                                    <button
                                        key={genre.id}
                                        onClick={() => setSelectedGenre(genre.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                                            selectedGenre === genre.id
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <span>{genre.icon}</span>
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mood Selection */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">Mood</label>
                            <div className="flex flex-wrap gap-2">
                                {MOODS.map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setSelectedMood(mood.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                            selectedMood === mood.id
                                                ? `bg-white/10 ${mood.color} border border-current`
                                                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {mood.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration & Tempo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-2">
                                    Duration: {formatTime(targetDuration)}
                                </label>
                                <input
                                    type="range"
                                    min={15}
                                    max={180}
                                    value={targetDuration}
                                    onChange={(e) => setTargetDuration(Number(e.target.value))}
                                    className="w-full accent-green-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-2">
                                    Tempo: {tempo} BPM
                                </label>
                                <input
                                    type="range"
                                    min={60}
                                    max={180}
                                    value={tempo}
                                    onChange={(e) => setTempo(Number(e.target.value))}
                                    className="w-full accent-green-500"
                                />
                            </div>
                        </div>

                        {/* Custom Prompt */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-2">
                                Custom Description (optional)
                            </label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="Describe the music you want... e.g., 'Intense chase scene with driving drums and synths'"
                                className="w-full h-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 resize-none"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateTrack}
                            disabled={generating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    Generate Music
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-green-500" size={32} />
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="text-center py-20">
                        <Music className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No music tracks yet.</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Generate your first soundtrack above.
                        </p>
                    </div>
                ) : (
                    tracks.map((track) => {
                        const isPlaying = playingTrackId === track.id;
                        
                        return (
                            <div
                                key={track.id}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                                    isPlaying 
                                        ? 'bg-green-500/10 border border-green-500/30' 
                                        : 'bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 hover:border-white/20'
                                }`}
                            >
                                {/* Play Button */}
                                <button
                                    onClick={() => playTrack(track)}
                                    disabled={!track.audio_url || track.status !== 'ready'}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isPlaying
                                            ? 'bg-green-500 text-black'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                >
                                    {track.status === 'generating' ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : isPlaying ? (
                                        <Pause size={18} />
                                    ) : (
                                        <Play size={18} className="ml-0.5" />
                                    )}
                                </button>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {track.name}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                        <span className="capitalize">{track.genre}</span>
                                        <span>•</span>
                                        <span className="capitalize">{track.mood}</span>
                                        <span>•</span>
                                        <span>{track.tempo} BPM</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatTime(track.duration)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar (when playing) */}
                                {isPlaying && track.audio_url && (
                                    <div className="w-24 flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {formatTime(currentTime)}
                                        </span>
                                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500 transition-all"
                                                style={{ width: `${(currentTime / track.duration) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleFavorite(track.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            track.is_favorite
                                                ? 'text-red-400 bg-red-500/10'
                                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Heart size={16} fill={track.is_favorite ? 'currentColor' : 'none'} />
                                    </button>
                                    
                                    {track.audio_url && (
                                        <a
                                            href={track.audio_url}
                                            download
                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Download size={16} />
                                        </a>
                                    )}
                                    
                                    <button
                                        onClick={() => deleteTrack(track.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Now Playing Bar */}
            {currentTrack && (
                <div className="p-4 border-t border-white/5 bg-[#121212]">
                    <div className="flex items-center gap-4">
                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {currentTrack.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {currentTrack.genre} • {currentTrack.mood}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <SkipBack size={18} />
                            </button>
                            
                            <button
                                onClick={() => playTrack(currentTrack)}
                                className="p-3 bg-green-500 text-black rounded-full hover:bg-green-400 transition-colors"
                            >
                                {playingTrackId ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                            </button>
                            
                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        audioRef.current.currentTime = Math.min(
                                            audioRef.current.duration,
                                            audioRef.current.currentTime + 10
                                        );
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <SkipForward size={18} />
                            </button>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(Number(e.target.value));
                                    setIsMuted(false);
                                }}
                                className="w-20 accent-green-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
