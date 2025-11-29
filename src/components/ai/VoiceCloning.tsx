'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, Play, Pause, Upload, Trash2, Check, X, Volume2,
    Users, Plus, Loader2, Wand2, Download, RefreshCw
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Voice {
    id: string;
    name: string;
    character_id?: string;
    preview_url?: string;
    type: 'cloned' | 'preset' | 'generated';
    gender?: 'male' | 'female' | 'neutral';
    age?: 'young' | 'adult' | 'elderly';
    accent?: string;
    created_at: string;
}

interface VoiceGenerationJob {
    id: string;
    voice_id: string;
    text: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    audio_url?: string;
    error?: string;
}

interface VoiceCloningProps {
    projectId: string;
    onVoiceSelect?: (voice: Voice) => void;
    onAudioGenerated?: (url: string) => void;
}

// ============================================================================
// PRESET VOICES
// ============================================================================

const PRESET_VOICES: Voice[] = [
    { id: 'preset-1', name: 'Sarah', type: 'preset', gender: 'female', age: 'adult', accent: 'American', created_at: '' },
    { id: 'preset-2', name: 'Michael', type: 'preset', gender: 'male', age: 'adult', accent: 'American', created_at: '' },
    { id: 'preset-3', name: 'Emma', type: 'preset', gender: 'female', age: 'young', accent: 'British', created_at: '' },
    { id: 'preset-4', name: 'James', type: 'preset', gender: 'male', age: 'adult', accent: 'British', created_at: '' },
    { id: 'preset-5', name: 'Sofia', type: 'preset', gender: 'female', age: 'adult', accent: 'Spanish', created_at: '' },
    { id: 'preset-6', name: 'David', type: 'preset', gender: 'male', age: 'elderly', accent: 'American', created_at: '' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VoiceCloning({
    projectId,
    onVoiceSelect,
    onAudioGenerated
}: VoiceCloningProps) {
    const [voices, setVoices] = useState<Voice[]>(PRESET_VOICES);
    const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
    const [textToSpeak, setTextToSpeak] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCloneModal, setShowCloneModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [cloneName, setCloneName] = useState('');
    const [isCloning, setIsCloning] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ========================================================================
    // VOICE GENERATION
    // ========================================================================

    const generateSpeech = async () => {
        if (!selectedVoice || !textToSpeak.trim()) return;

        setIsGenerating(true);
        setGeneratedAudio(null);

        try {
            const res = await fetch('/api/ai/voice/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voice_id: selectedVoice.id,
                    text: textToSpeak,
                    project_id: projectId
                })
            });

            if (res.ok) {
                const data = await res.json();
                setGeneratedAudio(data.audio_url);
                onAudioGenerated?.(data.audio_url);
            } else {
                // Demo fallback
                await new Promise(r => setTimeout(r, 2000));
                setGeneratedAudio('/sounds/placeholder.mp3');
            }
        } catch (error) {
            console.error('Error generating speech:', error);
            // Demo fallback
            await new Promise(r => setTimeout(r, 2000));
            setGeneratedAudio('/sounds/placeholder.mp3');
        } finally {
            setIsGenerating(false);
        }
    };

    // ========================================================================
    // VOICE CLONING
    // ========================================================================

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            setUploadedFile(file);
        }
    };

    const cloneVoice = async () => {
        if (!uploadedFile || !cloneName.trim()) return;

        setIsCloning(true);

        try {
            const formData = new FormData();
            formData.append('audio', uploadedFile);
            formData.append('name', cloneName);
            formData.append('project_id', projectId);

            const res = await fetch('/api/ai/voice/clone', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const voice = await res.json();
                setVoices(prev => [...prev, voice]);
                setSelectedVoice(voice);
            } else {
                // Demo fallback
                await new Promise(r => setTimeout(r, 3000));
                const newVoice: Voice = {
                    id: crypto.randomUUID(),
                    name: cloneName,
                    type: 'cloned',
                    created_at: new Date().toISOString()
                };
                setVoices(prev => [...prev, newVoice]);
                setSelectedVoice(newVoice);
            }

            setShowCloneModal(false);
            setUploadedFile(null);
            setCloneName('');
        } catch (error) {
            console.error('Error cloning voice:', error);
        } finally {
            setIsCloning(false);
        }
    };

    // ========================================================================
    // AUDIO PLAYBACK
    // ========================================================================

    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const playPreview = (voice: Voice) => {
        if (voice.preview_url) {
            const audio = new Audio(voice.preview_url);
            audio.play();
        }
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
                            <Mic size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Voice Studio</h2>
                            <p className="text-xs text-gray-500">Clone voices or use presets for voiceovers</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCloneModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-colors"
                    >
                        <Plus size={16} />
                        Clone Voice
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Voice List */}
                <div className="w-72 border-r border-white/5 overflow-y-auto p-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                        Available Voices
                    </h3>
                    <div className="space-y-2">
                        {voices.map(voice => {
                            const isSelected = selectedVoice?.id === voice.id;

                            return (
                                <button
                                    key={voice.id}
                                    onClick={() => {
                                        setSelectedVoice(voice);
                                        onVoiceSelect?.(voice);
                                    }}
                                    className={`
                                        w-full p-3 rounded-xl text-left transition-all
                                        ${isSelected 
                                            ? 'bg-blue-500/10 border border-blue-500/30' 
                                            : 'bg-white/5 border border-transparent hover:border-white/10'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center
                                            ${voice.type === 'cloned' ? 'bg-purple-500/20' : 'bg-blue-500/20'}
                                        `}>
                                            <Mic size={16} className={voice.type === 'cloned' ? 'text-purple-400' : 'text-blue-400'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{voice.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{voice.gender || 'Unknown'}</span>
                                                {voice.accent && <span>• {voice.accent}</span>}
                                            </div>
                                        </div>
                                        {voice.preview_url && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    playPreview(voice);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded"
                                            >
                                                <Play size={12} />
                                            </button>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Generation Panel */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {selectedVoice ? (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Selected Voice Info */}
                            <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center
                                        ${selectedVoice.type === 'cloned' ? 'bg-purple-500/20' : 'bg-blue-500/20'}
                                    `}>
                                        <Mic size={20} className={selectedVoice.type === 'cloned' ? 'text-purple-400' : 'text-blue-400'} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{selectedVoice.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedVoice.type === 'cloned' ? 'Cloned Voice' : 'Preset Voice'}
                                            {selectedVoice.gender && ` • ${selectedVoice.gender}`}
                                            {selectedVoice.accent && ` • ${selectedVoice.accent}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Text Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Text to Speak
                                </label>
                                <textarea
                                    value={textToSpeak}
                                    onChange={e => setTextToSpeak(e.target.value)}
                                    placeholder="Enter the text you want to convert to speech..."
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                                />
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>{textToSpeak.length} characters</span>
                                    <span>~{Math.ceil(textToSpeak.split(' ').length / 150)} min</span>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={generateSpeech}
                                disabled={!textToSpeak.trim() || isGenerating}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} />
                                        Generate Speech
                                    </>
                                )}
                            </button>

                            {/* Generated Audio Player */}
                            {generatedAudio && (
                                <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={togglePlayback}
                                            className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white"
                                        >
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">Generated Audio</p>
                                            <p className="text-xs text-gray-500">Click to preview</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const a = document.createElement('a');
                                                a.href = generatedAudio;
                                                a.download = 'voiceover.mp3';
                                                a.click();
                                            }}
                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                    <audio
                                        ref={audioRef}
                                        src={generatedAudio}
                                        onEnded={() => setIsPlaying(false)}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Mic className="mx-auto text-gray-600 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-white mb-2">Select a Voice</h3>
                                <p className="text-sm text-gray-500">Choose a preset voice or clone your own</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Clone Voice Modal */}
            {showCloneModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Clone a Voice</h3>
                            <button onClick={() => setShowCloneModal(false)} className="p-2 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Voice Name</label>
                                <input
                                    type="text"
                                    value={cloneName}
                                    onChange={e => setCloneName(e.target.value)}
                                    placeholder="e.g., Character Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Audio Sample</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors"
                                >
                                    {uploadedFile ? (
                                        <div className="flex items-center justify-center gap-2 text-green-400">
                                            <Check size={20} />
                                            {uploadedFile.name}
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto text-gray-600 mb-2" size={24} />
                                            <p className="text-sm text-gray-400">Upload audio file (30s - 3min recommended)</p>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                For best results, use a clear recording with minimal background noise.
                            </p>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowCloneModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button
                                onClick={cloneVoice}
                                disabled={!uploadedFile || !cloneName.trim() || isCloning}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl disabled:opacity-50"
                            >
                                {isCloning ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Cloning...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={16} />
                                        Clone Voice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
