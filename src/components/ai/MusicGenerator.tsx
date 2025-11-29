'use client';

import React, { useState, useRef } from 'react';
import {
    Music, Play, Pause, Download, RefreshCw, Wand2,
    Clock, Volume2, Sliders, Loader2, Plus, Trash2,
    ChevronDown, Check, X
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface GeneratedTrack {
    id: string;
    name: string;
    url: string;
    duration: number;
    mood: string;
    genre: string;
    tempo: number;
    created_at: string;
}

interface MusicGeneratorProps {
    projectId: string;
    sceneMood?: string;
    onTrackSelect?: (track: GeneratedTrack) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MOODS = [
    { id: 'dramatic', label: 'Dramatic', color: 'bg-red-500/10 text-red-400' },
    { id: 'romantic', label: 'Romantic', color: 'bg-pink-500/10 text-pink-400' },
    { id: 'tense', label: 'Tense', color: 'bg-orange-500/10 text-orange-400' },
    { id: 'happy', label: 'Happy', color: 'bg-yellow-500/10 text-yellow-400' },
    { id: 'sad', label: 'Sad', color: 'bg-blue-500/10 text-blue-400' },
    { id: 'mysterious', label: 'Mysterious', color: 'bg-purple-500/10 text-purple-400' },
    { id: 'epic', label: 'Epic', color: 'bg-indigo-500/10 text-indigo-400' },
    { id: 'peaceful', label: 'Peaceful', color: 'bg-green-500/10 text-green-400' },
];

const GENRES = [
    { id: 'cinematic', label: 'Cinematic' },
    { id: 'electronic', label: 'Electronic' },
    { id: 'orchestral', label: 'Orchestral' },
    { id: 'acoustic', label: 'Acoustic' },
    { id: 'ambient', label: 'Ambient' },
    { id: 'pop', label: 'Pop' },
    { id: 'rock', label: 'Rock' },
    { id: 'jazz', label: 'Jazz' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MusicGenerator({
    projectId,
    sceneMood,
    onTrackSelect
}: MusicGeneratorProps) {
    const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    
    // Generation settings
    const [selectedMood, setSelectedMood] = useState(sceneMood || 'dramatic');
    const [selectedGenre, setSelectedGenre] = useState('cinematic');
    const [duration, setDuration] = useState(60);
    const [tempo, setTempo] = useState(100);
    const [prompt, setPrompt] = useState('');

    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // ========================================================================
    // GENERATION
    // ========================================================================

    const generateMusic = async () => {
        setIsGenerating(true);

        try {
            const res = await fetch('/api/ai/music/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    mood: selectedMood,
                    genre: selectedGenre,
                    duration,
                    tempo,
                    prompt: prompt || `${selectedMood} ${selectedGenre} music`
                })
            });

            if (res.ok) {
                const track = await res.json();
                setGeneratedTracks(prev => [track, ...prev]);
            } else {
                // Demo fallback
                await new Promise(r => setTimeout(r, 3000));
                const demoTrack: GeneratedTrack = {
                    id: crypto.randomUUID(),
                    name: `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} ${selectedGenre} Track`,
                    url: '/sounds/placeholder.mp3',
                    duration,
                    mood: selectedMood,
                    genre: selectedGenre,
                    tempo,
                    created_at: new Date().toISOString()
                };
                setGeneratedTracks(prev => [demoTrack, ...prev]);
            }
        } catch (error) {
            console.error('Error generating music:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // ========================================================================
    // PLAYBACK
    // ========================================================================

    const togglePlayback = (track: GeneratedTrack) => {
        const audio = audioRefs.current[track.id];
        
        if (playingTrackId === track.id) {
            audio?.pause();
            setPlayingTrackId(null);
        } else {
            // Pause any currently playing
            Object.values(audioRefs.current).forEach(a => a?.pause());
            
            if (!audio) {
                const newAudio = new Audio(track.url);
                newAudio.onended = () => setPlayingTrackId(null);
                audioRefs.current[track.id] = newAudio;
                newAudio.play();
            } else {
                audio.play();
            }
            setPlayingTrackId(track.id);
        }
    };

    const deleteTrack = (trackId: string) => {
        audioRefs.current[trackId]?.pause();
        delete audioRefs.current[trackId];
        setGeneratedTracks(prev => prev.filter(t => t.id !== trackId));
        if (playingTrackId === trackId) setPlayingTrackId(null);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center">
                        <Music size={20} className="text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">AI Music Generator</h2>
                        <p className="text-xs text-gray-500">Generate custom soundtracks for your scenes</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Settings Panel */}
                <div className="w-80 border-r border-white/5 overflow-y-auto p-6 space-y-6">
                    {/* Mood Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Mood</label>
                        <div className="grid grid-cols-2 gap-2">
                            {MOODS.map(mood => (
                                <button
                                    key={mood.id}
                                    onClick={() => setSelectedMood(mood.id)}
                                    className={`
                                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                                        ${selectedMood === mood.id 
                                            ? mood.color + ' ring-1 ring-white/20' 
                                            : 'bg-white/5 text-gray-400 hover:text-white'}
                                    `}
                                >
                                    {mood.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Genre Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Genre</label>
                        <div className="grid grid-cols-2 gap-2">
                            {GENRES.map(genre => (
                                <button
                                    key={genre.id}
                                    onClick={() => setSelectedGenre(genre.id)}
                                    className={`
                                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                                        ${selectedGenre === genre.id 
                                            ? 'bg-white text-black' 
                                            : 'bg-white/5 text-gray-400 hover:text-white'}
                                    `}
                                >
                                    {genre.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400">Duration</label>
                            <span className="text-sm text-white">{formatDuration(duration)}</span>
                        </div>
                        <input
                            type="range"
                            min={15}
                            max={180}
                            step={15}
                            value={duration}
                            onChange={e => setDuration(Number(e.target.value))}
                            className="w-full accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>15s</span>
                            <span>3min</span>
                        </div>
                    </div>

                    {/* Tempo Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400">Tempo</label>
                            <span className="text-sm text-white">{tempo} BPM</span>
                        </div>
                        <input
                            type="range"
                            min={60}
                            max={180}
                            step={5}
                            value={tempo}
                            onChange={e => setTempo(Number(e.target.value))}
                            className="w-full accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Slow</span>
                            <span>Fast</span>
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Custom Prompt (optional)</label>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Describe the feeling you want..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none resize-none text-sm"
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generateMusic}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Generate Music
                            </>
                        )}
                    </button>
                </div>

                {/* Generated Tracks */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">
                        Generated Tracks ({generatedTracks.length})
                    </h3>

                    {generatedTracks.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Music className="mx-auto text-gray-600 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-white mb-2">No tracks yet</h3>
                                <p className="text-sm text-gray-500">Configure settings and generate your first track</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {generatedTracks.map(track => {
                                const isPlaying = playingTrackId === track.id;

                                return (
                                    <div
                                        key={track.id}
                                        className={`
                                            p-4 rounded-xl border transition-all
                                            ${isPlaying 
                                                ? 'bg-green-500/10 border-green-500/30' 
                                                : 'bg-[#121212] border-white/5 hover:border-white/20'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Play Button */}
                                            <button
                                                onClick={() => togglePlayback(track)}
                                                className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                                                    ${isPlaying 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-white/10 text-white hover:bg-white/20'}
                                                `}
                                            >
                                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                            </button>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white truncate">{track.name}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatDuration(track.duration)}
                                                    </span>
                                                    <span>{track.tempo} BPM</span>
                                                    <span className="capitalize">{track.mood}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onTrackSelect?.(track)}
                                                    className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg"
                                                    title="Use in timeline"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const a = document.createElement('a');
                                                        a.href = track.url;
                                                        a.download = `${track.name}.mp3`;
                                                        a.click();
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                                                    title="Download"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteTrack(track.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
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
        </div>
    );
}
