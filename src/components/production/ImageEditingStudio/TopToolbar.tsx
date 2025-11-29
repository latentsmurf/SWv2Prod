'use client';

import React from 'react';
import {
    Sparkles, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Minimize2,
    Grid3X3, Magnet, GitBranch, Download
} from 'lucide-react';

interface TopToolbarProps {
    shotName?: string;
    zoom: number;
    showGrid: boolean;
    snapToGrid: boolean;
    historyIndex: number;
    historyLength: number;
    isFullscreen: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onZoom: (delta: number) => void;
    onFitToScreen: () => void;
    onToggleGrid: () => void;
    onToggleSnap: () => void;
    onCreateVersion: () => void;
    onExport: (format: 'png' | 'jpg' | 'webp') => void;
    onToggleFullscreen: () => void;
}

export default function TopToolbar({
    shotName,
    zoom,
    showGrid,
    snapToGrid,
    historyIndex,
    historyLength,
    isFullscreen,
    onUndo,
    onRedo,
    onZoom,
    onFitToScreen,
    onToggleGrid,
    onToggleSnap,
    onCreateVersion,
    onExport,
    onToggleFullscreen,
}: TopToolbarProps) {
    return (
        <div className="h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <h2 className="font-bold text-yellow-500 flex items-center gap-2">
                    <Sparkles size={20} />
                    Repair Studio
                    <span className="text-xs font-normal text-gray-500 ml-2">Powered by Nano Banana Pro</span>
                </h2>
                {shotName && <span className="text-sm text-gray-400">• {shotName}</span>}
            </div>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={onUndo}
                    disabled={historyIndex <= 0}
                    className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                    title="Undo (Cmd+Z)"
                >
                    <Undo2 size={18} />
                </button>
                <button
                    onClick={onRedo}
                    disabled={historyIndex >= historyLength - 1}
                    className="p-2 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
                    title="Redo (Cmd+Shift+Z)"
                >
                    <Redo2 size={18} />
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-2" />
                
                <div className="flex items-center gap-1 bg-black/30 rounded px-2 py-1">
                    <button onClick={() => onZoom(-10)} className="p-1 hover:bg-white/10 rounded">
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-sm w-14 text-center">{zoom}%</span>
                    <button onClick={() => onZoom(10)} className="p-1 hover:bg-white/10 rounded">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={onFitToScreen} className="p-1 hover:bg-white/10 rounded ml-1" title="Fit to screen">
                        <Maximize2 size={16} />
                    </button>
                </div>
                
                <div className="w-px h-6 bg-white/10 mx-2" />
                
                <button
                    onClick={onToggleGrid}
                    className={`p-2 rounded transition-colors ${showGrid ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}
                    title="Toggle Grid"
                >
                    <Grid3X3 size={18} />
                </button>
                <button
                    onClick={onToggleSnap}
                    className={`p-2 rounded transition-colors ${snapToGrid ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}
                    title="Snap to Grid"
                >
                    <Magnet size={18} />
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-2" />
                
                <button
                    onClick={onCreateVersion}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm flex items-center gap-2 transition-colors"
                >
                    <GitBranch size={16} />
                    Save Version
                </button>
                
                <button
                    onClick={() => onExport('png')}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Download size={16} />
                    Export
                </button>
                
                <button
                    onClick={onToggleFullscreen}
                    className="p-2 rounded hover:bg-white/10 transition-colors"
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>
        </div>
    );
}
