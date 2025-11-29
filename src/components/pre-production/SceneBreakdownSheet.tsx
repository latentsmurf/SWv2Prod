'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Printer, Users, MapPin, Package, Shirt,
    Camera, Clock, Sun, Moon, Star, AlertTriangle, Loader2
} from 'lucide-react';

interface BreakdownElement {
    id: string;
    category: 'cast' | 'extras' | 'stunts' | 'vehicles' | 'props' | 'wardrobe' | 'makeup' | 'sfx' | 'vfx' | 'animals' | 'music' | 'sound' | 'camera' | 'art' | 'greenery' | 'other';
    name: string;
    notes?: string;
}

interface SceneBreakdown {
    scene_id: string;
    scene_number: number;
    scene_heading: string;
    page_count: number;
    day_night: 'day' | 'night' | 'dawn' | 'dusk';
    int_ext: 'int' | 'ext' | 'int_ext';
    location?: string;
    synopsis?: string;
    elements: BreakdownElement[];
    notes?: string;
    shoot_day?: number;
}

interface SceneBreakdownSheetProps {
    projectId: string;
    sceneId?: string;
}

const ELEMENT_CATEGORIES = {
    cast: { label: 'Cast', icon: Users, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    extras: { label: 'Extras', icon: Users, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    stunts: { label: 'Stunts', icon: Star, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    vehicles: { label: 'Vehicles', icon: Camera, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    props: { label: 'Props', icon: Package, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    wardrobe: { label: 'Wardrobe', icon: Shirt, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    makeup: { label: 'Makeup/Hair', icon: Users, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    sfx: { label: 'Special FX', icon: Star, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    vfx: { label: 'Visual FX', icon: Camera, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    animals: { label: 'Animals', icon: Star, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    music: { label: 'Music', icon: Star, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    sound: { label: 'Sound', icon: Star, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    camera: { label: 'Camera', icon: Camera, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    art: { label: 'Art Dept', icon: Package, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    greenery: { label: 'Greenery', icon: Star, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    other: { label: 'Other', icon: Package, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
};

export default function SceneBreakdownSheet({ projectId, sceneId }: SceneBreakdownSheetProps) {
    const [breakdowns, setBreakdowns] = useState<SceneBreakdown[]>([]);
    const [selectedScene, setSelectedScene] = useState<SceneBreakdown | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'sheet'>('list');

    useEffect(() => {
        const fetchBreakdowns = async () => {
            try {
                const url = sceneId
                    ? `/api/projects/${projectId}/scenes/${sceneId}/breakdown`
                    : `/api/projects/${projectId}/breakdown`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setBreakdowns(Array.isArray(data) ? data : [data]);
                    if (sceneId && data) setSelectedScene(data);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBreakdowns();
    }, [projectId, sceneId]);

    const exportPDF = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/breakdown/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scene_ids: selectedScene ? [selectedScene.scene_id] : breakdowns.map(b => b.scene_id) })
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const renderBreakdownSheet = (breakdown: SceneBreakdown) => {
        const elementsByCategory = (breakdown.elements || []).reduce((acc, el) => {
            if (!acc[el.category]) acc[el.category] = [];
            acc[el.category].push(el);
            return acc;
        }, {} as Record<string, BreakdownElement[]>);

        return (
            <div className="bg-white text-black rounded-xl overflow-hidden print:shadow-none" style={{ fontFamily: 'Courier, monospace' }}>
                {/* Header */}
                <div className="bg-gray-100 p-4 border-b-2 border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold">SCENE {breakdown.scene_number}</h2>
                            <p className="text-lg">{breakdown.scene_heading}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm">{breakdown.page_count} page(s)</p>
                            <p className="text-sm">{(breakdown.int_ext || 'INT').toUpperCase()} / {(breakdown.day_night || 'DAY').toUpperCase()}</p>
                            {breakdown.shoot_day && <p className="text-sm font-bold">Day {breakdown.shoot_day}</p>}
                        </div>
                    </div>
                    {breakdown.location && (
                        <p className="mt-2 text-sm flex items-center gap-1">
                            <MapPin size={14} /> {breakdown.location}
                        </p>
                    )}
                </div>

                {/* Synopsis */}
                {breakdown.synopsis && (
                    <div className="p-4 border-b border-gray-300">
                        <h3 className="text-sm font-bold mb-1">SYNOPSIS</h3>
                        <p className="text-sm">{breakdown.synopsis}</p>
                    </div>
                )}

                {/* Elements Grid */}
                <div className="grid grid-cols-4 gap-px bg-gray-300">
                    {Object.entries(ELEMENT_CATEGORIES).map(([key, config]) => {
                        const elements = elementsByCategory[key] || [];
                        if (elements.length === 0 && ['other', 'greenery', 'music'].includes(key)) return null;
                        
                        return (
                            <div key={key} className={`p-3 min-h-[100px] ${config.color.replace('/20', '/10').replace('/30', '/20')}`}>
                                <h4 className="text-xs font-bold mb-2 uppercase">{config.label}</h4>
                                <ul className="text-xs space-y-1">
                                    {elements.map((el, i) => (
                                        <li key={i}>{el.name}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Notes */}
                {breakdown.notes && (
                    <div className="p-4 border-t border-gray-300 bg-yellow-50">
                        <h3 className="text-sm font-bold mb-1">NOTES</h3>
                        <p className="text-sm">{breakdown.notes}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="text-yellow-500" />
                        Scene Breakdown Sheets
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {breakdowns.length} scene(s) broken down
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 rounded-xl p-1">
                        {(['list', 'sheet'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                    viewMode === mode ? 'bg-yellow-500 text-black' : 'text-gray-400'
                                }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={exportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"
                    >
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"
                    >
                        <Printer size={18} />
                        Print
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-4">
                    {breakdowns.map((breakdown, index) => {
                        const elements = breakdown.elements || [];
                        const castCount = elements.filter(e => e.category === 'cast').length;
                        const hasStunts = elements.some(e => e.category === 'stunts');
                        const hasSFX = elements.some(e => e.category === 'sfx');

                        return (
                            <div
                                key={breakdown.scene_id || `breakdown-${index}`}
                                className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-4 hover:border-white/20 cursor-pointer"
                                onClick={() => { setSelectedScene(breakdown); setViewMode('sheet'); }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded font-mono font-bold">
                                                {breakdown.scene_number}
                                            </span>
                                            <h3 className="text-white font-bold">{breakdown.scene_heading}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                {breakdown.day_night === 'day' ? <Sun size={14} /> : <Moon size={14} />}
                                                {(breakdown.int_ext || 'INT').toUpperCase()} / {(breakdown.day_night || 'DAY').toUpperCase()}
                                            </span>
                                            <span>{breakdown.page_count || 0} pg</span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {castCount} cast
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasStunts && (
                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">STUNTS</span>
                                        )}
                                        {hasSFX && (
                                            <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">SFX</span>
                                        )}
                                    </div>
                                </div>

                                {/* Element Summary */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {Object.entries(ELEMENT_CATEGORIES).map(([key, config]) => {
                                        const count = elements.filter(e => e.category === key).length;
                                        if (count === 0) return null;
                                        return (
                                            <span key={key} className={`px-2 py-1 rounded text-xs border ${config.color}`}>
                                                {config.label}: {count}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {breakdowns.length === 0 && (
                        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                            No scene breakdowns yet
                        </div>
                    )}
                </div>
            ) : selectedScene ? (
                <div>
                    <button
                        onClick={() => { setSelectedScene(null); setViewMode('list'); }}
                        className="mb-4 text-sm text-gray-400 hover:text-white"
                    >
                        ← Back to list
                    </button>
                    {renderBreakdownSheet(selectedScene)}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-xl p-8 text-center text-gray-500">
                    Select a scene to view breakdown sheet
                </div>
            )}
        </div>
    );
}
