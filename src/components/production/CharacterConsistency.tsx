'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Image, Check, X, RefreshCw, Loader2, AlertCircle,
    Sparkles, Eye, EyeOff, ChevronDown, Plus, Trash2, Upload
} from 'lucide-react';
import { Asset, Shot } from '@/types';

interface CharacterReference {
    id: string;
    character_id: string;
    image_url: string;
    description?: string;
    is_primary: boolean;
    face_embedding?: number[];
}

interface ConsistencyCheck {
    shot_id: string;
    character_id: string;
    consistency_score: number; // 0-100
    issues?: string[];
}

interface CharacterConsistencyProps {
    projectId: string;
    characters: Asset[];
    shots: Shot[];
    onRegenerateShot?: (shotId: string, characterId: string) => void;
}

export default function CharacterConsistency({
    projectId,
    characters,
    shots,
    onRegenerateShot
}: CharacterConsistencyProps) {
    const [references, setReferences] = useState<Record<string, CharacterReference[]>>({});
    const [consistencyChecks, setConsistencyChecks] = useState<ConsistencyCheck[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [showAddRef, setShowAddRef] = useState(false);

    // Fetch character references
    useEffect(() => {
        const fetchReferences = async () => {
            setLoading(true);
            try {
                const refs: Record<string, CharacterReference[]> = {};
                for (const char of characters) {
                    const res = await fetch(`/api/library/assets/${char.id}/references`);
                    if (res.ok) {
                        refs[char.id] = await res.json();
                    }
                }
                setReferences(refs);
            } catch (error) {
                console.error('Error fetching references:', error);
            } finally {
                setLoading(false);
            }
        };

        if (characters.length > 0) {
            fetchReferences();
        }
    }, [characters]);

    // Analyze consistency
    const analyzeConsistency = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/analyze-consistency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    character_ids: characters.map(c => c.id),
                    shot_ids: shots.map(s => s.id)
                })
            });
            
            if (res.ok) {
                const checks = await res.json();
                setConsistencyChecks(checks);
            }
        } catch (error) {
            console.error('Error analyzing consistency:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    // Add reference image
    const addReference = async (characterId: string, imageUrl: string, isPrimary: boolean = false) => {
        try {
            const res = await fetch(`/api/library/assets/${characterId}/references`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: imageUrl, is_primary: isPrimary })
            });

            if (res.ok) {
                const newRef = await res.json();
                setReferences(prev => ({
                    ...prev,
                    [characterId]: [...(prev[characterId] || []), newRef]
                }));
            }
        } catch (error) {
            console.error('Error adding reference:', error);
        }
    };

    // Remove reference
    const removeReference = async (characterId: string, refId: string) => {
        try {
            await fetch(`/api/library/assets/${characterId}/references/${refId}`, {
                method: 'DELETE'
            });
            setReferences(prev => ({
                ...prev,
                [characterId]: prev[characterId]?.filter(r => r.id !== refId) || []
            }));
        } catch (error) {
            console.error('Error removing reference:', error);
        }
    };

    // Set primary reference
    const setPrimaryReference = async (characterId: string, refId: string) => {
        try {
            await fetch(`/api/library/assets/${characterId}/references/${refId}/primary`, {
                method: 'POST'
            });
            setReferences(prev => ({
                ...prev,
                [characterId]: prev[characterId]?.map(r => ({
                    ...r,
                    is_primary: r.id === refId
                })) || []
            }));
        } catch (error) {
            console.error('Error setting primary:', error);
        }
    };

    // Get consistency score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400 bg-green-500/10';
        if (score >= 60) return 'text-yellow-400 bg-yellow-500/10';
        return 'text-red-400 bg-red-500/10';
    };

    // Get shots for a character
    const getCharacterShots = (characterId: string) => {
        return shots.filter(shot => 
            shot.linked_cast_ids?.includes(characterId)
        );
    };

    // Get consistency check for shot/character
    const getCheck = (shotId: string, characterId: string) => {
        return consistencyChecks.find(
            c => c.shot_id === shotId && c.character_id === characterId
        );
    };

    const selectedCharData = characters.find(c => c.id === selectedCharacter);
    const selectedRefs = selectedCharacter ? references[selectedCharacter] || [] : [];

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users className="text-yellow-500" />
                            Character Consistency
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Ensure characters look consistent across all shots
                        </p>
                    </div>

                    <button
                        onClick={analyzeConsistency}
                        disabled={analyzing || characters.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {analyzing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        Analyze Consistency
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Character List */}
                <div className="w-64 border-r border-white/5 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Characters</h3>
                        {characters.length === 0 ? (
                            <p className="text-sm text-gray-600">No cast members defined</p>
                        ) : (
                            <div className="space-y-2">
                                {characters.map((char) => {
                                    const charRefs = references[char.id] || [];
                                    const charShots = getCharacterShots(char.id);
                                    const avgScore = charShots.length > 0
                                        ? Math.round(
                                            charShots.reduce((sum, shot) => {
                                                const check = getCheck(shot.id, char.id);
                                                return sum + (check?.consistency_score || 0);
                                            }, 0) / charShots.length
                                        )
                                        : null;

                                    return (
                                        <button
                                            key={char.id}
                                            onClick={() => setSelectedCharacter(char.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                                selectedCharacter === char.id
                                                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                                                    : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-black overflow-hidden flex-shrink-0">
                                                {charRefs.find(r => r.is_primary)?.image_url ? (
                                                    <img
                                                        src={charRefs.find(r => r.is_primary)?.image_url}
                                                        alt={char.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <Users size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {char.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {charRefs.length} refs • {charShots.length} shots
                                                </p>
                                            </div>
                                            {avgScore !== null && (
                                                <span className={`text-xs px-2 py-0.5 rounded ${getScoreColor(avgScore)}`}>
                                                    {avgScore}%
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Character Details */}
                <div className="flex-1 overflow-y-auto p-6">
                    {selectedCharacter && selectedCharData ? (
                        <div className="space-y-8">
                            {/* Reference Images */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-white">Reference Images</h3>
                                    <button
                                        onClick={() => setShowAddRef(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    >
                                        <Plus size={14} />
                                        Add Reference
                                    </button>
                                </div>

                                {selectedRefs.length === 0 ? (
                                    <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <Upload className="mx-auto text-gray-600 mb-2" size={32} />
                                        <p className="text-sm text-gray-500">No reference images</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Add images to ensure consistency
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-4">
                                        {selectedRefs.map((ref) => (
                                            <div
                                                key={ref.id}
                                                className={`relative group rounded-xl overflow-hidden ${
                                                    ref.is_primary ? 'ring-2 ring-yellow-500' : ''
                                                }`}
                                            >
                                                <img
                                                    src={ref.image_url}
                                                    alt="Reference"
                                                    className="w-full aspect-square object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    {!ref.is_primary && (
                                                        <button
                                                            onClick={() => setPrimaryReference(selectedCharacter, ref.id)}
                                                            className="p-2 bg-white/20 hover:bg-yellow-500 rounded-lg text-white hover:text-black"
                                                            title="Set as primary"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeReference(selectedCharacter, ref.id)}
                                                        className="p-2 bg-white/20 hover:bg-red-500 rounded-lg text-white"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                {ref.is_primary && (
                                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-yellow-500 rounded text-xs text-black font-medium">
                                                        Primary
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Shots with Character */}
                            <div>
                                <h3 className="font-medium text-white mb-4">
                                    Shots featuring {selectedCharData.name}
                                </h3>

                                {getCharacterShots(selectedCharacter).length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No shots with this character yet
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-4">
                                        {getCharacterShots(selectedCharacter).map((shot) => {
                                            const check = getCheck(shot.id, selectedCharacter);
                                            
                                            return (
                                                <div
                                                    key={shot.id}
                                                    className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden"
                                                >
                                                    <div className="aspect-video bg-black relative">
                                                        {shot.gcs_path || shot.proxy_path ? (
                                                            <img
                                                                src={shot.gcs_path || shot.proxy_path}
                                                                alt={shot.description}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                                <Image size={24} />
                                                            </div>
                                                        )}
                                                        
                                                        {check && (
                                                            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getScoreColor(check.consistency_score)}`}>
                                                                {check.consistency_score}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="text-sm text-white truncate">
                                                            Shot {shot.shot_number}
                                                        </p>
                                                        {check?.issues && check.issues.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {check.issues.map((issue, i) => (
                                                                    <p key={i} className="text-xs text-red-400 flex items-start gap-1">
                                                                        <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                                                                        {issue}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {check && check.consistency_score < 80 && onRegenerateShot && (
                                                            <button
                                                                onClick={() => onRegenerateShot(shot.id, selectedCharacter)}
                                                                className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs rounded-lg"
                                                            >
                                                                <RefreshCw size={12} />
                                                                Regenerate
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <Users className="mx-auto mb-4" size={48} />
                                <p>Select a character to view consistency</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
