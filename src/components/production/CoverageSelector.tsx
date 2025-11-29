'use client';

import React from 'react';
import { X, Check, Camera, Clapperboard } from 'lucide-react';
import { CoveragePresetType } from '@/types';
import { COVERAGE_PRESETS, SHOT_TYPE_LABELS } from '@/lib/coverage-presets';

interface CoverageSelectorProps {
    currentPreset: CoveragePresetType;
    onSelect: (preset: CoveragePresetType) => void;
    onClose: () => void;
}

export default function CoverageSelector({ currentPreset, onSelect, onClose }: CoverageSelectorProps) {
    const presets = Object.values(COVERAGE_PRESETS);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clapperboard className="text-yellow-500" />
                            Coverage Preset
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Choose how thoroughly to cover this scene
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Presets Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                    {presets.map((preset) => {
                        const isSelected = currentPreset === preset.id;
                        return (
                            <button
                                key={preset.id}
                                onClick={() => onSelect(preset.id)}
                                className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                                    isSelected
                                        ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                            >
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                                        <Check size={14} className="text-black" />
                                    </div>
                                )}

                                <div className="text-3xl mb-3">{preset.icon}</div>
                                
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {preset.name}
                                </h3>
                                
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                    {preset.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm">
                                    <Camera size={14} className="text-gray-500" />
                                    <span className="text-gray-300">
                                        {preset.shotCount.min}-{preset.shotCount.max} shots
                                    </span>
                                </div>

                                {/* Shot Types Preview */}
                                <div className="mt-4 flex flex-wrap gap-1">
                                    {preset.shotTypes.slice(0, 5).map((type) => (
                                        <span
                                            key={type}
                                            className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-gray-400 rounded"
                                        >
                                            {SHOT_TYPE_LABELS[type]?.abbrev || type}
                                        </span>
                                    ))}
                                    {preset.shotTypes.length > 5 && (
                                        <span className="px-2 py-0.5 text-[10px] font-mono text-gray-500">
                                            +{preset.shotTypes.length - 5}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer with explanation */}
                <div className="p-4 bg-white/5 border-t border-white/5">
                    <p className="text-xs text-gray-500 text-center">
                        Coverage presets determine the variety and number of shots generated for your scene.
                        You can always add or remove individual shots after generation.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Compact inline version for use in forms
export function CoverageSelectorInline({ 
    currentPreset, 
    onSelect 
}: { 
    currentPreset: CoveragePresetType; 
    onSelect: (preset: CoveragePresetType) => void;
}) {
    const presets = Object.values(COVERAGE_PRESETS);
    
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {presets.map((preset) => {
                const isSelected = currentPreset === preset.id;
                return (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all ${
                            isSelected
                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                        }`}
                    >
                        <span className="mr-2">{preset.icon}</span>
                        <span className="text-sm font-medium">{preset.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

// Style Mode Selector (Storyboard vs Cinematic)
export function StyleModeSelector({
    currentMode,
    onSelect
}: {
    currentMode: 'storyboard' | 'cinematic';
    onSelect: (mode: 'storyboard' | 'cinematic') => void;
}) {
    const modes = [
        {
            id: 'storyboard' as const,
            name: 'Storyboard',
            icon: '✏️',
            description: 'Line art, grayscale, focus on framing'
        },
        {
            id: 'cinematic' as const,
            name: 'Cinematic',
            icon: '🎬',
            description: 'Full color, photorealistic, dramatic lighting'
        }
    ];

    return (
        <div className="flex gap-3">
            {modes.map((mode) => {
                const isSelected = currentMode === mode.id;
                return (
                    <button
                        key={mode.id}
                        onClick={() => onSelect(mode.id)}
                        className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                                ? 'border-yellow-500 bg-yellow-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{mode.icon}</span>
                            <div>
                                <h4 className="font-medium text-white">{mode.name}</h4>
                                <p className="text-xs text-gray-500">{mode.description}</p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
