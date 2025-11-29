'use client';

import React, { useState, useEffect } from 'react';
import {
    MapPin, Users, Shirt, Package, ChevronRight, ChevronDown,
    Plus, X, Check, Loader2, Sparkles, Film, Clapperboard,
    Camera, Edit3, Trash2, GripVertical, Eye
} from 'lucide-react';
import { Scene, Asset, Shot, CoveragePresetType } from '@/types';
import { COVERAGE_PRESETS, SHOT_TYPE_LABELS } from '@/lib/coverage-presets';
import CoverageSelector from './CoverageSelector';

interface SceneManagerProps {
    projectId: string;
    onScenesChange?: (scenes: Scene[]) => void;
}

export default function SceneManager({ projectId, onScenesChange }: SceneManagerProps) {
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [shots, setShots] = useState<Record<string, Shot[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
    const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
    const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);

    // Fetch scenes, assets, and shots
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [scenesRes, assetsRes] = await Promise.all([
                    fetch(`/api/projects/${projectId}/scenes`),
                    fetch(`/api/projects/${projectId}/assets`)
                ]);

                if (scenesRes.ok) {
                    const scenesData = await scenesRes.json();
                    setScenes(scenesData);
                    onScenesChange?.(scenesData);

                    // Fetch shots for each scene
                    const shotsMap: Record<string, Shot[]> = {};
                    for (const scene of scenesData) {
                        const shotsRes = await fetch(`/api/projects/${projectId}/scenes/${scene.id}/shots`);
                        if (shotsRes.ok) {
                            shotsMap[scene.id] = await shotsRes.json();
                        }
                    }
                    setShots(shotsMap);
                }

                if (assetsRes.ok) {
                    setAssets(await assetsRes.json());
                }
            } catch (error) {
                console.error('Error fetching scene data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) fetchData();
    }, [projectId]);

    // Filter assets by type
    const castAssets = assets.filter(a => a.type === 'cast');
    const locationAssets = assets.filter(a => a.type === 'location');
    const wardrobeAssets = assets.filter(a => a.type === 'wardrobe');
    const propAssets = assets.filter(a => a.type === 'prop');

    // Update scene
    const updateScene = async (sceneId: string, updates: Partial<Scene>) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/scenes/${sceneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, ...updates } : s));
            }
        } catch (error) {
            console.error('Error updating scene:', error);
        }
    };

    // Generate shots for scene
    const handleGenerateShots = async (scene: Scene) => {
        setGeneratingSceneId(scene.id);
        try {
            const res = await fetch('/api/script/breakdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    scene_id: scene.id,
                    scene_text: scene.script_text,
                    coverage_preset: scene.coverage_preset || 'standard',
                    linked_cast_ids: scene.linked_cast_ids,
                    linked_location_id: scene.linked_location_id,
                    style_mode: scene.style_mode || 'storyboard'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setShots(prev => ({
                    ...prev,
                    [scene.id]: data.shots || []
                }));
            }
        } catch (error) {
            console.error('Error generating shots:', error);
        } finally {
            setGeneratingSceneId(null);
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
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Film className="text-yellow-500" />
                        Scene Breakdown
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {scenes.length} scenes • Assign cast, locations, and coverage
                    </p>
                </div>
            </div>

            {/* Scene List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {scenes.length === 0 ? (
                    <div className="text-center py-20">
                        <Film className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No scenes yet.</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Go to Pre-Production to write or import a script.
                        </p>
                    </div>
                ) : (
                    scenes.map((scene, index) => (
                        <SceneCard
                            key={scene.id}
                            scene={scene}
                            index={index}
                            isExpanded={expandedSceneId === scene.id}
                            isEditing={editingSceneId === scene.id}
                            isGenerating={generatingSceneId === scene.id}
                            shots={shots[scene.id] || []}
                            castAssets={castAssets}
                            locationAssets={locationAssets}
                            wardrobeAssets={wardrobeAssets}
                            propAssets={propAssets}
                            onToggleExpand={() => setExpandedSceneId(
                                expandedSceneId === scene.id ? null : scene.id
                            )}
                            onToggleEdit={() => setEditingSceneId(
                                editingSceneId === scene.id ? null : scene.id
                            )}
                            onUpdate={(updates) => updateScene(scene.id, updates)}
                            onGenerateShots={() => handleGenerateShots(scene)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// Individual Scene Card Component
interface SceneCardProps {
    scene: Scene;
    index: number;
    isExpanded: boolean;
    isEditing: boolean;
    isGenerating: boolean;
    shots: Shot[];
    castAssets: Asset[];
    locationAssets: Asset[];
    wardrobeAssets: Asset[];
    propAssets: Asset[];
    onToggleExpand: () => void;
    onToggleEdit: () => void;
    onUpdate: (updates: Partial<Scene>) => void;
    onGenerateShots: () => void;
}

function SceneCard({
    scene,
    index,
    isExpanded,
    isEditing,
    isGenerating,
    shots,
    castAssets,
    locationAssets,
    wardrobeAssets,
    propAssets,
    onToggleExpand,
    onToggleEdit,
    onUpdate,
    onGenerateShots
}: SceneCardProps) {
    const [localScene, setLocalScene] = useState(scene);
    const [showCoverageSelector, setShowCoverageSelector] = useState(false);

    useEffect(() => {
        setLocalScene(scene);
    }, [scene]);

    const selectedLocation = locationAssets.find(a => a.id === localScene.linked_location_id);
    const selectedCast = castAssets.filter(a => localScene.linked_cast_ids?.includes(a.id));
    const selectedProps = propAssets.filter(a => localScene.linked_prop_ids?.includes(a.id));
    const coveragePreset = COVERAGE_PRESETS[localScene.coverage_preset || 'standard'];

    const handleAssetToggle = (type: 'cast' | 'prop', assetId: string) => {
        const field = type === 'cast' ? 'linked_cast_ids' : 'linked_prop_ids';
        const currentIds = localScene[field] || [];
        const newIds = currentIds.includes(assetId)
            ? currentIds.filter(id => id !== assetId)
            : [...currentIds, assetId];

        setLocalScene(prev => ({ ...prev, [field]: newIds }));
        onUpdate({ [field]: newIds });
    };

    const handleLocationChange = (locationId: string | undefined) => {
        setLocalScene(prev => ({ ...prev, linked_location_id: locationId }));
        onUpdate({ linked_location_id: locationId });
    };

    const handleCoverageChange = (preset: CoveragePresetType) => {
        setLocalScene(prev => ({ ...prev, coverage_preset: preset }));
        onUpdate({ coverage_preset: preset });
        setShowCoverageSelector(false);
    };

    const completedShots = shots.filter(s => s.status === 'completed').length;
    const totalShots = shots.length;

    return (
        <div className={`bg-[#121212] border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-yellow-500/30' : 'border-white/5 hover:border-white/10'
            }`}>
            {/* Scene Header */}
            <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-2 text-gray-500">
                    <GripVertical size={16} className="cursor-grab" />
                    <span className="text-sm font-mono">{index + 1}</span>
                </div>

                <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                        {scene.slug_line || `Scene ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                        {scene.synopsis || scene.script_text?.slice(0, 100)}...
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-sm">
                    {selectedLocation && (
                        <span className="flex items-center gap-1 text-blue-400">
                            <MapPin size={14} />
                        </span>
                    )}
                    {selectedCast.length > 0 && (
                        <span className="flex items-center gap-1 text-purple-400">
                            <Users size={14} />
                            <span>{selectedCast.length}</span>
                        </span>
                    )}
                    {totalShots > 0 && (
                        <span className={`flex items-center gap-1 ${completedShots === totalShots ? 'text-green-400' : 'text-gray-400'}`}>
                            <Camera size={14} />
                            <span>{completedShots}/{totalShots}</span>
                        </span>
                    )}
                    <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">
                        {coveragePreset.icon} {coveragePreset.name}
                    </span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleEdit();
                    }}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Edit3 size={16} />
                </button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-white/5">
                    {/* Asset Assignment Section */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Location */}
                        <AssetSelector
                            title="Location"
                            icon={MapPin}
                            iconColor="text-blue-400"
                            assets={locationAssets}
                            selectedIds={localScene.linked_location_id ? [localScene.linked_location_id] : []}
                            onSelect={(id) => handleLocationChange(id)}
                            singleSelect
                        />

                        {/* Cast */}
                        <AssetSelector
                            title="Cast"
                            icon={Users}
                            iconColor="text-purple-400"
                            assets={castAssets}
                            selectedIds={localScene.linked_cast_ids || []}
                            onSelect={(id) => handleAssetToggle('cast', id)}
                        />

                        {/* Props */}
                        <AssetSelector
                            title="Props"
                            icon={Package}
                            iconColor="text-orange-400"
                            assets={propAssets}
                            selectedIds={localScene.linked_prop_ids || []}
                            onSelect={(id) => handleAssetToggle('prop', id)}
                        />

                        {/* Coverage Preset */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <Clapperboard size={16} className="text-yellow-400" />
                                Coverage Preset
                            </div>
                            <button
                                onClick={() => setShowCoverageSelector(true)}
                                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-yellow-500/30 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{coveragePreset.icon}</span>
                                            <span className="font-medium text-white">{coveragePreset.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {coveragePreset.shotCount.min}-{coveragePreset.shotCount.max} shots
                                        </p>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-500" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Shot List Preview */}
                    {shots.length > 0 && (
                        <div className="px-6 pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-400">Generated Shots</h4>
                                <span className="text-xs text-gray-500">{shots.length} shots</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {shots.slice(0, 8).map((shot, i) => (
                                    <div
                                        key={shot.id}
                                        className="flex-shrink-0 w-32 aspect-video bg-black rounded-lg overflow-hidden relative group"
                                    >
                                        {shot.proxy_path ? (
                                            <img
                                                src={shot.proxy_path}
                                                alt={`Shot ${i + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <Camera size={20} />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                            <span className="text-[10px] font-mono text-gray-300">
                                                {SHOT_TYPE_LABELS[shot.shot_type || 'medium']?.abbrev || 'MED'}
                                            </span>
                                        </div>
                                        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${shot.status === 'completed' ? 'bg-green-500' :
                                                shot.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                                                    'bg-gray-500'
                                            }`} />
                                    </div>
                                ))}
                                {shots.length > 8 && (
                                    <div className="flex-shrink-0 w-32 aspect-video bg-white/5 rounded-lg flex items-center justify-center text-gray-500">
                                        +{shots.length - 8} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-4 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${localScene.style_mode === 'cinematic' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                {localScene.style_mode === 'cinematic' ? '🎬 Cinematic' : '✏️ Storyboard'}
                            </span>
                        </div>

                        <button
                            onClick={onGenerateShots}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    {shots.length > 0 ? 'Regenerate Shots' : 'Generate Shot List'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Coverage Selector Modal */}
            {showCoverageSelector && (
                <CoverageSelector
                    currentPreset={localScene.coverage_preset || 'standard'}
                    onSelect={handleCoverageChange}
                    onClose={() => setShowCoverageSelector(false)}
                />
            )}
        </div>
    );
}

// Asset Selector Component
interface AssetSelectorProps {
    title: string;
    icon: React.ElementType;
    iconColor: string;
    assets: Asset[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    singleSelect?: boolean;
}

function AssetSelector({
    title,
    icon: Icon,
    iconColor,
    assets,
    selectedIds,
    onSelect,
    singleSelect
}: AssetSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Icon size={16} className={iconColor} />
                    {title}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    {isOpen ? 'Close' : 'Edit'}
                </button>
            </div>

            {/* Selected Items */}
            <div className="flex flex-wrap gap-2">
                {selectedIds.length === 0 ? (
                    <span className="text-sm text-gray-600 italic">None selected</span>
                ) : (
                    selectedIds.map(id => {
                        const asset = assets.find(a => a.id === id);
                        if (!asset) return null;
                        return (
                            <div
                                key={id}
                                className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10"
                            >
                                {asset.public_url && (
                                    <img
                                        src={asset.public_url}
                                        alt={asset.name}
                                        className="w-6 h-6 rounded object-cover"
                                    />
                                )}
                                <span className="text-sm text-white">{asset.name}</span>
                                <button
                                    onClick={() => onSelect(id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
                    {assets.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2 text-center">
                            No {title.toLowerCase()} assets available
                        </p>
                    ) : (
                        assets.map(asset => {
                            const isSelected = selectedIds.includes(asset.id);
                            return (
                                <button
                                    key={asset.id}
                                    onClick={() => {
                                        if (singleSelect) {
                                            onSelect(isSelected ? '' : asset.id);
                                        } else {
                                            onSelect(asset.id);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${isSelected ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-white/5'
                                        }`}
                                >
                                    {asset.public_url ? (
                                        <img
                                            src={asset.public_url}
                                            alt={asset.name}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Icon size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div className="flex-1 text-left">
                                        <p className="text-sm text-white">{asset.name}</p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {asset.definition?.vibe || asset.definition?.description || asset.type}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <Check size={16} className="text-yellow-500" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
