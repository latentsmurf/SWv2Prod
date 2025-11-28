'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, Loader2, Sparkles, Tag, Users, MapPin, Shirt,
    Car, Package, Utensils, Music, Camera, Zap, Clock,
    ChevronDown, ChevronRight, Check, Plus, X, Edit, Trash2
} from 'lucide-react';

interface BreakdownElement {
    id: string;
    type: ElementType;
    name: string;
    description?: string;
    scenes: string[];
    notes?: string;
    cost_estimate?: number;
    status: 'needed' | 'sourced' | 'ready';
}

type ElementType = 
    | 'cast_member'
    | 'extra'
    | 'stunt'
    | 'vehicle'
    | 'prop'
    | 'wardrobe'
    | 'makeup'
    | 'set_dressing'
    | 'greenery'
    | 'animal'
    | 'sfx'
    | 'vfx'
    | 'music'
    | 'sound';

interface SceneBreakdown {
    scene_id: string;
    scene_number: string;
    scene_heading: string;
    elements: BreakdownElement[];
}

interface ScriptBreakdownProps {
    projectId: string;
}

const ELEMENT_TYPES: { type: ElementType; label: string; icon: any; color: string }[] = [
    { type: 'cast_member', label: 'Cast', icon: Users, color: 'text-purple-400 bg-purple-500/10' },
    { type: 'extra', label: 'Extras', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
    { type: 'stunt', label: 'Stunts', icon: Zap, color: 'text-orange-400 bg-orange-500/10' },
    { type: 'vehicle', label: 'Vehicles', icon: Car, color: 'text-cyan-400 bg-cyan-500/10' },
    { type: 'prop', label: 'Props', icon: Package, color: 'text-green-400 bg-green-500/10' },
    { type: 'wardrobe', label: 'Wardrobe', icon: Shirt, color: 'text-pink-400 bg-pink-500/10' },
    { type: 'makeup', label: 'Makeup/Hair', icon: Sparkles, color: 'text-rose-400 bg-rose-500/10' },
    { type: 'set_dressing', label: 'Set Dressing', icon: MapPin, color: 'text-amber-400 bg-amber-500/10' },
    { type: 'animal', label: 'Animals', icon: Package, color: 'text-lime-400 bg-lime-500/10' },
    { type: 'sfx', label: 'SFX', icon: Zap, color: 'text-red-400 bg-red-500/10' },
    { type: 'vfx', label: 'VFX', icon: Camera, color: 'text-violet-400 bg-violet-500/10' },
    { type: 'music', label: 'Music', icon: Music, color: 'text-indigo-400 bg-indigo-500/10' },
    { type: 'sound', label: 'Sound', icon: Music, color: 'text-teal-400 bg-teal-500/10' },
];

const STATUS_CONFIG = {
    needed: { label: 'Needed', color: 'bg-red-500/10 text-red-400' },
    sourced: { label: 'Sourced', color: 'bg-yellow-500/10 text-yellow-400' },
    ready: { label: 'Ready', color: 'bg-green-500/10 text-green-400' }
};

export default function ScriptBreakdown({ projectId }: ScriptBreakdownProps) {
    const [breakdowns, setBreakdowns] = useState<SceneBreakdown[]>([]);
    const [allElements, setAllElements] = useState<BreakdownElement[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [viewMode, setViewMode] = useState<'by_scene' | 'by_type'>('by_scene');
    const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
    const [filterType, setFilterType] = useState<ElementType | 'all'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedScene, setSelectedScene] = useState<string | null>(null);

    // Form state
    const [elementForm, setElementForm] = useState<Partial<BreakdownElement>>({
        type: 'prop',
        name: '',
        status: 'needed',
        scenes: []
    });

    // Fetch breakdowns
    useEffect(() => {
        const fetchBreakdowns = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/breakdown`);
                if (res.ok) {
                    const data = await res.json();
                    setBreakdowns(data.scenes || []);
                    setAllElements(data.elements || []);
                }
            } catch (error) {
                console.error('Error fetching breakdown:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBreakdowns();
    }, [projectId]);

    // AI analyze script
    const analyzeScript = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/breakdown/analyze`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                setBreakdowns(data.scenes || []);
                setAllElements(data.elements || []);
            }
        } catch (error) {
            console.error('Error analyzing script:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    // Add element
    const addElement = async () => {
        if (!elementForm.name?.trim()) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/breakdown/elements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...elementForm,
                    scenes: selectedScene ? [selectedScene] : elementForm.scenes
                })
            });

            if (res.ok) {
                const newElement = await res.json();
                setAllElements(prev => [...prev, newElement]);
                setShowAddModal(false);
                setElementForm({ type: 'prop', name: '', status: 'needed', scenes: [] });
            }
        } catch (error) {
            console.error('Error adding element:', error);
        }
    };

    // Update element status
    const updateElementStatus = async (elementId: string, status: BreakdownElement['status']) => {
        try {
            await fetch(`/api/projects/${projectId}/breakdown/elements/${elementId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            setAllElements(prev =>
                prev.map(e => e.id === elementId ? { ...e, status } : e)
            );
        } catch (error) {
            console.error('Error updating element:', error);
        }
    };

    // Toggle scene expansion
    const toggleScene = (sceneId: string) => {
        const newExpanded = new Set(expandedScenes);
        if (newExpanded.has(sceneId)) {
            newExpanded.delete(sceneId);
        } else {
            newExpanded.add(sceneId);
        }
        setExpandedScenes(newExpanded);
    };

    // Get elements by type
    const getElementsByType = (type: ElementType) => {
        return allElements.filter(e => e.type === type);
    };

    // Get element config
    const getElementConfig = (type: ElementType) => {
        return ELEMENT_TYPES.find(t => t.type === type)!;
    };

    // Filter elements
    const filteredElements = filterType === 'all'
        ? allElements
        : allElements.filter(e => e.type === filterType);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Tag className="text-yellow-500" />
                        Script Breakdown
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {allElements.length} elements across {breakdowns.length} scenes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={analyzeScript}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl"
                    >
                        {analyzing ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        AI Analyze
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                    >
                        <Plus size={18} />
                        Add Element
                    </button>
                </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('by_scene')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'by_scene'
                                ? 'bg-yellow-500 text-black'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        By Scene
                    </button>
                    <button
                        onClick={() => setViewMode('by_type')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            viewMode === 'by_type'
                                ? 'bg-yellow-500 text-black'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        By Type
                    </button>
                </div>

                {viewMode === 'by_type' && (
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="all">All Types</option>
                        {ELEMENT_TYPES.map(t => (
                            <option key={t.type} value={t.type}>{t.label}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : viewMode === 'by_scene' ? (
                // By Scene View
                <div className="space-y-4">
                    {breakdowns.map((scene) => (
                        <div
                            key={scene.scene_id}
                            className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleScene(scene.scene_id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedScenes.has(scene.scene_id) ? (
                                        <ChevronDown size={18} className="text-gray-500" />
                                    ) : (
                                        <ChevronRight size={18} className="text-gray-500" />
                                    )}
                                    <span className="text-yellow-500 font-mono text-sm">
                                        {scene.scene_number}
                                    </span>
                                    <span className="text-white font-medium">{scene.scene_heading}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {scene.elements.length} elements
                                </span>
                            </button>

                            {expandedScenes.has(scene.scene_id) && (
                                <div className="p-4 pt-0 border-t border-white/5">
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {ELEMENT_TYPES.map(({ type, label, icon: Icon, color }) => {
                                            const elements = scene.elements.filter(e => e.type === type);
                                            if (elements.length === 0) return null;

                                            return (
                                                <div key={type} className="space-y-2">
                                                    <h4 className={`text-sm font-medium flex items-center gap-2 ${color.split(' ')[0]}`}>
                                                        <Icon size={14} />
                                                        {label} ({elements.length})
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {elements.map((element) => (
                                                            <div
                                                                key={element.id}
                                                                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                                                            >
                                                                <span className="text-sm text-gray-300">{element.name}</span>
                                                                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[element.status].color}`}>
                                                                    {STATUS_CONFIG[element.status].label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedScene(scene.scene_id);
                                            setShowAddModal(true);
                                        }}
                                        className="mt-4 text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        Add element to this scene
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // By Type View
                <div className="grid grid-cols-3 gap-4">
                    {(filterType === 'all' ? ELEMENT_TYPES : ELEMENT_TYPES.filter(t => t.type === filterType)).map(({ type, label, icon: Icon, color }) => {
                        const elements = getElementsByType(type);
                        if (elements.length === 0 && filterType === 'all') return null;

                        return (
                            <div
                                key={type}
                                className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden"
                            >
                                <div className={`p-4 border-b border-white/5 ${color.split(' ')[1]}`}>
                                    <h3 className={`font-medium flex items-center gap-2 ${color.split(' ')[0]}`}>
                                        <Icon size={18} />
                                        {label}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">{elements.length} items</p>
                                </div>

                                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                                    {elements.length === 0 ? (
                                        <p className="text-sm text-gray-600 text-center py-4">No items</p>
                                    ) : (
                                        elements.map((element) => (
                                            <div
                                                key={element.id}
                                                className="flex items-center justify-between p-2 bg-white/5 rounded-lg group"
                                            >
                                                <div>
                                                    <p className="text-sm text-white">{element.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {element.scenes.length} scene{element.scenes.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <select
                                                    value={element.status}
                                                    onChange={(e) => updateElementStatus(element.id, e.target.value as any)}
                                                    className={`text-xs rounded px-2 py-1 ${STATUS_CONFIG[element.status].color} bg-transparent border-0`}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Element Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Add Element</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedScene(null);
                                }}
                                className="p-2 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Type</label>
                                <select
                                    value={elementForm.type}
                                    onChange={(e) => setElementForm({ ...elementForm, type: e.target.value as ElementType })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                >
                                    {ELEMENT_TYPES.map(t => (
                                        <option key={t.type} value={t.type}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={elementForm.name || ''}
                                    onChange={(e) => setElementForm({ ...elementForm, name: e.target.value })}
                                    placeholder="Element name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={elementForm.description || ''}
                                    onChange={(e) => setElementForm({ ...elementForm, description: e.target.value })}
                                    placeholder="Optional description"
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Status</label>
                                <select
                                    value={elementForm.status}
                                    onChange={(e) => setElementForm({ ...elementForm, status: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                >
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedScene(null);
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addElement}
                                disabled={!elementForm.name?.trim()}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                Add Element
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
