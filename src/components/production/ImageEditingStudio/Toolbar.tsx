'use client';

import React from 'react';
import {
    MousePointer2, Hand, Paintbrush, Eraser, Square, Circle, Type, Crop,
    Wand2, Move, PenTool, Pipette, PaintBucket, Stamp, Blend
} from 'lucide-react';
import { Tool, TOOL_CONFIGS } from './types';

// Icon mapping for tools
const TOOL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    MousePointer2, Hand, Paintbrush, Eraser, Square, Circle, Type, Crop,
    Wand2, Move, PenTool, Pipette, PaintBucket, Stamp, Blend
};

interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    secondaryColor: string;
    setSecondaryColor: (color: string) => void;
}

export default function Toolbar({
    activeTool,
    setActiveTool,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
}: ToolbarProps) {
    const swapColors = () => {
        const temp = primaryColor;
        setPrimaryColor(secondaryColor);
        setSecondaryColor(temp);
    };

    return (
        <div className="w-12 bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center py-2 gap-1">
            {TOOL_CONFIGS.map(tool => {
                const Icon = TOOL_ICONS[tool.iconName];
                return (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`w-9 h-9 rounded flex items-center justify-center transition-colors group relative
                            ${activeTool === tool.id 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'hover:bg-white/10 text-gray-400 hover:text-white'
                            }`}
                        title={`${tool.label} (${tool.shortcut})`}
                    >
                        {Icon && <Icon size={18} />}
                        <span className="absolute left-full ml-2 px-2 py-1 bg-black/90 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                            {tool.label} ({tool.shortcut})
                        </span>
                    </button>
                );
            })}
            
            <div className="w-8 h-px bg-white/10 my-2" />
            
            {/* Color swatches */}
            <div className="relative w-9 h-9">
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div
                    className="w-6 h-6 rounded border-2 border-white absolute top-0 left-0 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                />
                <div
                    className="w-6 h-6 rounded border border-white/50 absolute bottom-0 right-0 cursor-pointer"
                    style={{ backgroundColor: secondaryColor }}
                    onClick={swapColors}
                />
            </div>
        </div>
    );
}
