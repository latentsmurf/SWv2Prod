'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Subtitles, Plus, Trash2, Play, Pause, SkipBack, SkipForward,
    Download, Upload, Loader2, Check, X, Type, Clock, Globe,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic
} from 'lucide-react';

interface Subtitle {
    id: string;
    start_time: number; // in seconds
    end_time: number;
    text: string;
    speaker?: string;
    style?: SubtitleStyle;
}

interface SubtitleStyle {
    alignment: 'left' | 'center' | 'right';
    bold: boolean;
    italic: boolean;
    color?: string;
}

interface SubtitleTrack {
    id: string;
    language: string;
    language_code: string;
    subtitles: Subtitle[];
    is_default: boolean;
}

interface SubtitleEditorProps {
    projectId: string;
    videoDuration: number;
    onSubtitlesChange?: (tracks: SubtitleTrack[]) => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
];

export default function SubtitleEditor({
    projectId,
    videoDuration,
    onSubtitlesChange
}: SubtitleEditorProps) {
    const [tracks, setTracks] = useState<SubtitleTrack[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [generating, setGenerating] = useState(false);

    const timelineRef = useRef<HTMLDivElement>(null);

    // Fetch subtitle tracks
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/subtitles`);
                if (res.ok) {
                    const data = await res.json();
                    setTracks(data);
                    if (data.length > 0) {
                        setSelectedTrack(data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching subtitles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [projectId]);

    // Get current track
    const currentTrack = tracks.find(t => t.id === selectedTrack);

    // Add new track
    const addTrack = async (languageCode: string) => {
        const language = LANGUAGES.find(l => l.code === languageCode);
        if (!language) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/subtitles/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: language.name,
                    language_code: languageCode
                })
            });

            if (res.ok) {
                const newTrack = await res.json();
                setTracks(prev => [...prev, newTrack]);
                setSelectedTrack(newTrack.id);
            }
        } catch (error) {
            console.error('Error adding track:', error);
        }
    };

    // Add subtitle
    const addSubtitle = () => {
        if (!currentTrack) return;

        const newSubtitle: Subtitle = {
            id: crypto.randomUUID(),
            start_time: currentTime,
            end_time: Math.min(currentTime + 3, videoDuration),
            text: '',
            style: { alignment: 'center', bold: false, italic: false }
        };

        const updatedTracks = tracks.map(track =>
            track.id === selectedTrack
                ? { ...track, subtitles: [...track.subtitles, newSubtitle].sort((a, b) => a.start_time - b.start_time) }
                : track
        );

        setTracks(updatedTracks);
        setSelectedSubtitle(newSubtitle.id);
        onSubtitlesChange?.(updatedTracks);
    };

    // Update subtitle
    const updateSubtitle = (subtitleId: string, updates: Partial<Subtitle>) => {
        const updatedTracks = tracks.map(track =>
            track.id === selectedTrack
                ? {
                    ...track,
                    subtitles: track.subtitles.map(sub =>
                        sub.id === subtitleId ? { ...sub, ...updates } : sub
                    ).sort((a, b) => a.start_time - b.start_time)
                }
                : track
        );

        setTracks(updatedTracks);
        onSubtitlesChange?.(updatedTracks);
    };

    // Delete subtitle
    const deleteSubtitle = (subtitleId: string) => {
        const updatedTracks = tracks.map(track =>
            track.id === selectedTrack
                ? { ...track, subtitles: track.subtitles.filter(sub => sub.id !== subtitleId) }
                : track
        );

        setTracks(updatedTracks);
        setSelectedSubtitle(null);
        onSubtitlesChange?.(updatedTracks);
    };

    // Auto-generate subtitles
    const generateSubtitles = async () => {
        if (!selectedTrack) return;

        setGenerating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/subtitles/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ track_id: selectedTrack })
            });

            if (res.ok) {
                const generated = await res.json();
                setTracks(prev => prev.map(track =>
                    track.id === selectedTrack ? { ...track, subtitles: generated.subtitles } : track
                ));
            }
        } catch (error) {
            console.error('Error generating subtitles:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Export subtitles
    const exportSubtitles = async (format: 'srt' | 'vtt' | 'ass') => {
        if (!selectedTrack) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/subtitles/${selectedTrack}/export?format=${format}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `subtitles_${currentTrack?.language_code}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    // Parse time input
    const parseTime = (timeStr: string): number => {
        const [mins, rest] = timeStr.split(':');
        const [secs, ms] = rest?.split('.') || ['0', '0'];
        return parseInt(mins || '0') * 60 + parseInt(secs || '0') + parseInt(ms || '0') / 100;
    };

    const selectedSub = currentTrack?.subtitles.find(s => s.id === selectedSubtitle);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Subtitles className="text-yellow-500" />
                        Subtitle Editor
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={generateSubtitles}
                            disabled={generating || !selectedTrack}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl disabled:opacity-50"
                        >
                            {generating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Type size={16} />
                            )}
                            Auto-Generate
                        </button>
                        <button
                            onClick={() => exportSubtitles('srt')}
                            disabled={!selectedTrack}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl disabled:opacity-50"
                        >
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Track Selector */}
                <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-500" />
                    <select
                        value={selectedTrack || ''}
                        onChange={(e) => setSelectedTrack(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                        {tracks.map(track => (
                            <option key={track.id} value={track.id}>
                                {track.language} ({track.language_code})
                            </option>
                        ))}
                    </select>
                    <select
                        onChange={(e) => {
                            if (e.target.value) addTrack(e.target.value);
                            e.target.value = '';
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-400 text-sm"
                    >
                        <option value="">+ Add Language</option>
                        {LANGUAGES.filter(l => !tracks.find(t => t.language_code === l.code)).map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Subtitle List */}
                <div className="w-80 border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                            {currentTrack?.subtitles.length || 0} subtitles
                        </span>
                        <button
                            onClick={addSubtitle}
                            disabled={!selectedTrack}
                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg text-sm disabled:opacity-50"
                        >
                            <Plus size={14} />
                            Add
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="mx-auto animate-spin text-yellow-500" size={24} />
                            </div>
                        ) : !currentTrack?.subtitles.length ? (
                            <div className="p-8 text-center">
                                <Subtitles className="mx-auto text-gray-600 mb-2" size={32} />
                                <p className="text-sm text-gray-500">No subtitles yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {currentTrack.subtitles.map((subtitle, index) => (
                                    <button
                                        key={subtitle.id}
                                        onClick={() => setSelectedSubtitle(subtitle.id)}
                                        className={`w-full text-left p-4 hover:bg-white/5 ${
                                            selectedSubtitle === subtitle.id ? 'bg-white/5' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-yellow-500 font-mono">
                                                #{index + 1}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {formatTime(subtitle.start_time)} → {formatTime(subtitle.end_time)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white line-clamp-2">
                                            {subtitle.text || '(empty)'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col">
                    {selectedSub ? (
                        <>
                            {/* Timing */}
                            <div className="p-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Start</label>
                                        <input
                                            type="text"
                                            value={formatTime(selectedSub.start_time)}
                                            onChange={(e) => updateSubtitle(selectedSub.id, { start_time: parseTime(e.target.value) })}
                                            className="w-28 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">End</label>
                                        <input
                                            type="text"
                                            value={formatTime(selectedSub.end_time)}
                                            onChange={(e) => updateSubtitle(selectedSub.id, { end_time: parseTime(e.target.value) })}
                                            className="w-28 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                        <span className="text-sm text-gray-400">
                                            {(selectedSub.end_time - selectedSub.start_time).toFixed(2)}s
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Style */}
                            <div className="p-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateSubtitle(selectedSub.id, {
                                            style: { ...selectedSub.style!, alignment: 'left' }
                                        })}
                                        className={`p-2 rounded ${
                                            selectedSub.style?.alignment === 'left'
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        <AlignLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => updateSubtitle(selectedSub.id, {
                                            style: { ...selectedSub.style!, alignment: 'center' }
                                        })}
                                        className={`p-2 rounded ${
                                            selectedSub.style?.alignment === 'center'
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        <AlignCenter size={16} />
                                    </button>
                                    <button
                                        onClick={() => updateSubtitle(selectedSub.id, {
                                            style: { ...selectedSub.style!, alignment: 'right' }
                                        })}
                                        className={`p-2 rounded ${
                                            selectedSub.style?.alignment === 'right'
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        <AlignRight size={16} />
                                    </button>
                                    <div className="w-px h-6 bg-white/10 mx-2" />
                                    <button
                                        onClick={() => updateSubtitle(selectedSub.id, {
                                            style: { ...selectedSub.style!, bold: !selectedSub.style?.bold }
                                        })}
                                        className={`p-2 rounded ${
                                            selectedSub.style?.bold
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        <Bold size={16} />
                                    </button>
                                    <button
                                        onClick={() => updateSubtitle(selectedSub.id, {
                                            style: { ...selectedSub.style!, italic: !selectedSub.style?.italic }
                                        })}
                                        className={`p-2 rounded ${
                                            selectedSub.style?.italic
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-white/5 text-gray-400'
                                        }`}
                                    >
                                        <Italic size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex-1 p-4">
                                <label className="block text-sm text-gray-400 mb-2">Subtitle Text</label>
                                <textarea
                                    value={selectedSub.text}
                                    onChange={(e) => updateSubtitle(selectedSub.id, { text: e.target.value })}
                                    placeholder="Enter subtitle text..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-none text-lg"
                                    style={{
                                        textAlign: selectedSub.style?.alignment || 'center',
                                        fontWeight: selectedSub.style?.bold ? 'bold' : 'normal',
                                        fontStyle: selectedSub.style?.italic ? 'italic' : 'normal'
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-white/5 flex items-center justify-between">
                                <button
                                    onClick={() => deleteSubtitle(selectedSub.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Subtitles className="mx-auto mb-4" size={48} />
                                <p>Select a subtitle to edit</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div
                ref={timelineRef}
                className="h-20 border-t border-white/5 bg-[#121212] relative"
            >
                {/* Time markers */}
                <div className="absolute inset-0 flex">
                    {Array.from({ length: Math.ceil(videoDuration / 10) }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0"
                            style={{ width: `${(10 / videoDuration) * 100}%` }}
                        >
                            <div className="h-2 border-l border-white/20" />
                            <span className="text-[10px] text-gray-600 ml-1">
                                {formatTime(i * 10)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Subtitle blocks */}
                <div className="absolute top-8 left-0 right-0 h-8">
                    {currentTrack?.subtitles.map((subtitle) => {
                        const left = (subtitle.start_time / videoDuration) * 100;
                        const width = ((subtitle.end_time - subtitle.start_time) / videoDuration) * 100;

                        return (
                            <button
                                key={subtitle.id}
                                onClick={() => setSelectedSubtitle(subtitle.id)}
                                className={`absolute h-full rounded px-1 text-xs overflow-hidden truncate ${
                                    selectedSubtitle === subtitle.id
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-blue-500/50 text-white'
                                }`}
                                style={{ left: `${left}%`, width: `${width}%` }}
                            >
                                {subtitle.text}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
