'use client';

import React, { useState, useEffect } from 'react';
import {
    Shirt, Users, MapPin, Plus, X, Check, Loader2, Sparkles,
    ChevronDown, ChevronRight, Edit2, Trash2, Copy, Eye
} from 'lucide-react';
import { Scene, Asset } from '@/types';

interface WardrobeAssignment {
    cast_id: string;
    wardrobe_id: string;
    scene_id?: string; // If null, it's the default for the project
}

interface WardrobeManagerProps {
    projectId: string;
    scenes: Scene[];
    castAssets: Asset[];
    wardrobeAssets: Asset[];
    onAssignmentsChange?: (assignments: WardrobeAssignment[]) => void;
}

export default function WardrobeManager({
    projectId,
    scenes,
    castAssets,
    wardrobeAssets,
    onAssignmentsChange
}: WardrobeManagerProps) {
    const [assignments, setAssignments] = useState<WardrobeAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCastId, setExpandedCastId] = useState<string | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatingForCast, setGeneratingForCast] = useState<string | null>(null);

    // Fetch existing assignments
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/wardrobe-assignments`);
                if (res.ok) {
                    const data = await res.json();
                    setAssignments(data);
                }
            } catch (error) {
                console.error('Error fetching wardrobe assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchAssignments();
    }, [projectId]);

    // Get wardrobe for a specific cast member in a specific scene (or default)
    const getWardrobeForCast = (castId: string, sceneId?: string): Asset | undefined => {
        // First try scene-specific assignment
        if (sceneId) {
            const sceneAssignment = assignments.find(
                a => a.cast_id === castId && a.scene_id === sceneId
            );
            if (sceneAssignment) {
                return wardrobeAssets.find(w => w.id === sceneAssignment.wardrobe_id);
            }
        }
        
        // Fall back to default assignment
        const defaultAssignment = assignments.find(
            a => a.cast_id === castId && !a.scene_id
        );
        if (defaultAssignment) {
            return wardrobeAssets.find(w => w.id === defaultAssignment.wardrobe_id);
        }
        
        return undefined;
    };

    // Assign wardrobe
    const assignWardrobe = async (castId: string, wardrobeId: string, sceneId?: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/wardrobe-assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cast_id: castId,
                    wardrobe_id: wardrobeId,
                    scene_id: sceneId
                })
            });

            if (res.ok) {
                const newAssignment = await res.json();
                setAssignments(prev => {
                    // Remove existing assignment for this cast/scene combo
                    const filtered = prev.filter(
                        a => !(a.cast_id === castId && a.scene_id === sceneId)
                    );
                    return [...filtered, newAssignment];
                });
                onAssignmentsChange?.(assignments);
            }
        } catch (error) {
            console.error('Error assigning wardrobe:', error);
        }
    };

    // Remove assignment
    const removeAssignment = async (castId: string, sceneId?: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/wardrobe-assignments`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cast_id: castId,
                    scene_id: sceneId
                })
            });

            if (res.ok) {
                setAssignments(prev => 
                    prev.filter(a => !(a.cast_id === castId && a.scene_id === sceneId))
                );
            }
        } catch (error) {
            console.error('Error removing assignment:', error);
        }
    };

    // Generate new wardrobe for cast
    const generateWardrobe = async (castId: string, prompt: string) => {
        setGeneratingForCast(castId);
        try {
            const cast = castAssets.find(c => c.id === castId);
            const fullPrompt = `Wardrobe outfit for ${cast?.name || 'character'}: ${prompt}`;
            
            const res = await fetch('/api/generate/asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    type: 'wardrobe',
                    name: `${cast?.name || 'Character'} - ${prompt.slice(0, 30)}`,
                    prompt: fullPrompt,
                    definition: {
                        for_cast_id: castId,
                        description: prompt
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                const newWardrobe = data.data[0];
                // Auto-assign the new wardrobe
                await assignWardrobe(castId, newWardrobe.id);
            }
        } catch (error) {
            console.error('Error generating wardrobe:', error);
        } finally {
            setGeneratingForCast(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shirt className="text-pink-500" />
                            Wardrobe Manager
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Assign outfits to cast members per scene
                        </p>
                    </div>
                </div>
            </div>

            {/* Cast List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {castAssets.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No cast members yet.</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Add cast members in the Casting panel first.
                        </p>
                    </div>
                ) : (
                    castAssets.map((cast) => {
                        const isExpanded = expandedCastId === cast.id;
                        const defaultWardrobe = getWardrobeForCast(cast.id);
                        const scenesWithCast = scenes.filter(s => 
                            s.linked_cast_ids?.includes(cast.id)
                        );

                        return (
                            <div
                                key={cast.id}
                                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden"
                            >
                                {/* Cast Header */}
                                <div
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5"
                                    onClick={() => setExpandedCastId(isExpanded ? null : cast.id)}
                                >
                                    {/* Cast Thumbnail */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                                        {cast.public_url ? (
                                            <img
                                                src={cast.public_url}
                                                alt={cast.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <Users size={20} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white">{cast.name || 'Unnamed'}</p>
                                        <p className="text-xs text-gray-500">
                                            {scenesWithCast.length} scenes
                                        </p>
                                    </div>

                                    {/* Default Wardrobe Preview */}
                                    {defaultWardrobe && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-black overflow-hidden">
                                                {defaultWardrobe.public_url ? (
                                                    <img
                                                        src={defaultWardrobe.public_url}
                                                        alt="Default wardrobe"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Shirt size={12} className="text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">Default</span>
                                        </div>
                                    )}

                                    <button className="text-gray-400">
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </div>

                                {/* Expanded Wardrobe Assignment */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-4 space-y-4">
                                        {/* Default Wardrobe */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                Default Wardrobe
                                            </h4>
                                            <WardrobeSelector
                                                wardrobeAssets={wardrobeAssets}
                                                selectedId={defaultWardrobe?.id}
                                                onSelect={(id) => assignWardrobe(cast.id, id)}
                                                onGenerate={() => setShowGenerateModal(true)}
                                                isGenerating={generatingForCast === cast.id}
                                            />
                                        </div>

                                        {/* Per-Scene Wardrobe */}
                                        {scenesWithCast.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                    Scene-Specific Wardrobe
                                                </h4>
                                                
                                                {scenesWithCast.map((scene, index) => {
                                                    const sceneWardrobe = getWardrobeForCast(cast.id, scene.id);
                                                    const isOverridden = sceneWardrobe && sceneWardrobe.id !== defaultWardrobe?.id;
                                                    
                                                    return (
                                                        <div
                                                            key={scene.id}
                                                            className={`p-3 rounded-lg border ${
                                                                isOverridden 
                                                                    ? 'border-pink-500/30 bg-pink-500/5' 
                                                                    : 'border-white/5 bg-white/5'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-mono text-gray-500">
                                                                        Scene {index + 1}
                                                                    </span>
                                                                    <span className="text-sm text-white truncate max-w-[200px]">
                                                                        {scene.slug_line}
                                                                    </span>
                                                                </div>
                                                                {isOverridden && (
                                                                    <button
                                                                        onClick={() => removeAssignment(cast.id, scene.id)}
                                                                        className="text-xs text-gray-500 hover:text-red-400"
                                                                    >
                                                                        Reset to default
                                                                    </button>
                                                                )}
                                                            </div>
                                                            
                                                            <WardrobeSelector
                                                                wardrobeAssets={wardrobeAssets}
                                                                selectedId={sceneWardrobe?.id}
                                                                onSelect={(id) => assignWardrobe(cast.id, id, scene.id)}
                                                                compact
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Generate New Wardrobe */}
                                        <div className="pt-4 border-t border-white/5">
                                            <GenerateWardrobeForm
                                                castName={cast.name || 'Character'}
                                                isGenerating={generatingForCast === cast.id}
                                                onGenerate={(prompt) => generateWardrobe(cast.id, prompt)}
                                            />
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

// Wardrobe Selector Component
function WardrobeSelector({
    wardrobeAssets,
    selectedId,
    onSelect,
    onGenerate,
    isGenerating,
    compact
}: {
    wardrobeAssets: Asset[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
    compact?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedWardrobe = wardrobeAssets.find(w => w.id === selectedId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors ${
                    compact ? 'text-sm' : ''
                }`}
            >
                {selectedWardrobe ? (
                    <>
                        <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded bg-black overflow-hidden flex-shrink-0`}>
                            {selectedWardrobe.public_url ? (
                                <img
                                    src={selectedWardrobe.public_url}
                                    alt={selectedWardrobe.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Shirt size={14} className="text-gray-600" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-white truncate">{selectedWardrobe.name}</p>
                            {!compact && (
                                <p className="text-xs text-gray-500 truncate">
                                    {(selectedWardrobe.definition as any)?.description || 'No description'}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <span className="text-gray-500 flex-1 text-left">Select wardrobe...</span>
                )}
                <ChevronDown size={16} className="text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {wardrobeAssets.map((wardrobe) => (
                        <button
                            key={wardrobe.id}
                            onClick={() => {
                                onSelect(wardrobe.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2 hover:bg-white/5 transition-colors ${
                                wardrobe.id === selectedId ? 'bg-yellow-500/10' : ''
                            }`}
                        >
                            <div className="w-10 h-10 rounded bg-black overflow-hidden flex-shrink-0">
                                {wardrobe.public_url ? (
                                    <img
                                        src={wardrobe.public_url}
                                        alt={wardrobe.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Shirt size={14} className="text-gray-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-white text-sm">{wardrobe.name}</p>
                            </div>
                            {wardrobe.id === selectedId && (
                                <Check size={16} className="text-yellow-500" />
                            )}
                        </button>
                    ))}
                    
                    {wardrobeAssets.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No wardrobe items yet
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Generate Wardrobe Form
function GenerateWardrobeForm({
    castName,
    isGenerating,
    onGenerate
}: {
    castName: string;
    isGenerating: boolean;
    onGenerate: (prompt: string) => void;
}) {
    const [prompt, setPrompt] = useState('');

    const presets = [
        'Casual everyday outfit',
        'Formal business attire',
        'Athletic wear',
        'Evening cocktail dress',
        'Rugged outdoor gear',
        'Futuristic sci-fi suit'
    ];

    return (
        <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-400">Generate New Outfit</h5>
            
            <div className="flex flex-wrap gap-2">
                {presets.slice(0, 4).map((preset, i) => (
                    <button
                        key={i}
                        onClick={() => setPrompt(preset)}
                        className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                        {preset}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe outfit for ${castName}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
                />
                <button
                    onClick={() => {
                        if (prompt) {
                            onGenerate(prompt);
                            setPrompt('');
                        }
                    }}
                    disabled={!prompt || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {isGenerating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Sparkles size={16} />
                    )}
                </button>
            </div>
        </div>
    );
}
