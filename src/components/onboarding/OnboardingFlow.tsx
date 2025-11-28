'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Film, FileText, Image, Users, MapPin, Palette, Sparkles,
    ChevronRight, ChevronLeft, Check, X, Play, ArrowRight,
    Lightbulb, Rocket, Target, Wand2
} from 'lucide-react';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    content: React.ReactNode;
}

interface OnboardingFlowProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    const steps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Welcome to SceneWeaver',
            description: 'AI-powered video production studio',
            icon: Rocket,
            color: 'text-yellow-500',
            content: (
                <div className="text-center py-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6">
                        <Film className="text-black" size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Welcome to SceneWeaver
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Create stunning videos with AI. From script to screen, 
                        SceneWeaver handles the heavy lifting so you can focus on your creative vision.
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        {[
                            { icon: FileText, label: 'Write Scripts' },
                            { icon: Image, label: 'Generate Shots' },
                            { icon: Film, label: 'Export Videos' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-xl">
                                <item.icon className="mx-auto text-yellow-500 mb-2" size={24} />
                                <p className="text-sm text-gray-400">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'workflow',
            title: 'Your Workflow',
            description: 'How SceneWeaver works',
            icon: Target,
            color: 'text-blue-500',
            content: (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">
                        Four Steps to Video Magic
                    </h2>
                    <div className="space-y-4 max-w-xl mx-auto">
                        {[
                            { 
                                step: 1, 
                                title: 'Write Your Script', 
                                desc: 'Use our AI-assisted script editor with scene detection',
                                icon: FileText,
                                color: 'bg-purple-500'
                            },
                            { 
                                step: 2, 
                                title: 'Build Your Library', 
                                desc: 'Define cast, locations, wardrobe, and props',
                                icon: Users,
                                color: 'bg-blue-500'
                            },
                            { 
                                step: 3, 
                                title: 'Generate Storyboard', 
                                desc: 'AI creates shot-by-shot visuals from your script',
                                icon: Image,
                                color: 'bg-green-500'
                            },
                            { 
                                step: 4, 
                                title: 'Export & Share', 
                                desc: 'Download as video, PDF, or share for review',
                                icon: Film,
                                color: 'bg-yellow-500'
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-white font-bold">{item.step}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                                <item.icon className="text-gray-600" size={20} />
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'library',
            title: 'Production Library',
            description: 'Your creative assets',
            icon: Palette,
            color: 'text-purple-500',
            content: (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        Build Your Production Library
                    </h2>
                    <p className="text-gray-500 text-center mb-8">
                        Define your visual world once, use it everywhere
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                        {[
                            { 
                                icon: Users, 
                                label: 'Cast', 
                                desc: 'Characters with consistent looks',
                                color: 'text-purple-400',
                                examples: ['Hero, 30s, confident', 'Villain, 50s, mysterious']
                            },
                            { 
                                icon: MapPin, 
                                label: 'Locations', 
                                desc: 'Places your story unfolds',
                                color: 'text-blue-400',
                                examples: ['Neon-lit office', 'Abandoned warehouse']
                            },
                            { 
                                icon: Image, 
                                label: 'Wardrobe', 
                                desc: 'Costumes and outfits',
                                color: 'text-pink-400',
                                examples: ['Business suit', 'Tactical gear']
                            },
                            { 
                                icon: Sparkles, 
                                label: 'Props', 
                                desc: 'Objects in your scenes',
                                color: 'text-orange-400',
                                examples: ['Futuristic laptop', 'Ancient artifact']
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-xl">
                                <item.icon className={`${item.color} mb-3`} size={24} />
                                <h3 className="font-medium text-white mb-1">{item.label}</h3>
                                <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
                                <div className="space-y-1">
                                    {item.examples.map((ex, j) => (
                                        <p key={j} className="text-[10px] text-gray-600 italic">"{ex}"</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'ai',
            title: 'AI Features',
            description: 'Let AI do the work',
            icon: Wand2,
            color: 'text-green-500',
            content: (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        AI-Powered Production
                    </h2>
                    <p className="text-gray-500 text-center mb-8">
                        Advanced AI handles the technical work
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                        {[
                            { label: 'Shot Breakdown', desc: 'Auto-generate shots from script' },
                            { label: 'Image Generation', desc: 'Create storyboard frames' },
                            { label: 'Voice Over', desc: 'AI narration and dialogue' },
                            { label: 'Music Generation', desc: 'Original soundtracks' },
                            { label: 'Character Consistency', desc: 'Same look across shots' },
                            { label: 'Style Transfer', desc: 'Apply visual styles' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check size={16} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'ready',
            title: 'Ready to Create',
            description: 'Start your first project',
            icon: Rocket,
            color: 'text-yellow-500',
            content: (
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6">
                        <Check className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        You're All Set!
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Start with a template or create a blank project. 
                        Remember, you can always access help with <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘ /</kbd>
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/new-project?template=true')}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors"
                        >
                            <Lightbulb size={18} />
                            Start with Template
                        </button>
                        <button
                            onClick={() => router.push('/new-project')}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
                        >
                            <Sparkles size={18} />
                            Create New Project
                        </button>
                    </div>
                </div>
            )
        },
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCompletedSteps(prev => [...prev, steps[currentStep].id]);
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;

    return (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5 ${currentStepData.color}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length}</p>
                        <h3 className="font-medium text-white">{currentStepData.title}</h3>
                    </div>
                </div>
                <button
                    onClick={onSkip}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Progress */}
            <div className="px-6">
                <div className="flex items-center gap-2">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex-1 h-1 rounded-full transition-colors ${
                                index <= currentStep ? 'bg-yellow-500' : 'bg-white/10'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6">
                <div className="max-w-2xl mx-auto py-8">
                    {currentStepData.content}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 border-t border-white/5">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>

                <div className="flex items-center gap-2">
                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentStep ? 'bg-yellow-500' : 'bg-white/20 hover:bg-white/40'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
                >
                    {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

// Hook to manage onboarding state
export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem('sw_onboarding_completed');
        if (!completed) {
            setHasCompletedOnboarding(false);
            setShowOnboarding(true);
        }
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem('sw_onboarding_completed', 'true');
        setHasCompletedOnboarding(true);
        setShowOnboarding(false);
    };

    const skipOnboarding = () => {
        localStorage.setItem('sw_onboarding_completed', 'skipped');
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem('sw_onboarding_completed');
        setHasCompletedOnboarding(false);
        setShowOnboarding(true);
    };

    return {
        showOnboarding,
        hasCompletedOnboarding,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding
    };
}

// Tooltip hint component for feature discovery
export function FeatureHint({
    id,
    title,
    description,
    position = 'bottom'
}: {
    id: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}) {
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const dismissedHints = JSON.parse(localStorage.getItem('sw_dismissed_hints') || '[]');
        if (dismissedHints.includes(id)) {
            setDismissed(true);
        }
    }, [id]);

    const handleDismiss = () => {
        const dismissedHints = JSON.parse(localStorage.getItem('sw_dismissed_hints') || '[]');
        localStorage.setItem('sw_dismissed_hints', JSON.stringify([...dismissedHints, id]));
        setDismissed(true);
    };

    if (dismissed) return null;

    const positionClasses = {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
    };

    return (
        <div className={`absolute ${positionClasses[position]} z-50 w-64 p-4 bg-yellow-500 rounded-xl shadow-xl`}>
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-black/50 hover:text-black"
            >
                <X size={14} />
            </button>
            <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-black flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-black text-sm">{title}</h4>
                    <p className="text-xs text-black/70 mt-1">{description}</p>
                </div>
            </div>
            <div className={`absolute w-3 h-3 bg-yellow-500 rotate-45 ${
                position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2' :
                position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2' :
                position === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2' :
                '-left-1.5 top-1/2 -translate-y-1/2'
            }`} />
        </div>
    );
}
