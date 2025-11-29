'use client';

import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layer, BLEND_MODES } from './types';

interface LayersPanelProps {
    layers: Layer[];
    activeLayerId: string | null;
    showLayers: boolean;
    setShowLayers: (show: boolean) => void;
    setActiveLayerId: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onUpdateOpacity: (id: string, opacity: number) => void;
    onUpdateBlendMode: (id: string, mode: string) => void;
    onAddLayer: () => void;
    onDeleteLayer: (id: string) => void;
}

export default function LayersPanel({
    layers,
    activeLayerId,
    showLayers,
    setShowLayers,
    setActiveLayerId,
    onToggleVisibility,
    onToggleLock,
    onUpdateOpacity,
    onUpdateBlendMode,
    onAddLayer,
    onDeleteLayer,
}: LayersPanelProps) {
    const activeLayer = layers.find(l => l.id === activeLayerId);

    return (
        <div className={`border-b border-white/5 ${showLayers ? '' : 'h-10'} transition-all`}>
            <button
                onClick={() => setShowLayers(!showLayers)}
                className="w-full h-10 px-3 flex items-center justify-between text-sm font-medium hover:bg-white/5"
            >
                <span>Layers</span>
                {showLayers ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="-rotate-90" />}
            </button>
            
            {showLayers && (
                <div className="p-3 space-y-2">
                    {/* Layer properties for active layer */}
                    {activeLayer && (
                        <div className="mb-3 p-2 bg-white/5 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Opacity:</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={activeLayer.opacity}
                                    onChange={(e) => onUpdateOpacity(activeLayer.id, parseInt(e.target.value))}
                                    className="flex-1 accent-yellow-500"
                                />
                                <span className="text-xs w-8">{activeLayer.opacity}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Blend:</span>
                                <select
                                    value={activeLayer.blendMode}
                                    onChange={(e) => onUpdateBlendMode(activeLayer.id, e.target.value)}
                                    className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
                                >
                                    {BLEND_MODES.map(mode => (
                                        <option key={mode} value={mode}>{mode}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {/* Layers list */}
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                        {layers.map(layer => (
                            <div
                                key={layer.id}
                                onClick={() => setActiveLayerId(layer.id)}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
                                    ${layer.id === activeLayerId 
                                        ? 'bg-yellow-500/20 border border-yellow-500/30' 
                                        : 'hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {/* Thumbnail */}
                                {layer.thumbnail && (
                                    <div className="w-8 h-8 rounded overflow-hidden bg-black/30 flex-shrink-0">
                                        <img 
                                            src={layer.thumbnail} 
                                            alt={layer.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                {/* Layer name & type */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">{layer.name}</div>
                                    <div className="text-[10px] text-gray-500 capitalize">{layer.type}</div>
                                </div>
                                
                                {/* Controls */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                                        className="p-1 rounded hover:bg-white/10"
                                    >
                                        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-600" />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                                        className="p-1 rounded hover:bg-white/10"
                                    >
                                        {layer.locked ? <Lock size={12} className="text-yellow-400" /> : <Unlock size={12} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Add/Delete buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                            onClick={onAddLayer}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
                        >
                            <Plus size={14} />
                            Add Layer
                        </button>
                        <button
                            onClick={() => activeLayerId && onDeleteLayer(activeLayerId)}
                            disabled={!activeLayerId || layers.find(l => l.id === activeLayerId)?.locked}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:text-white"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
