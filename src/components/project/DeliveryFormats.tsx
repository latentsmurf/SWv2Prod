'use client';

import React, { useState } from 'react';
import { Monitor, Plus, Trash2, X, Check, Settings, Smartphone } from 'lucide-react';

interface DeliveryFormat {
    id: string;
    name: string;
    aspect_ratio: string;
    resolution: string;
    frame_rate: string;
    codec: string;
    container: string;
    color_space: string;
    bit_depth: string;
    audio_config: string;
    is_default: boolean;
    platform?: string;
    category?: 'film' | 'broadcast' | 'social' | 'micro-drama';
}

interface DeliveryFormatsProps {
    projectId: string;
    genre?: string; // To detect micro drama mode
}

// Micro Drama / Vertical Series Platform Presets
const MICRO_DRAMA_FORMATS: DeliveryFormat[] = [
    { id: 'reelshort', name: 'ReelShort / RealShort', aspect_ratio: '9:16', resolution: '1080x1920', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'ReelShort', category: 'micro-drama' },
    { id: 'dramabox', name: 'DramaBox', aspect_ratio: '9:16', resolution: '1080x1920', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'DramaBox', category: 'micro-drama' },
    { id: 'tiktok-series', name: 'TikTok Series', aspect_ratio: '9:16', resolution: '1080x1920', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'TikTok', category: 'micro-drama' },
    { id: 'youtube-shorts', name: 'YouTube Shorts', aspect_ratio: '9:16', resolution: '1080x1920', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'YouTube Shorts', category: 'micro-drama' },
    { id: 'instagram-reels', name: 'Instagram Reels', aspect_ratio: '9:16', resolution: '1080x1920', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'Instagram Reels', category: 'micro-drama' },
    { id: 'snapchat-spotlight', name: 'Snapchat Spotlight', aspect_ratio: '9:16', resolution: '1080x1920', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'Snapchat', category: 'micro-drama' },
    { id: 'micro-4k', name: 'Vertical 4K Master', aspect_ratio: '9:16', resolution: '2160x3840', frame_rate: '30fps', codec: 'ProRes 422', container: 'MOV', color_space: 'Rec.709', bit_depth: '10-bit', audio_config: 'Stereo', is_default: false, platform: 'Master', category: 'micro-drama' },
];

// Traditional Film & Broadcast Presets
const FILM_FORMATS: DeliveryFormat[] = [
    { id: 'theatrical', name: 'Theatrical DCP', aspect_ratio: '2.39:1', resolution: '4096x1716', frame_rate: '24fps', codec: 'JPEG2000', container: 'DCP', color_space: 'P3-DCI', bit_depth: '12-bit', audio_config: '5.1/7.1', is_default: false, platform: 'Cinema', category: 'film' },
    { id: 'netflix', name: 'Netflix 4K', aspect_ratio: '16:9', resolution: '3840x2160', frame_rate: '23.976fps', codec: 'ProRes 422 HQ', container: 'MOV', color_space: 'Rec.2020', bit_depth: '10-bit', audio_config: '5.1', is_default: false, platform: 'Netflix', category: 'film' },
    { id: 'youtube', name: 'YouTube HD', aspect_ratio: '16:9', resolution: '1920x1080', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'YouTube', category: 'social' },
    { id: 'instagram', name: 'Instagram Square', aspect_ratio: '1:1', resolution: '1080x1080', frame_rate: '30fps', codec: 'H.264', container: 'MP4', color_space: 'Rec.709', bit_depth: '8-bit', audio_config: 'Stereo', is_default: false, platform: 'Instagram', category: 'social' },
    { id: 'broadcast', name: 'Broadcast HD', aspect_ratio: '16:9', resolution: '1920x1080', frame_rate: '29.97fps', codec: 'ProRes 422', container: 'MOV', color_space: 'Rec.709', bit_depth: '10-bit', audio_config: '5.1', is_default: false, platform: 'Broadcast', category: 'broadcast' }
];

// Combined presets
const COMMON_FORMATS: DeliveryFormat[] = [...MICRO_DRAMA_FORMATS, ...FILM_FORMATS];

const ASPECT_RATIOS = ['16:9', '2.39:1', '2.35:1', '1.85:1', '4:3', '1:1', '9:16', '4:5'];
const RESOLUTIONS = ['7680x4320 (8K)', '4096x2160 (4K DCI)', '3840x2160 (4K UHD)', '2048x1080 (2K)', '1920x1080 (HD)', '1280x720 (720p)'];
const FRAME_RATES = ['23.976fps', '24fps', '25fps', '29.97fps', '30fps', '48fps', '50fps', '59.94fps', '60fps'];
const CODECS = ['ProRes 4444', 'ProRes 422 HQ', 'ProRes 422', 'DNxHR', 'H.264', 'H.265/HEVC', 'JPEG2000'];

