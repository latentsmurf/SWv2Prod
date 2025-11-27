'use client';

import React, { useState } from 'react';
import { Wand2, Send, Loader2 } from 'lucide-react';

const STYLES = [
    { id: 'cinematic', name: 'Cinematic Realism', description: 'High-end film look with natural lighting.' },
    { id: 'anime', name: 'Anime Production', description: 'Vibrant, cel-shaded animation style.' },
    { id: 'noir', name: 'Film Noir', description: 'High contrast black and white with dramatic shadows.' },
    { id: 'scifi', name: 'Cyberpunk Sci-Fi', description: 'Neon-soaked futuristic aesthetic.' },
];

export function DirectorControl() {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedId, setGeneratedId] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt) return;

        setIsGenerating(true);
        try {
            // In a real app, this would call the Next.js API route which calls the Python backend
            console.log('Generating:', prompt, selectedStyle);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            setGeneratedId(`job_${Date.now()}`);
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-white">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-lg">
                    <Wand2 size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Director Styles</h2>
                    <p className="text-neutral-400">Inject prompts into Nano Banana Pro engine.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Scene Description</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the scene, lighting, camera angle, and action..."
                            className="w-full h-40 bg-neutral-800 border border-neutral-700 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-neutral-500 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Send size={20} /> Generate Scene
                            </>
                        )}
                    </button>

                    {generatedId && (
                        <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-center">
                            Generation started! Job ID: {generatedId}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-neutral-300">Visual Style</label>
                    <div className="space-y-3">
                        {STYLES.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`w-full text-left p-4 rounded-lg border transition-all ${selectedStyle === style.id
                                        ? 'bg-indigo-900/50 border-indigo-500 ring-1 ring-indigo-500'
                                        : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                                    }`}
                            >
                                <div className="font-semibold text-white">{style.name}</div>
                                <div className="text-xs text-neutral-400 mt-1">{style.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
