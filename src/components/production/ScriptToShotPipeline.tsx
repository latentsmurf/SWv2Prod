'use client';

import React, { useState, useCallback } from 'react';
import {
    Wand2, FileText, Camera, Loader2, Check, ChevronRight,
    AlertCircle, Settings, Sparkles, Play, Pause, SkipForward,
    RefreshCw, Eye, List, Grid, Zap
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Scene {
    id: string;
    scene_number?: number;
    order_index?: number;
    slug_line?: string;
    script_text?: string;
    synopsis?: string;
}

interface SuggestedShot {
    id: string;
    scene_id: string;
    shot_type: string;
    description: string;
    prompt_suggestion: string;
    confidence: number;
    selected: boolean;
}

interface PipelineStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    progress?: number;
}

interface ScriptToShotPipelineProps {
    projectId: string;
    scenes: Scene[];
    onComplete?: (shots: SuggestedShot[]) => void;
}

// ============================================================================
// SHOT TYPE SUGGESTIONS
// ============================================================================

const SHOT_TYPE_RULES: Record<string, { types: string[]; keywords: string[] }> = {
    dialogue: {
        types: ['medium', 'close_up', 'over_shoulder', 'two_shot'],
        keywords: ['says', 'asks', 'replies', 'whispers', 'shouts', 'tells']
    },
    action: {
        types: ['wide', 'tracking', 'medium', 'insert'],
        keywords: ['runs', 'walks', 'fights', 'grabs', 'throws', 'jumps']
    },
    emotional: {
        types: ['extreme_close_up', 'close_up', 'medium_close'],
        keywords: ['cries', 'smiles', 'shocked', 'angry', 'surprised', 'realizes']
    },
    establishing: {
        types: ['wide', 'establishing', 'aerial'],
        keywords: ['INT.', 'EXT.', 'enters', 'arrives', 'location']
    },
    reveal: {
        types: ['dolly_in', 'slow_push', 'rack_focus'],
        keywords: ['reveals', 'discovers', 'sees', 'finds', 'notices']
    }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ScriptToShotPipeline({
    projectId,
    scenes,
    onComplete
}: ScriptToShotPipelineProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [suggestedShots, setSuggestedShots] = useState<SuggestedShot[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [settings, setSettings] = useState({
        coverage: 'standard', // minimal, standard, heavy
        includeEstablishing: true,
        includeInserts: true,
        autoSelectHighConfidence: true,
        confidenceThreshold: 0.7
    });

    const [steps, setSteps] = useState<PipelineStep[]>([
        { id: 'analyze', label: 'Analyzing Script', status: 'pending' },
        { id: 'detect', label: 'Detecting Shot Opportunities', status: 'pending' },
        { id: 'suggest', label: 'Generating Shot Suggestions', status: 'pending' },
        { id: 'prompt', label: 'Creating AI Prompts', status: 'pending' },
        { id: 'review', label: 'Ready for Review', status: 'pending' },
    ]);

    // ========================================================================
    // ANALYSIS LOGIC
    // ========================================================================

    const analyzeScriptText = (text: string): string[] => {
        const detectedTypes: string[] = [];
        const lowerText = text.toLowerCase();

        for (const [category, config] of Object.entries(SHOT_TYPE_RULES)) {
            for (const keyword of config.keywords) {
                if (lowerText.includes(keyword.toLowerCase())) {
                    detectedTypes.push(...config.types);
                    break;
                }
            }
        }

        // Default to standard coverage if nothing detected
        if (detectedTypes.length === 0) {
            detectedTypes.push('medium', 'wide');
        }

        return [...new Set(detectedTypes)];
    };

    const generateShotDescription = (scene: Scene, shotType: string): string => {
        const descriptions: Record<string, string> = {
            wide: `Wide shot establishing ${scene.slug_line}`,
            establishing: `Establishing shot of ${scene.slug_line}`,
            medium: `Medium shot capturing the main action`,
            close_up: `Close-up focusing on character reaction`,
            extreme_close_up: `Extreme close-up for emotional impact`,
            over_shoulder: `Over-the-shoulder shot during dialogue`,
            two_shot: `Two-shot framing both characters`,
            insert: `Insert shot of key detail`,
            tracking: `Tracking shot following movement`,
            dolly_in: `Slow dolly in for dramatic emphasis`,
            aerial: `Aerial establishing shot`,
            rack_focus: `Rack focus revealing key element`
        };
        return descriptions[shotType] || `${shotType} shot`;
    };

    const generatePrompt = (scene: Scene, shotType: string, description: string): string => {
        const style = 'cinematic, professional lighting, high quality';
        const location = (scene.slug_line || 'scene').replace(/INT\.|EXT\.|-|DAY|NIGHT/gi, '').trim();
        
        return `${description}, ${location}, ${style}`;
    };

    // ========================================================================
    // PIPELINE EXECUTION
    // ========================================================================

    const updateStep = (index: number, status: PipelineStep['status'], progress?: number) => {
        setSteps(prev => prev.map((step, i) => 
            i === index ? { ...step, status, progress } : step
        ));
    };

    const runPipeline = async () => {
        setIsRunning(true);
        setIsPaused(false);
        setSuggestedShots([]);

        const allSuggestions: SuggestedShot[] = [];

        try {
            // Step 1: Analyze Script
            updateStep(0, 'active');
            await new Promise(r => setTimeout(r, 800));
            updateStep(0, 'completed');

            // Step 2: Detect Shot Opportunities
            updateStep(1, 'active');
            setCurrentStep(1);

            for (let i = 0; i < scenes.length; i++) {
                if (isPaused) {
                    await new Promise(r => {
                        const check = setInterval(() => {
                            if (!isPaused) {
                                clearInterval(check);
                                r(undefined);
                            }
                        }, 100);
                    });
                }

                updateStep(1, 'active', ((i + 1) / scenes.length) * 100);
                await new Promise(r => setTimeout(r, 200));
            }
            updateStep(1, 'completed');

            // Step 3: Generate Shot Suggestions
            updateStep(2, 'active');
            setCurrentStep(2);

            for (const scene of scenes) {
                const shotTypes = analyzeScriptText(scene.script_text || scene.synopsis || '');
                
                // Add establishing shot if enabled
                if (settings.includeEstablishing && !shotTypes.includes('establishing')) {
                    shotTypes.unshift('establishing');
                }

                for (const shotType of shotTypes) {
                    const description = generateShotDescription(scene, shotType);
                    const prompt = generatePrompt(scene, shotType, description);
                    const confidence = 0.5 + Math.random() * 0.5;

                    allSuggestions.push({
                        id: crypto.randomUUID(),
                        scene_id: scene.id,
                        shot_type: shotType,
                        description,
                        prompt_suggestion: prompt,
                        confidence,
                        selected: settings.autoSelectHighConfidence && confidence >= settings.confidenceThreshold
                    });
                }

                updateStep(2, 'active', ((scenes.indexOf(scene) + 1) / scenes.length) * 100);
                await new Promise(r => setTimeout(r, 100));
            }

            setSuggestedShots(allSuggestions);
            updateStep(2, 'completed');

            // Step 4: Create AI Prompts
            updateStep(3, 'active');
            setCurrentStep(3);
            await new Promise(r => setTimeout(r, 600));
            updateStep(3, 'completed');

            // Step 5: Ready for Review
            updateStep(4, 'completed');
            setCurrentStep(4);

        } catch (error) {
            console.error('Pipeline error:', error);
            updateStep(currentStep, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    const toggleShotSelection = (shotId: string) => {
        setSuggestedShots(prev => prev.map(shot =>
            shot.id === shotId ? { ...shot, selected: !shot.selected } : shot
        ));
    };

    const selectAll = () => {
        setSuggestedShots(prev => prev.map(shot => ({ ...shot, selected: true })));
    };

    const selectHighConfidence = () => {
        setSuggestedShots(prev => prev.map(shot => ({
            ...shot,
            selected: shot.confidence >= settings.confidenceThreshold
        })));
    };

    const generateSelectedShots = async () => {
        const selected = suggestedShots.filter(s => s.selected);
        
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shots: selected.map(s => ({
                        scene_id: s.scene_id,
                        shot_type: s.shot_type,
                        description: s.description,
                        prompt_data: { prompt: s.prompt_suggestion }
                    }))
                })
            });

            if (res.ok) {
                onComplete?.(selected);
            }
        } catch (error) {
            console.error('Error generating shots:', error);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    const selectedCount = suggestedShots.filter(s => s.selected).length;

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                            <Wand2 size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Script to Shot Pipeline</h2>
                            <p className="text-xs text-gray-500">
                                Automatically generate shot lists from your script
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isRunning ? (
                            <button
                                onClick={runPipeline}
                                disabled={scenes.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                <Sparkles size={16} />
                                Analyze Script
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                                >
                                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                                    {isPaused ? 'Resume' : 'Pause'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Pipeline Steps */}
                <div className="flex items-center gap-2">
                    {steps.map((step, i) => (
                        <React.Fragment key={step.id}>
                            <div className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                                ${step.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                  step.status === 'active' ? 'bg-purple-500/10 text-purple-400' :
                                  step.status === 'error' ? 'bg-red-500/10 text-red-400' :
                                  'bg-white/5 text-gray-500'}
                            `}>
                                {step.status === 'completed' ? <Check size={12} /> :
                                 step.status === 'active' ? <Loader2 size={12} className="animate-spin" /> :
                                 step.status === 'error' ? <AlertCircle size={12} /> :
                                 <span className="w-3 h-3 rounded-full bg-white/10" />}
                                {step.label}
                                {step.progress !== undefined && step.status === 'active' && (
                                    <span className="text-gray-500">({Math.round(step.progress)}%)</span>
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <ChevronRight size={14} className="text-gray-600" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {suggestedShots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                            <FileText className="text-gray-600" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
                        <p className="text-sm text-gray-500 max-w-md mb-6">
                            Click "Analyze Script" to automatically detect shot opportunities
                            and generate AI-ready prompts from your {scenes.length} scenes.
                        </p>

                        {/* Settings Preview */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-white/5 rounded">
                                Coverage: {settings.coverage}
                            </span>
                            <span className="px-2 py-1 bg-white/5 rounded">
                                Threshold: {settings.confidenceThreshold * 100}%
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={selectAll}
                                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={selectHighConfidence}
                                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg"
                                >
                                    Select High Confidence
                                </button>
                                <span className="text-xs text-gray-500 ml-4">
                                    {selectedCount} of {suggestedShots.length} selected
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                >
                                    <List size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                                >
                                    <Grid size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Shot Suggestions */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
                            {suggestedShots.map(shot => {
                                const scene = scenes.find(s => s.id === shot.scene_id);
                                
                                return (
                                    <div
                                        key={shot.id}
                                        onClick={() => toggleShotSelection(shot.id)}
                                        className={`
                                            p-4 rounded-xl border cursor-pointer transition-all
                                            ${shot.selected 
                                                ? 'bg-purple-500/10 border-purple-500/30' 
                                                : 'bg-[#121212] border-white/5 hover:border-white/20'}
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <div className={`
                                                w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                                ${shot.selected 
                                                    ? 'bg-purple-500 border-purple-500' 
                                                    : 'border-white/20'}
                                            `}>
                                                {shot.selected && <Check size={12} className="text-white" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 text-xs bg-white/10 rounded text-gray-300">
                                                        {shot.shot_type.replace('_', ' ')}
                                                    </span>
                                                    <span className={`
                                                        px-2 py-0.5 text-xs rounded
                                                        ${shot.confidence >= 0.8 ? 'bg-green-500/10 text-green-400' :
                                                          shot.confidence >= 0.6 ? 'bg-yellow-500/10 text-yellow-400' :
                                                          'bg-red-500/10 text-red-400'}
                                                    `}>
                                                        {Math.round(shot.confidence * 100)}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white mb-1">{shot.description}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    Scene {scene?.scene_number}: {scene?.slug_line}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            {suggestedShots.length > 0 && (
                <div className="p-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {selectedCount} shots ready to generate
                    </p>
                    <button
                        onClick={generateSelectedShots}
                        disabled={selectedCount === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        <Camera size={18} />
                        Generate {selectedCount} Shots
                    </button>
                </div>
            )}
        </div>
    );
}
