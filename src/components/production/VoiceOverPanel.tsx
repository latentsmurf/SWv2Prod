'use client';

import React, { useState, useEffect } from 'react';
import {
    Mic, Play, Pause, Download, Loader2, Volume2, RefreshCw,
    Trash2, Upload, Wand2, Check, ChevronDown, ChevronRight
} from 'lucide-react';
import { Scene, Shot } from '@/types';

interface VoiceOverPanelProps {
    projectId: string;
    scenes: Scene[];
    shots: Shot[];
    onVoiceOverGenerated?: (sceneId: string, audioUrl: string) => void;
}

interface VoiceOverTrack {
    id: string;
    scene_id: string;
    text: string;
    audio_url?: string;
    voice_id: string;
    status: 'pending' | 'generating' | 'ready' | 'failed';
    duration?: number;
}

interface Voice {
    id: string;
    name: string;
    preview_url?: string;
    gender: 'male' | 'female' | 'neutral';
    accent?: string;
    description?: string;
}

const SAMPLE_VOICES: Voice[] = [
    { id: 'narrator_male', name: 'James (Narrator)', gender: 'male', accent: 'American', description: 'Deep, authoritative' },
    { id: 'narrator_female', name: 'Sarah (Narrator)', gender: 'female', accent: 'American', description: 'Warm, engaging' },
    { id: 'commercial_male', name: 'Mike (Commercial)', gender: 'male', accent: 'American', description: 'Energetic, friendly' },
    { id: 'commercial_female', name: 'Emily (Commercial)', gender: 'female', accent: 'American', description: 'Bright, persuasive' },
    { id: 'documentary_male', name: 'David (Documentary)', gender: 'male', accent: 'British', description: 'Calm, informative' },
    { id: 'documentary_female', name: 'Emma (Documentary)', gender: 'female', accent: 'British', description: 'Elegant, thoughtful' },
];

