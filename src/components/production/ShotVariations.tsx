'use client';

import React, { useState, useEffect } from 'react';
import {
    Layers, RefreshCw, Check, X, Loader2, Copy, Sparkles,
    ArrowLeftRight, Eye, Trash2, Star, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Shot } from '@/types';

interface ShotVariation {
    id: string;
    shot_id: string;
    image_url: string;
    prompt_variation?: string;
    seed?: number;
    is_selected: boolean;
    created_at: string;
}

interface ShotVariationsProps {
    projectId: string;
    shot: Shot;
    onSelectVariation?: (variation: ShotVariation) => void;
    onClose?: () => void;
}

export default function ShotVariations({ projectId, shot, onSelectVariation, onClose }: ShotVariationsProps) {
    const [variations, setVariations] = useState<ShotVariation[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [compareMode, setCompareMode] = useState(false);
    const [compareItems, setCompareItems] = useState<[ShotVariation | null, ShotVariation | null]>([null, null]);
    const [variationPrompt, setVariationPrompt] = useState('');
    const [numVariations, setNumVariations] = useState(4);

    // Fetch existing variations
    useEffect(() => {
        const fetchVariations = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/shots/${shot.id}/variations`);
                if (res.ok) {
                    const data = await res.json();
                    setVariations(data);
                    
                    // Find selected variation
                    const selected = data.find((v: ShotVariation) => v.is_selected);
                    if (selected) {
                        setSelectedIds(new Set([selected.id]));
                    }
                }
            } catch (error) {
                console.error('Error fetching variations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVariations();
    }, [projectId, shot.id]);

    // Generate new variations
    const generateVariations = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shot.id}/variations/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    count: numVariations,
                    prompt_variation: variationPrompt || undefined
                })
            });

            if (res.ok) {
                const newVariations = await res.json();
                setVariations(prev => [...newVariations, ...prev]);
                setVariationPrompt('');
            }
        } catch (error) {
            console.error('Error generating variations:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Select a variation as the main shot
    const selectVariation = async (variation: ShotVariation) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shot.id}/variations/${variation.id}/select`, {
                method: 'POST'
            });

            if (res.ok) {
                setVariations(prev => prev.map(v => ({
                    ...v,
                    is_selected: v.id === variation.id
                })));
                setSelectedIds(new Set([variation.id]));
                onSelectVariation?.(variation);
            }
        } catch (error) {
            console.error('Error selecting variation:', error);
        }
    };

    // Delete a variation
    const deleteVariation = async (variationId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shot.id}/variations/${variationId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setVariations(prev => prev.filter(v => v.id !== variationId));
            }
        } catch (error) {
            console.error('Error deleting variation:', error);
        }
    };

    // Start A/B comparison
    const startCompare = (variation: ShotVariation) => {
        if (!compareMode) {
            setCompareMode(true);
            setCompareItems([variation, null]);
        } else if (!compareItems[1]) {
            setCompareItems([compareItems[0], variation]);
        }
    };

    // Exit compare mode
    const exitCompare = () => {
        setCompareMode(false);
        setCompareItems([null, null]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-purple-500" />
                            Shot Variations
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {shot.description || shot.prompt}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {compareMode ? (
                            <button
                                onClick={exitCompare}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                            >
                                <X size={16} />
                                Exit Compare
                            </button>
                        ) : (
                            <button
                                onClick={() => setCompareMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                            >
                                <ArrowLeftRight size={16} />
                                Compare
                            </button>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Compare Mode View */}
                {compareMode && (compareItems[0] || compareItems[1]) && (
                    <div className="p-6 border-b border-white/5 bg-purple-500/5">
                        <div className="grid grid-cols-2 gap-6">
                            {[0, 1].map((i) => {
                                const item = compareItems[i];
                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                                            {i === 0 ? 'Option A' : 'Option B'}
                                        </div>
                                        {item ? (
                                            <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
                                                <img
                                                    src={item.image_url}
                                                    alt={`Variation ${i + 1}`}
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    onClick={() => selectVariation(item)}
                                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Check size={16} />
                                                    Select This
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center text-gray-500">
                                                Click a variation below to compare
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Generation Controls */}
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={variationPrompt}
                                onChange={(e) => setVariationPrompt(e.target.value)}
                                placeholder="Optional: Describe variation (e.g., 'more dramatic lighting', 'wider angle')"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Count:</span>
                            <select
                                value={numVariations}
                                onChange={(e) => setNumVariations(Number(e.target.value))}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none"
                            >
                                <option value={2}>2</option>
                                <option value={4}>4</option>
                                <option value={6}>6</option>
                                <option value={8}>8</option>
                            </select>
                        </div>

                        <button
                            onClick={generateVariations}
                            disabled={generating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Variations Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="animate-spin text-purple-500" size={32} />
                        </div>
                    ) : variations.length === 0 ? (
                        <div className="text-center py-20">
                            <Layers className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-gray-500">No variations yet</p>
                            <p className="text-sm text-gray-600 mt-2">
                                Generate variations to explore different looks
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                            {/* Original Shot */}
                            <div className="relative group">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-yellow-500">
                                    {shot.gcs_path || shot.proxy_path ? (
                                        <img
                                            src={shot.proxy_path || shot.gcs_path}
                                            alt="Original"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            Original
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 rounded text-xs font-bold text-black">
                                        ORIGINAL
                                    </div>
                                </div>
                            </div>

                            {/* Variations */}
                            {variations.map((variation) => {
                                const isSelected = variation.is_selected;
                                
                                return (
                                    <div
                                        key={variation.id}
                                        className="relative group"
                                    >
                                        <div className={`aspect-video bg-black rounded-xl overflow-hidden border-2 transition-all ${
                                            isSelected
                                                ? 'border-green-500 shadow-lg shadow-green-500/20'
                                                : 'border-transparent hover:border-white/30'
                                        }`}>
                                            <img
                                                src={variation.image_url}
                                                alt="Variation"
                                                className="w-full h-full object-cover"
                                            />
                                            
                                            {/* Selected Badge */}
                                            {isSelected && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded text-xs font-bold text-black flex items-center gap-1">
                                                    <Check size={12} />
                                                    SELECTED
                                                </div>
                                            )}

                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {compareMode ? (
                                                    <button
                                                        onClick={() => startCompare(variation)}
                                                        className="p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg"
                                                        title="Add to compare"
                                                    >
                                                        <ArrowLeftRight size={18} />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => selectVariation(variation)}
                                                            className="p-2 bg-green-500 hover:bg-green-400 text-white rounded-lg"
                                                            title="Select as main"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => startCompare(variation)}
                                                            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg"
                                                            title="Compare"
                                                        >
                                                            <ArrowLeftRight size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteVariation(variation.id)}
                                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {variation.prompt_variation && (
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {variation.prompt_variation}
                                            </p>
                                        )}
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
