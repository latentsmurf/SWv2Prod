'use client';

import React from 'react';
import { 
    Sparkles, ChevronLeft, ChevronRight, Loader2, Trash2,
    Paintbrush, Scissors, SunMedium, Expand, Focus, Droplets, Palette, ArrowUpRight, ImagePlus
} from 'lucide-react';
import { AIOperationType, AIOperation, AI_TOOL_CONFIGS, Selection } from './types';

// Icon mapping for AI tools
const AI_TOOL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    Paintbrush, Sparkles, Scissors, SunMedium, Expand, Focus, Droplets, Palette, ArrowUpRight, ImagePlus
};

interface AIToolsPanelProps {
    showAiPanel: boolean;
    setShowAiPanel: (show: boolean) => void;
    selectedAiTool: AIOperationType;
    setSelectedAiTool: (tool: AIOperationType) => void;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    selection: Selection | null;
    isProcessing: boolean;
    aiOperations: AIOperation[];
    onRunAiTool: () => void;
    onClearMask: () => void;
}

export default function AIToolsPanel({
    showAiPanel,
    setShowAiPanel,
    selectedAiTool,
    setSelectedAiTool,
    aiPrompt,
    setAiPrompt,
    selection,
    isProcessing,
    aiOperations,
    onRunAiTool,
    onClearMask,
}: AIToolsPanelProps) {
    const selectedToolInfo = AI_TOOL_CONFIGS.find(t => t.type === selectedAiTool);

    return (
        <div className={`border-b border-white/5 ${showAiPanel ? '' : 'h-10'} transition-all`}>
            <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="w-full h-10 px-3 flex items-center justify-between text-sm font-medium hover:bg-white/5"
            >
                <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-yellow-400" />
                    AI Tools
                </span>
                {showAiPanel ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="-rotate-90" />}
            </button>
            
            {showAiPanel && (
                <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
                    {/* AI Tool Selection */}
                    <div className="grid grid-cols-2 gap-1.5">
                        {AI_TOOL_CONFIGS.map(tool => {
                            const Icon = AI_TOOL_ICONS[tool.iconName];
                            return (
                                <button
                                    key={tool.type}
                                    onClick={() => setSelectedAiTool(tool.type)}
                                    className={`p-2 rounded text-left transition-colors ${
                                        selectedAiTool === tool.type
                                            ? 'bg-yellow-500/20 border border-yellow-500/30'
                                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={selectedAiTool === tool.type ? 'text-yellow-400' : 'text-gray-400'}>
                                            {Icon && <Icon size={18} />}
                                        </span>
                                        <span className="text-xs font-medium">{tool.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Selected tool description */}
                    {selectedToolInfo && (
                        <div className="text-xs text-gray-500 bg-white/5 p-2 rounded">
                            {selectedToolInfo.description}
                        </div>
                    )}
                    
                    {/* Prompt input for tools that need it */}
                    {selectedToolInfo?.needsPrompt && (
                        <div className="space-y-2">
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder={
                                    selectedAiTool === 'inpaint' ? 'Describe what to paint in the selected area...' :
                                    selectedAiTool === 'generative_fill' ? 'Describe what to fill the selection with...' :
                                    selectedAiTool === 'style_transfer' ? 'Describe the style you want...' :
                                    'Enter a prompt...'
                                }
                                className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs resize-none focus:outline-none focus:border-yellow-500/50"
                                rows={3}
                            />
                        </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRunAiTool}
                            disabled={isProcessing || (selectedToolInfo?.needsPrompt && !aiPrompt)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Apply {selectedToolInfo?.label}
                                </>
                            )}
                        </button>
                        {selection && (
                            <button
                                onClick={onClearMask}
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                                title="Clear selection/mask"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    
                    {/* Operation queue */}
                    {aiOperations.length > 0 && (
                        <div className="space-y-1">
                            <div className="text-[10px] font-medium text-gray-500 uppercase">Recent Operations</div>
                            {aiOperations.slice(-3).reverse().map(op => (
                                <div
                                    key={op.id}
                                    className={`flex items-center gap-2 text-xs p-2 rounded ${
                                        op.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                        op.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                                        op.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-white/5'
                                    }`}
                                >
                                    {op.status === 'processing' && <Loader2 size={12} className="animate-spin" />}
                                    <span className="capitalize">{op.type.replace('_', ' ')}</span>
                                    <span className="ml-auto capitalize text-[10px]">{op.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
