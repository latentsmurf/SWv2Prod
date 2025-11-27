'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Loader2, Sparkles, Film, Clapperboard, Ghost, Tv } from 'lucide-react';
import AssetCard from '@/components/assets/AssetCard';

// Types
interface StylePreset {
    id: string;
    name: string;
    thumbnail_url: string;
    description?: string;
}

interface WizardState {
    step: number;
    projectName: string;
    genre: string;
    stylePresetId: string | null;
    autoGenerateCast: boolean;
}

export default function GreenlightWizard() {
    const router = useRouter();

    const [state, setState] = useState<WizardState>({
        step: 1,
        projectName: '',
        genre: '',
        stylePresetId: null,
        autoGenerateCast: false,
    });

    const [presets, setPresets] = useState<StylePreset[]>([]);
    const [loadingPresets, setLoadingPresets] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch presets on mount
    useEffect(() => {
        async function fetchPresets() {
            try {
                setLoadingPresets(true);
                const res = await fetch('/api/style_presets');
                if (res.ok) {
                    const data = await res.json();
                    setPresets(data);
                } else {
                    throw new Error('Failed to fetch presets');
                }
            } catch (err) {
                console.error('Error fetching presets:', err);
                // Fallback mock
                setPresets([
                    { id: '1', name: 'The Anderson', thumbnail_url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&q=80&w=300&h=200', description: 'Symmetrical, pastel, quirky' },
                    { id: '2', name: 'The Kubrick', thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=200', description: 'One-point perspective, cold, intense' },
                ]);
            } finally {
                setLoadingPresets(false);
            }
        }
        fetchPresets();
    }, []);

    const handleNext = () => {
        if (state.step < 3) {
            setState(prev => ({ ...prev, step: prev.step + 1 }));
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (state.step > 1) {
            setState(prev => ({ ...prev, step: prev.step - 1 }));
        }
    };

    const handleFinish = async () => {
        try {
            setSubmitting(true);

            // 1. Create Project
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: state.projectName,
                    genre: state.genre,
                    style_preset_id: state.stylePresetId,
                    status: 'pre-production'
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create project');
            }

            const project = await res.json();

            // 2. Trigger Auto-Generate Cast if selected
            if (state.autoGenerateCast && project) {
                console.log('Triggering auto-generation for cast...');
                const roles = ['Protagonist', 'Antagonist'];

                await Promise.all(roles.map(async (role) => {
                    try {
                        await fetch('/api/generate/asset', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                project_id: project.id,
                                type: 'cast',
                                name: `${role} for ${state.projectName}`,
                                prompt: `A cinematic character portrait of the ${role.toLowerCase()} for a ${state.genre} movie titled "${state.projectName}". Detailed, photorealistic.`,
                                definition: {
                                    role: role,
                                    archetype: role === 'Protagonist' ? 'Hero' : 'Villain'
                                }
                            }),
                        });
                    } catch (e) {
                        console.error(`Failed to generate ${role}:`, e);
                    }
                }));
            }

            // 3. Redirect
            router.push(`/production?projectId=${project?.id}`);

        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const isStepValid = () => {
        switch (state.step) {
            case 1: return state.projectName.trim().length > 0 && state.genre.length > 0;
            case 2: return !!state.stylePresetId;
            case 3: return true; // Always valid, optional
            default: return false;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Greenlight New Project</h2>
                        <p className="text-gray-400 text-sm mt-1">Step {state.step} of 3</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`h-2 w-12 rounded-full transition-all duration-300 ${i <= state.step ? 'bg-yellow-500' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* Step 1: The Pitch */}
                    {state.step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="block text-lg font-medium text-white">Project Name</label>
                                <input
                                    type="text"
                                    value={state.projectName}
                                    onChange={(e) => setState(prev => ({ ...prev, projectName: e.target.value }))}
                                    placeholder="e.g. The Last Starship"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-lg font-medium text-white">Genre</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'sci-fi', label: 'Sci-Fi', icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                                        { id: 'horror', label: 'Horror', icon: Ghost, color: 'text-red-500', bg: 'bg-red-500/10' },
                                        { id: 'commercial', label: 'Commercial', icon: Tv, color: 'text-green-400', bg: 'bg-green-400/10' },
                                    ].map((genre) => (
                                        <button
                                            key={genre.id}
                                            onClick={() => setState(prev => ({ ...prev, genre: genre.id }))}
                                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200
                        ${state.genre === genre.id
                                                    ? 'border-yellow-500 bg-white/5'
                                                    : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                                }
                      `}
                                        >
                                            <div className={`p-3 rounded-full ${genre.bg} ${genre.color}`}>
                                                <genre.icon size={24} />
                                            </div>
                                            <span className="font-medium text-white">{genre.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: The Look */}
                    {state.step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-xl font-medium text-white">Choose a Visual Style</h3>
                            {loadingPresets ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-yellow-500" size={32} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {presets.map((preset) => (
                                        <div
                                            key={preset.id}
                                            onClick={() => setState(prev => ({ ...prev, stylePresetId: preset.id }))}
                                            className={`cursor-pointer relative rounded-xl transition-all duration-200 ring-2 ring-offset-4 ring-offset-[#0a0a0a]
                        ${state.stylePresetId === preset.id ? 'ring-yellow-500 scale-[1.02]' : 'ring-transparent hover:ring-white/20'}
                      `}
                                        >
                                            <AssetCard
                                                title={preset.name}
                                                subtitle={preset.description}
                                                imageUrl={preset.thumbnail_url}
                                            />
                                            {state.stylePresetId === preset.id && (
                                                <div className="absolute top-3 right-3 bg-yellow-500 text-black p-1 rounded-full shadow-lg z-10">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: The Cast */}
                    {state.step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Assemble Your Cast</h3>
                                <p className="text-gray-400">Ready to bring your characters to life?</p>
                            </div>

                            <div
                                onClick={() => setState(prev => ({ ...prev, autoGenerateCast: !prev.autoGenerateCast }))}
                                className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-8 flex flex-col items-center text-center gap-4
                  ${state.autoGenerateCast
                                        ? 'border-yellow-500 bg-yellow-500/10'
                                        : 'border-white/10 hover:border-white/30 bg-white/5'
                                    }
                `}
                            >
                                <div className={`p-4 rounded-full transition-colors ${state.autoGenerateCast ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">Auto-Generate Cast</h4>
                                    <p className="text-gray-400 max-w-md mx-auto">
                                        Our AI will analyze your genre and style to create 2 unique character portraits instantly.
                                    </p>
                                </div>
                                {state.autoGenerateCast && (
                                    <div className="absolute top-4 right-4 text-yellow-500">
                                        <Check size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <p className="text-sm text-gray-500 italic">
                                    * You can always add or edit characters later in Production.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-white/5 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={state.step === 1}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors
              ${state.step === 1
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                            }
            `}
                    >
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!isStepValid() || submitting}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black transition-all
              ${!isStepValid() || submitting
                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                            }
            `}
                    >
                        {submitting ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {state.step === 3 ? 'Greenlight Project' : 'Next Step'}
                                {state.step < 3 && <ArrowRight size={20} />}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
