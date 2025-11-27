'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface StylePreset {
    id: string;
    name: string;
    thumbnail_url: string;
    description?: string;
}

export default function LooksPanel() {
    const [presets, setPresets] = useState<StylePreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPresets() {
            try {
                setLoading(true);
                const res = await fetch('/api/style_presets');
                if (res.ok) {
                    const data = await res.json();
                    setPresets(data);
                } else {
                    throw new Error('Failed to fetch presets');
                }
            } catch (err: any) {
                console.error('Error fetching presets:', err);
                // Fallback to mock data on error for UI demonstration
                setPresets([
                    { id: '1', name: 'Cinematic Teal', thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200' },
                    { id: '2', name: 'Noir Black & White', thumbnail_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=300&h=200' },
                ]);
                setError('Using offline presets');
            } finally {
                setLoading(false);
            }
        }

        fetchPresets();
    }, []);

    const handleSelect = async (preset: StylePreset) => {
        setSelectedId(preset.id);
        // Here we would update the project settings via API
        console.log('Selected preset:', preset.name);
        // await fetch(`/api/projects/${projectId}`, { method: 'PUT', body: JSON.stringify({ style_preset_id: preset.id }) });
    };

    return (
        <div className="bg-[#0a0a0a] border-l border-white/5 w-80 h-full flex flex-col">
            <div className="p-4 border-b border-white/5">
                <h2 className="font-semibold text-white tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Looks & Styles
                </h2>
                <p className="text-xs text-gray-500 mt-1">Select a visual style for your project</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="animate-spin text-yellow-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {presets.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() => handleSelect(preset)}
                                className={`group cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200
                  ${selectedId === preset.id
                                        ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                        : 'border-transparent hover:border-white/30'
                                    }
                `}
                            >
                                <img
                                    src={preset.thumbnail_url}
                                    alt={preset.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                    <span className="text-[10px] font-medium text-white truncate w-full">
                                        {preset.name}
                                    </span>
                                </div>
                                {selectedId === preset.id && (
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,1)]" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
