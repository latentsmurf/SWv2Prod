'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles, Film, FileText, Camera, Palette, Users, 
    ChevronRight, ChevronLeft, Check, Play, Keyboard,
    Smartphone, Video, Tv, X, Zap, ArrowRight, Star
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

interface OnboardingWizardProps {
    onComplete?: () => void;
    onSkip?: () => void;
}

// ============================================================================
// KEYBOARD SHORTCUTS CONTENT
// ============================================================================

const KEYBOARD_SHORTCUTS = [
    { keys: ['⌘', 'K'], action: 'Quick Search', description: 'Find anything in your project' },
    { keys: ['⌘', '/'], action: 'Keyboard Shortcuts', description: 'View all shortcuts' },
    { keys: ['⌘', 'N'], action: 'New Project', description: 'Create a new project' },
    { keys: ['Space'], action: 'Play/Pause', description: 'Control playback' },
    { keys: ['G'], action: 'Generate', description: 'Generate selected shots' },
    { keys: ['⌘', 'S'], action: 'Save', description: 'Save current work' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem('onboarding_completed');
        if (seen === 'true') {
            setHasSeenOnboarding(true);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('sw_onboarding_completed', 'true'); // Also set the key ProductionLayout checks
        onComplete?.();
    };

    const handleSkip = () => {
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('sw_onboarding_completed', 'true'); // Also set the key ProductionLayout checks
        onSkip?.();
        onComplete?.(); // Also call onComplete as fallback to close the wizard
    };

    // ========================================================================
    // STEPS
    // ========================================================================

    const steps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Welcome to SceneWeaver',
            description: 'Your AI-powered production studio',
            icon: <Sparkles className="text-pink-400" size={32} />,
            content: (
                <div className="text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-pink-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Welcome to SceneWeaver
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Create stunning AI-generated videos, from script to screen. 
                        Perfect for micro dramas, short films, and commercials.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <Check size={16} className="text-green-400" />
                            AI Image & Video Generation
                        </span>
                        <span className="flex items-center gap-2">
                            <Check size={16} className="text-green-400" />
                            Script to Shot Pipeline
                        </span>
                        <span className="flex items-center gap-2">
                            <Check size={16} className="text-green-400" />
                            Professional Editor
                        </span>
                    </div>
                </div>
            )
        },
        {
            id: 'project-type',
            title: 'What are you creating?',
            description: 'We\'ll customize your workspace',
            icon: <Film className="text-blue-400" size={32} />,
            content: (
                <div>
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        What are you creating?
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                        Choose your project type for an optimized experience
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {[
                            {
                                id: 'micro-drama',
                                icon: <Smartphone size={24} />,
                                title: 'Micro Drama',
                                description: 'Vertical series for ReelShort, DramaBox',
                                color: 'from-pink-500/20 to-rose-500/20',
                                border: 'border-pink-500/30'
                            },
                            {
                                id: 'short-film',
                                icon: <Film size={24} />,
                                title: 'Short Film',
                                description: 'Festival-ready narrative films',
                                color: 'from-blue-500/20 to-cyan-500/20',
                                border: 'border-blue-500/30'
                            },
                            {
                                id: 'commercial',
                                icon: <Video size={24} />,
                                title: 'Commercial',
                                description: 'Ads and promotional content',
                                color: 'from-green-500/20 to-emerald-500/20',
                                border: 'border-green-500/30'
                            },
                            {
                                id: 'series',
                                icon: <Tv size={24} />,
                                title: 'TV Series',
                                description: 'Episodic content production',
                                color: 'from-purple-500/20 to-indigo-500/20',
                                border: 'border-purple-500/30'
                            }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`
                                    p-6 rounded-2xl text-left transition-all
                                    bg-gradient-to-br ${type.color}
                                    ${selectedType === type.id 
                                        ? `border-2 ${type.border} ring-2 ring-white/10` 
                                        : 'border border-white/10 hover:border-white/20'}
                                `}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-white">{type.icon}</div>
                                    {selectedType === type.id && (
                                        <Check size={18} className="text-green-400 ml-auto" />
                                    )}
                                </div>
                                <h3 className="text-white font-semibold mb-1">{type.title}</h3>
                                <p className="text-sm text-gray-400">{type.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'workflow',
            title: 'Your Workflow',
            description: 'How SceneWeaver works',
            icon: <Zap className="text-yellow-400" size={32} />,
            content: (
                <div>
                    <h2 className="text-2xl font-bold text-white text-center mb-8">
                        From Script to Screen in 4 Steps
                    </h2>
                    <div className="flex items-start justify-center gap-4 max-w-4xl mx-auto">
                        {[
                            { icon: <FileText />, title: 'Write', desc: 'Import or write your script with AI assistance' },
                            { icon: <Camera />, title: 'Generate', desc: 'AI creates images and videos from your scenes' },
                            { icon: <Palette />, title: 'Edit', desc: 'Refine in the professional video editor' },
                            { icon: <Film />, title: 'Export', desc: 'Deliver to any platform in any format' }
                        ].map((step, i) => (
                            <React.Fragment key={step.title}>
                                <div className="flex-1 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-white">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                                    <p className="text-sm text-gray-500">{step.desc}</p>
                                </div>
                                {i < 3 && (
                                    <ArrowRight size={20} className="text-gray-600 mt-7 flex-shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'shortcuts',
            title: 'Keyboard Shortcuts',
            description: 'Work faster with shortcuts',
            icon: <Keyboard className="text-purple-400" size={32} />,
            content: (
                <div>
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        Essential Shortcuts
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                        Master these to speed up your workflow
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                        {KEYBOARD_SHORTCUTS.map(shortcut => (
                            <div
                                key={shortcut.action}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                            >
                                <div className="flex items-center gap-1">
                                    {shortcut.keys.map((key, i) => (
                                        <kbd
                                            key={i}
                                            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white font-mono"
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium">{shortcut.action}</p>
                                    <p className="text-xs text-gray-500 truncate">{shortcut.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'ready',
            title: 'You\'re Ready!',
            description: 'Start creating',
            icon: <Star className="text-yellow-400" size={32} />,
            content: (
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <Check className="text-green-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        You're All Set!
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        You're ready to create amazing content with SceneWeaver. 
                        Start with a template or create from scratch.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard?showTemplates=true')}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                        >
                            <Sparkles size={18} />
                            Browse Templates
                        </button>
                        <button
                            onClick={() => router.push('/production')}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-bold transition-colors"
                        >
                            Start Creating
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )
        }
    ];

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Skip button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-500 hover:text-white flex items-center gap-1"
                    >
                        Skip intro
                        <X size={14} />
                    </button>
                </div>

                {/* Main content */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden">
                    {/* Progress bar */}
                    <div className="h-1 bg-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-2 py-6">
                        {steps.map((step, i) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(i)}
                                className={`
                                    w-2 h-2 rounded-full transition-all
                                    ${i === currentStep 
                                        ? 'w-8 bg-white' 
                                        : i < currentStep 
                                            ? 'bg-white/50' 
                                            : 'bg-white/20'}
                                `}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-8 min-h-[400px] flex items-center justify-center">
                        {currentStepData.content}
                    </div>

                    {/* Navigation */}
                    <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            disabled={isFirstStep}
                            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>

                        {isLastStep ? (
                            <button
                                onClick={handleComplete}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-bold transition-colors"
                            >
                                Get Started
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
                            >
                                Continue
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to check if onboarding should show
export function useShowOnboarding(): boolean {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('onboarding_completed');
        setShow(completed !== 'true');
    }, []);

    return show;
}