export default function DeliveryFormats({ projectId, genre }: DeliveryFormatsProps) {
    // Detect micro drama mode and set appropriate defaults
    const isMicroDrama = genre?.startsWith('micro-');
    
    const [formats, setFormats] = useState<DeliveryFormat[]>(
        isMicroDrama 
            ? MICRO_DRAMA_FORMATS.slice(0, 3) 
            : FILM_FORMATS.slice(0, 3)
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPresetsModal, setShowPresetsModal] = useState(false);
    const [presetFilter, setPresetFilter] = useState<'all' | 'micro-drama' | 'film' | 'social'>(
        isMicroDrama ? 'micro-drama' : 'all'
    );

    const [form, setForm] = useState({
        name: '',
        aspect_ratio: '16:9',
        resolution: '1920x1080',
        frame_rate: '24fps',
        codec: 'ProRes 422',
        container: 'MOV',
        color_space: 'Rec.709',
        bit_depth: '10-bit',
        audio_config: '5.1',
        platform: ''
    });

    const addFormat = () => {
        const newFormat: DeliveryFormat = {
            id: crypto.randomUUID(),
            ...form,
            is_default: formats.length === 0
        };
        setFormats(prev => [...prev, newFormat]);
        setShowAddModal(false);
    };

    const addPreset = (preset: DeliveryFormat) => {
        if (!formats.find(f => f.id === preset.id)) {
            setFormats(prev => [...prev, { ...preset, id: crypto.randomUUID() }]);
        }
        setShowPresetsModal(false);
    };

    const deleteFormat = (id: string) => {
        setFormats(prev => prev.filter(f => f.id !== id));
    };

    const setDefault = (id: string) => {
        setFormats(prev => prev.map(f => ({ ...f, is_default: f.id === id })));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Monitor className="text-yellow-500" />
                        Delivery Formats
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure aspect ratios and export formats</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowPresetsModal(true)} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
                        Add Preset
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl">
                        <Plus size={18} />
                        Custom Format
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {formats.map(format => (
                    <div key={format.id} className={`bg-[#121212] border rounded-xl p-4 ${format.is_default ? 'border-yellow-500/50' : 'border-white/5'}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-white font-bold">{format.name}</h3>
                                {format.platform && <p className="text-sm text-gray-500">{format.platform}</p>}
                            </div>
                            {format.is_default && (
                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">Default</span>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Aspect</span><span className="text-white">{format.aspect_ratio}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Resolution</span><span className="text-white">{format.resolution}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Frame Rate</span><span className="text-white">{format.frame_rate}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Codec</span><span className="text-white">{format.codec}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Color</span><span className="text-white">{format.color_space}</span></div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                            {!format.is_default && (
                                <button onClick={() => setDefault(format.id)} className="text-xs text-gray-500 hover:text-yellow-400">
                                    Set as Default
                                </button>
                            )}
                            <button onClick={() => deleteFormat(format.id)} className="p-1.5 text-gray-500 hover:text-red-400 ml-auto">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Custom Delivery Format</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Format name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={form.aspect_ratio} onChange={(e) => setForm({...form, aspect_ratio: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    {ASPECT_RATIOS.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                                </select>
                                <select value={form.resolution} onChange={(e) => setForm({...form, resolution: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    {RESOLUTIONS.map(r => <option key={r} value={r.split(' ')[0]}>{r}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select value={form.frame_rate} onChange={(e) => setForm({...form, frame_rate: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    {FRAME_RATES.map(fr => <option key={fr} value={fr}>{fr}</option>)}
                                </select>
                                <select value={form.codec} onChange={(e) => setForm({...form, codec: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                                    {CODECS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                            <button onClick={addFormat} disabled={!form.name} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50">Add Format</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Presets Modal */}
            {showPresetsModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add Preset Format</h3>
                            <button onClick={() => setShowPresetsModal(false)} className="p-2 text-gray-500 hover:text-white"><X size={20} /></button>
                        </div>
                        
                        {/* Category Filter Tabs */}
                        <div className="px-6 pt-4 flex gap-2">
                            {[
                                { id: 'all', label: 'All', color: 'yellow' },
                                { id: 'micro-drama', label: '📱 Micro Drama', color: 'pink' },
                                { id: 'film', label: '🎬 Film/TV', color: 'blue' },
                                { id: 'social', label: '📲 Social', color: 'purple' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setPresetFilter(tab.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        presetFilter === tab.id
                                            ? tab.id === 'micro-drama' 
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-yellow-500 text-black'
                                            : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                            {COMMON_FORMATS
                                .filter(preset => presetFilter === 'all' || preset.category === presetFilter)
                                .map(preset => (
                                <button key={preset.id} onClick={() => addPreset(preset)} className={`text-left p-4 rounded-xl transition-colors ${
                                    preset.category === 'micro-drama' 
                                        ? 'bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20' 
                                        : 'bg-white/5 hover:bg-white/10 border border-white/5'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-white font-bold">{preset.name}</p>
                                        {preset.category === 'micro-drama' && (
                                            <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-bold rounded">9:16</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{preset.resolution} • {preset.frame_rate}</p>
                                    <p className="text-xs text-gray-600 mt-1">{preset.codec} • {preset.color_space}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
