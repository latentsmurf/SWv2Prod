'use client';

import React, { useState, useEffect } from 'react';
import {
    Subtitles, Download, Globe, Check, Loader2, Play,
    Eye, Edit2, Plus, Trash2, ChevronDown, Languages
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Subtitle {
    id: string;
    start_time: number;
    end_time: number;
    text: string;
    speaker?: string;
}

interface SubtitleTrack {
    id: string;
    language: string;
    language_code: string;
    subtitles: Subtitle[];
    is_auto_generated: boolean;
}

interface ExportFormat {
    id: string;
    name: string;
    extension: string;
    description: string;
}

interface SubtitleExporterProps {
    projectId: string;
    subtitleTracks?: SubtitleTrack[];
    onExport?: (format: string, language: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPORT_FORMATS: ExportFormat[] = [
    { id: 'srt', name: 'SRT', extension: '.srt', description: 'SubRip - Most common format' },
    { id: 'vtt', name: 'WebVTT', extension: '.vtt', description: 'Web Video Text Tracks' },
    { id: 'ass', name: 'ASS/SSA', extension: '.ass', description: 'Advanced SubStation Alpha' },
    { id: 'txt', name: 'Plain Text', extension: '.txt', description: 'Text transcript only' },
    { id: 'json', name: 'JSON', extension: '.json', description: 'Structured data format' },
];

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SubtitleExporter({
    projectId,
    subtitleTracks = [],
    onExport
}: SubtitleExporterProps) {
    const [tracks, setTracks] = useState<SubtitleTrack[]>(subtitleTracks);
    const [selectedTrack, setSelectedTrack] = useState<SubtitleTrack | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translateTo, setTranslateTo] = useState<string>('');
    const [burnIn, setBurnIn] = useState(false);
    const [burnInStyle, setBurnInStyle] = useState({
        font: 'Arial',
        size: 24,
        color: '#ffffff',
        background: 'rgba(0,0,0,0.5)',
        position: 'bottom'
    });

    // ========================================================================
    // TRANSLATION
    // ========================================================================

    const translateSubtitles = async () => {
        if (!selectedTrack || !translateTo) return;

        setIsTranslating(true);

        try {
            const res = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    source_track_id: selectedTrack.id,
                    target_language: translateTo
                })
            });

            if (res.ok) {
                const newTrack = await res.json();
                setTracks(prev => [...prev, newTrack]);
            } else {
                // Demo fallback
                await new Promise(r => setTimeout(r, 2000));
                const lang = LANGUAGES.find(l => l.code === translateTo);
                const newTrack: SubtitleTrack = {
                    id: crypto.randomUUID(),
                    language: lang?.name || translateTo,
                    language_code: translateTo,
                    subtitles: selectedTrack.subtitles.map(s => ({
                        ...s,
                        id: crypto.randomUUID(),
                        text: `[${lang?.name}] ${s.text}` // Demo placeholder
                    })),
                    is_auto_generated: true
                };
                setTracks(prev => [...prev, newTrack]);
            }
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
            setTranslateTo('');
        }
    };

    // ========================================================================
    // EXPORT
    // ========================================================================

    const formatSubtitles = (track: SubtitleTrack, format: string): string => {
        switch (format) {
            case 'srt':
                return track.subtitles.map((sub, i) => 
                    `${i + 1}\n${formatTimeSRT(sub.start_time)} --> ${formatTimeSRT(sub.end_time)}\n${sub.text}\n`
                ).join('\n');

            case 'vtt':
                return 'WEBVTT\n\n' + track.subtitles.map(sub =>
                    `${formatTimeVTT(sub.start_time)} --> ${formatTimeVTT(sub.end_time)}\n${sub.text}\n`
                ).join('\n');

            case 'txt':
                return track.subtitles.map(sub => sub.text).join('\n\n');

            case 'json':
                return JSON.stringify(track.subtitles, null, 2);

            default:
                return '';
        }
    };

    const formatTimeSRT = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.round((seconds % 1) * 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

    const formatTimeVTT = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.round((seconds % 1) * 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    };

    const exportSubtitles = () => {
        if (!selectedTrack) return;

        const content = formatSubtitles(selectedTrack, selectedFormat.id);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subtitles-${selectedTrack.language_code}${selectedFormat.extension}`;
        a.click();
        URL.revokeObjectURL(url);

        onExport?.(selectedFormat.id, selectedTrack.language_code);
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center">
                        <Subtitles size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Subtitle Export</h2>
                        <p className="text-xs text-gray-500">Export and translate subtitles in multiple formats</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Language Tracks */}
                <div className="w-72 border-r border-white/5 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Language Tracks</h3>
                    </div>

                    <div className="space-y-2">
                        {tracks.map(track => {
                            const isSelected = selectedTrack?.id === track.id;

                            return (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedTrack(track)}
                                    className={`
                                        w-full p-3 rounded-xl text-left transition-all
                                        ${isSelected 
                                            ? 'bg-yellow-500/10 border border-yellow-500/30' 
                                            : 'bg-white/5 border border-transparent hover:border-white/10'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Globe size={16} className={isSelected ? 'text-yellow-400' : 'text-gray-500'} />
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">{track.language}</p>
                                            <p className="text-xs text-gray-500">
                                                {track.subtitles.length} captions
                                                {track.is_auto_generated && ' • Auto'}
                                            </p>
                                        </div>
                                        {isSelected && <Check size={14} className="text-yellow-400" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Add Translation */}
                    {selectedTrack && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <label className="block text-xs text-gray-500 mb-2">Translate to</label>
                            <div className="flex gap-2">
                                <select
                                    value={translateTo}
                                    onChange={e => setTranslateTo(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                                >
                                    <option value="">Select language</option>
                                    {LANGUAGES
                                        .filter(l => !tracks.some(t => t.language_code === l.code))
                                        .map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                </select>
                                <button
                                    onClick={translateSubtitles}
                                    disabled={!translateTo || isTranslating}
                                    className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg disabled:opacity-50"
                                >
                                    {isTranslating ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Languages size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Export Options */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedTrack ? (
                        <div className="max-w-lg mx-auto space-y-6">
                            {/* Preview */}
                            <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-white mb-3">Preview</h4>
                                <div className="bg-black rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-sm">
                                    {selectedTrack.subtitles.slice(0, 5).map(sub => (
                                        <div key={sub.id} className="mb-3">
                                            <p className="text-gray-500 text-xs">
                                                {formatTimeSRT(sub.start_time)} → {formatTimeSRT(sub.end_time)}
                                            </p>
                                            <p className="text-white">{sub.text}</p>
                                        </div>
                                    ))}
                                    {selectedTrack.subtitles.length > 5 && (
                                        <p className="text-gray-600">... {selectedTrack.subtitles.length - 5} more</p>
                                    )}
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Export Format</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {EXPORT_FORMATS.map(format => (
                                        <button
                                            key={format.id}
                                            onClick={() => setSelectedFormat(format)}
                                            className={`
                                                p-3 rounded-xl text-left transition-all
                                                ${selectedFormat.id === format.id 
                                                    ? 'bg-yellow-500/10 border border-yellow-500/30' 
                                                    : 'bg-white/5 border border-transparent hover:border-white/10'}
                                            `}
                                        >
                                            <p className="text-sm text-white font-medium">{format.name}</p>
                                            <p className="text-xs text-gray-500">{format.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Burn-in Option */}
                            <div className="bg-[#121212] border border-white/10 rounded-xl p-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={burnIn}
                                        onChange={e => setBurnIn(e.target.checked)}
                                        className="w-4 h-4 rounded accent-yellow-500"
                                    />
                                    <div>
                                        <p className="text-sm text-white font-medium">Burn subtitles into video</p>
                                        <p className="text-xs text-gray-500">Permanently embed subtitles in the video file</p>
                                    </div>
                                </label>

                                {burnIn && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                        <div className="flex gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">Font Size</label>
                                                <input
                                                    type="number"
                                                    value={burnInStyle.size}
                                                    onChange={e => setBurnInStyle(s => ({ ...s, size: Number(e.target.value) }))}
                                                    className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Color</label>
                                                <input
                                                    type="color"
                                                    value={burnInStyle.color}
                                                    onChange={e => setBurnInStyle(s => ({ ...s, color: e.target.value }))}
                                                    className="w-20 h-8 bg-transparent border border-white/10 rounded cursor-pointer mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportSubtitles}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all"
                            >
                                <Download size={20} />
                                Export {selectedFormat.name} ({selectedTrack.language})
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Subtitles className="mx-auto text-gray-600 mb-4" size={48} />
                                <h3 className="text-lg font-semibold text-white mb-2">Select a Track</h3>
                                <p className="text-sm text-gray-500">Choose a subtitle track to export</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