export default function VoiceOverPanel({ projectId, scenes, shots, onVoiceOverGenerated }: VoiceOverPanelProps) {
    const [tracks, setTracks] = useState<VoiceOverTrack[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('narrator_male');
    const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});

    // Initialize tracks from scenes
    useEffect(() => {
        const newTracks: VoiceOverTrack[] = scenes.map(scene => ({
            id: `vo_${scene.id}`,
            scene_id: scene.id,
            text: extractDialogue(scene.script_text || ''),
            voice_id: selectedVoice,
            status: 'pending'
        }));
        setTracks(newTracks);
    }, [scenes, selectedVoice]);

    // Extract dialogue from scene script
    const extractDialogue = (scriptText: string): string => {
        // Extract text that appears to be dialogue or action descriptions
        // This is a simplified version - could be enhanced with proper script parsing
        const lines = scriptText.split('\n');
        const narrativeLines: string[] = [];
        
        let isDialogue = false;
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines and scene headings
            if (!trimmed || trimmed.startsWith('INT.') || trimmed.startsWith('EXT.')) {
                continue;
            }
            
            // Skip character names (all caps)
            if (trimmed === trimmed.toUpperCase() && trimmed.length < 40) {
                isDialogue = true;
                continue;
            }
            
            // Skip parentheticals
            if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
                continue;
            }
            
            // Include dialogue and action
            if (isDialogue || !trimmed.match(/^[A-Z]/)) {
                narrativeLines.push(trimmed);
                isDialogue = false;
            }
        }
        
        return narrativeLines.join(' ').slice(0, 500); // Limit text length
    };

    // Generate voice-over for a single track
    const generateVoiceOver = async (track: VoiceOverTrack) => {
        setTracks(prev => prev.map(t => 
            t.id === track.id ? { ...t, status: 'generating' } : t
        ));

        try {
            const response = await fetch('/api/generate/voiceover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    scene_id: track.scene_id,
                    text: track.text,
                    voice_id: track.voice_id
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTracks(prev => prev.map(t => 
                    t.id === track.id ? { 
                        ...t, 
                        status: 'ready', 
                        audio_url: data.audio_url,
                        duration: data.duration 
                    } : t
                ));
                onVoiceOverGenerated?.(track.scene_id, data.audio_url);
            } else {
                throw new Error('Generation failed');
            }
        } catch (error) {
            console.error('Error generating voice-over:', error);
            setTracks(prev => prev.map(t => 
                t.id === track.id ? { ...t, status: 'failed' } : t
            ));
        }
    };

    // Generate all voice-overs
    const generateAll = async () => {
        setIsGeneratingAll(true);
        
        for (const track of tracks) {
            if (track.status === 'pending' || track.status === 'failed') {
                await generateVoiceOver(track);
                // Small delay between generations
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        setIsGeneratingAll(false);
    };

    // Play/pause audio
    const togglePlayback = (track: VoiceOverTrack) => {
        if (!track.audio_url) return;

        if (playingTrackId === track.id) {
            audioElements[track.id]?.pause();
            setPlayingTrackId(null);
        } else {
            // Stop any currently playing
            Object.values(audioElements).forEach(audio => audio.pause());
            
            // Play this track
            let audio = audioElements[track.id];
            if (!audio) {
                audio = new Audio(track.audio_url);
                audio.onended = () => setPlayingTrackId(null);
                setAudioElements(prev => ({ ...prev, [track.id]: audio }));
            }
            audio.play();
            setPlayingTrackId(track.id);
        }
    };

    const readyCount = tracks.filter(t => t.status === 'ready').length;
    const totalCount = tracks.length;

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Mic className="text-yellow-500" />
                            Voice-Over
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {readyCount}/{totalCount} tracks ready
                        </p>
                    </div>

                    <button
                        onClick={generateAll}
                        disabled={isGeneratingAll || tracks.every(t => t.status === 'ready')}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isGeneratingAll ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                Generate All
                            </>
                        )}
                    </button>
                </div>

                {/* Voice Selection */}
                <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-400">Voice:</label>
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    >
                        {SAMPLE_VOICES.map(voice => (
                            <option key={voice.id} value={voice.id}>
                                {voice.name} - {voice.description}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {tracks.length === 0 ? (
                    <div className="text-center py-20">
                        <Mic className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No scenes to generate voice-over for.</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Create scenes in Pre-Production first.
                        </p>
                    </div>
                ) : (
                    tracks.map((track, index) => {
                        const scene = scenes.find(s => s.id === track.scene_id);
                        const isExpanded = expandedSceneId === track.scene_id;
                        
                        return (
                            <div 
                                key={track.id}
                                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden"
                            >
                                {/* Track Header */}
                                <div 
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5"
                                    onClick={() => setExpandedSceneId(isExpanded ? null : track.scene_id)}
                                >
                                    <button className="text-gray-400">
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            Scene {index + 1}: {scene?.slug_line || 'Untitled'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {track.text.slice(0, 60)}...
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                        track.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                                        track.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                                        track.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {track.status === 'generating' && <Loader2 size={12} className="inline animate-spin mr-1" />}
                                        {track.status}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {track.status === 'ready' && track.audio_url && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    togglePlayback(track);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                                            >
                                                {playingTrackId === track.id ? (
                                                    <Pause size={16} />
                                                ) : (
                                                    <Play size={16} />
                                                )}
                                            </button>
                                        )}
                                        
                                        {(track.status === 'pending' || track.status === 'failed') && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    generateVoiceOver(track);
                                                }}
                                                className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-yellow-500 transition-colors"
                                            >
                                                <Wand2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
                                        {/* Text Editor */}
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-2">
                                                Voice-Over Text
                                            </label>
                                            <textarea
                                                value={track.text}
                                                onChange={(e) => setTracks(prev => prev.map(t =>
                                                    t.id === track.id ? { ...t, text: e.target.value } : t
                                                ))}
                                                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-yellow-500/50"
                                                placeholder="Enter the voice-over script..."
                                            />
                                        </div>

                                        {/* Audio Preview */}
                                        {track.audio_url && (
                                            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                                                <button
                                                    onClick={() => togglePlayback(track)}
                                                    className="p-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full transition-colors"
                                                >
                                                    {playingTrackId === track.id ? (
                                                        <Pause size={20} />
                                                    ) : (
                                                        <Play size={20} />
                                                    )}
                                                </button>
                                                
                                                <div className="flex-1">
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-yellow-500 w-0" />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>0:00</span>
                                                        <span>{track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '--:--'}</span>
                                                    </div>
                                                </div>

                                                <a
                                                    href={track.audio_url}
                                                    download
                                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Download size={18} />
                                                </a>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => generateVoiceOver(track)}
                                                disabled={track.status === 'generating'}
                                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {track.status === 'generating' ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : track.status === 'ready' ? (
                                                    <RefreshCw size={16} />
                                                ) : (
                                                    <Wand2 size={16} />
                                                )}
                                                {track.status === 'ready' ? 'Regenerate' : 'Generate'}
                                            </button>

                                            <label className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer">
                                                <Upload size={16} />
                                                Upload
                                                <input type="file" accept="audio/*" className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
