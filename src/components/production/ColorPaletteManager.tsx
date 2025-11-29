'use client';

import React, { useState, useEffect } from 'react';
import {
    Palette, Plus, Trash2, Copy, Check, Eye, Pipette,
    Download, Upload, Loader2, Sparkles, ChevronDown
} from 'lucide-react';

interface ColorPalette {
    id: string;
    name: string;
    colors: string[];
    project_id?: string;
    is_global: boolean;
    created_at: string;
}

interface ColorPaletteManagerProps {
    projectId?: string;
    onSelectPalette?: (palette: ColorPalette) => void;
    onApplyColor?: (color: string) => void;
}

const PRESET_PALETTES: Omit<ColorPalette, 'id' | 'created_at'>[] = [
    {
        name: 'Cinematic Warm',
        colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A1A2E'],
        is_global: true
    },
    {
        name: 'Noir',
        colors: ['#0D0D0D', '#1A1A1A', '#2D2D2D', '#FFFFFF', '#B8860B'],
        is_global: true
    },
    {
        name: 'Neon Cyberpunk',
        colors: ['#FF00FF', '#00FFFF', '#FF006E', '#8338EC', '#0A0A0A'],
        is_global: true
    },
    {
        name: 'Natural Earth',
        colors: ['#2D572C', '#5D8C52', '#8B7355', '#D4A574', '#F5DEB3'],
        is_global: true
    },
    {
        name: 'Ocean Depth',
        colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
        is_global: true
    },
    {
        name: 'Sunset Glow',
        colors: ['#FF595E', '#FF924C', '#FFCA3A', '#8AC926', '#1982C4'],
        is_global: true
    },
];

export default function ColorPaletteManager({
    projectId,
    onSelectPalette,
    onApplyColor
}: ColorPaletteManagerProps) {
    const [palettes, setPalettes] = useState<ColorPalette[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newPalette, setNewPalette] = useState({
        name: '',
        colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF']
    });
    const [generating, setGenerating] = useState(false);

    // Fetch palettes
    useEffect(() => {
        const fetchPalettes = async () => {
            try {
                let url = '/api/color-palettes';
                if (projectId) url += `?project_id=${projectId}`;
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setPalettes(data);
                }
            } catch (error) {
                console.error('Error fetching palettes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPalettes();
    }, [projectId]);

    // Copy color to clipboard
    const copyColor = (color: string) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    // Create palette
    const createPalette = async () => {
        if (!newPalette.name) return;

        try {
            const res = await fetch('/api/color-palettes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newPalette,
                    project_id: projectId,
                    is_global: !projectId
                })
            });

            if (res.ok) {
                const created = await res.json();
                setPalettes(prev => [...prev, created]);
                setShowCreate(false);
                setNewPalette({
                    name: '',
                    colors: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF']
                });
            }
        } catch (error) {
            console.error('Error creating palette:', error);
        }
    };

    // Delete palette
    const deletePalette = async (id: string) => {
        try {
            await fetch(`/api/color-palettes/${id}`, { method: 'DELETE' });
            setPalettes(prev => prev.filter(p => p.id !== id));
            if (selectedPalette === id) setSelectedPalette(null);
        } catch (error) {
            console.error('Error deleting palette:', error);
        }
    };

    // Generate palette from image
    const generateFromImage = async (imageUrl: string) => {
        setGenerating(true);
        try {
            const res = await fetch('/api/color-palettes/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: imageUrl })
            });

            if (res.ok) {
                const { colors } = await res.json();
                setNewPalette(prev => ({ ...prev, colors }));
            }
        } catch (error) {
            console.error('Error extracting colors:', error);
        } finally {
            setGenerating(false);
        }
    };

    // AI generate palette from prompt
    const generateFromPrompt = async (prompt: string) => {
        setGenerating(true);
        try {
            const res = await fetch('/api/color-palettes/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (res.ok) {
                const { colors, name } = await res.json();
                setNewPalette({ name: name || 'AI Generated', colors });
            }
        } catch (error) {
            console.error('Error generating palette:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Update color in new palette
    const updateColor = (index: number, color: string) => {
        setNewPalette(prev => ({
            ...prev,
            colors: prev.colors.map((c, i) => i === index ? color : c)
        }));
    };

    // Add color to palette
    const addColor = () => {
        if (newPalette.colors.length < 10) {
            setNewPalette(prev => ({
                ...prev,
                colors: [...prev.colors, '#808080']
            }));
        }
    };

    // Remove color from palette
    const removeColor = (index: number) => {
        if (newPalette.colors.length > 2) {
            setNewPalette(prev => ({
                ...prev,
                colors: prev.colors.filter((_, i) => i !== index)
            }));
        }
    };

    const allPalettes = [
        ...PRESET_PALETTES.map((p, i) => ({ ...p, id: `preset-${i}`, created_at: '' })),
        ...palettes
    ];

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Palette className="text-yellow-500" />
                            Color Palettes
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Define color schemes for your project
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
                    >
                        <Plus size={18} />
                        New Palette
                    </button>
                </div>
            </div>

            {/* Palettes Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {allPalettes.map((palette) => (
                            <div
                                key={palette.id}
                                className={`bg-[#121212] border rounded-xl overflow-hidden transition-all cursor-pointer ${
                                    selectedPalette === palette.id
                                        ? 'border-yellow-500 ring-2 ring-yellow-500/30'
                                        : 'border-white/5 hover:border-white/20'
                                }`}
                                onClick={() => {
                                    setSelectedPalette(palette.id);
                                    onSelectPalette?.(palette as ColorPalette);
                                }}
                            >
                                {/* Color Preview */}
                                <div className="flex h-16">
                                    {palette.colors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 relative group"
                                            style={{ backgroundColor: color }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyColor(color);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                                            >
                                                {copiedColor === color ? (
                                                    <Check size={14} className="text-white" />
                                                ) : (
                                                    <Copy size={14} className="text-white" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Info */}
                                <div className="p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-white">{palette.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {palette.colors.length} colors
                                            {palette.is_global && ' • Global'}
                                        </p>
                                    </div>
                                    {!palette.id.startsWith('preset-') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deletePalette(palette.id);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Palette Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Create Color Palette</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Palette Name</label>
                                <input
                                    type="text"
                                    value={newPalette.name}
                                    onChange={(e) => setNewPalette(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Sunset Vibes"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white"
                                />
                            </div>

                            {/* Colors */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Colors</label>
                                <div className="flex flex-wrap gap-2">
                                    {newPalette.colors.map((color, index) => (
                                        <div key={index} className="relative group">
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => updateColor(index, e.target.value)}
                                                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/10"
                                            />
                                            <button
                                                onClick={() => removeColor(index)}
                                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {newPalette.colors.length < 10 && (
                                        <button
                                            onClick={addColor}
                                            className="w-12 h-12 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center text-gray-500 hover:text-white"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* AI Generate */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const prompt = window.prompt('Describe the mood/theme for the palette:');
                                        if (prompt) generateFromPrompt(prompt);
                                    }}
                                    disabled={generating}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                >
                                    {generating ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    AI Generate
                                </button>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createPalette}
                                disabled={!newPalette.name}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg disabled:opacity-50"
                            >
                                Create Palette
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
