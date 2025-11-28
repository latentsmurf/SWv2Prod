'use client';

import React, { useState } from 'react';
import {
    Film, Play, Clapperboard, Music2, Megaphone, Newspaper,
    Video, Sparkles, ArrowRight, Check, Loader2, X
} from 'lucide-react';

interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    genre: string;
    defaultScenes: number;
    defaultCoverage: string;
    styleMode: 'storyboard' | 'cinematic';
    features: string[];
}

const TEMPLATES: ProjectTemplate[] = [
    {
        id: 'short_film',
        name: 'Short Film',
        description: 'Narrative storytelling with cinematic coverage',
        icon: Film,
        color: 'text-purple-400',
        gradient: 'from-purple-500/20 to-violet-500/10',
        genre: 'drama',
        defaultScenes: 5,
        defaultCoverage: 'standard',
        styleMode: 'cinematic',
        features: ['Scene breakdown', 'Coverage presets', 'Shot list generation']
    },
    {
        id: 'music_video',
        name: 'Music Video',
        description: 'High-energy visuals synced to music',
        icon: Music2,
        color: 'text-pink-400',
        gradient: 'from-pink-500/20 to-rose-500/10',
        genre: 'music',
        defaultScenes: 3,
        defaultCoverage: 'heavy',
        styleMode: 'cinematic',
        features: ['Beat-synced shots', 'Performance coverage', 'B-roll generation']
    },
    {
        id: 'commercial',
        name: 'Commercial',
        description: 'Product-focused storytelling for brands',
        icon: Megaphone,
        color: 'text-yellow-400',
        gradient: 'from-yellow-500/20 to-orange-500/10',
        genre: 'commercial',
        defaultScenes: 2,
        defaultCoverage: 'commercial',
        styleMode: 'cinematic',
        features: ['Product shots', 'Lifestyle scenes', 'Call-to-action frames']
    },
    {
        id: 'documentary',
        name: 'Documentary',
        description: 'Interview-driven storytelling',
        icon: Newspaper,
        color: 'text-blue-400',
        gradient: 'from-blue-500/20 to-cyan-500/10',
        genre: 'documentary',
        defaultScenes: 4,
        defaultCoverage: 'documentary',
        styleMode: 'cinematic',
        features: ['Interview setups', 'B-roll sequences', 'Voice-over support']
    },
    {
        id: 'trailer',
        name: 'Movie Trailer',
        description: 'Fast-paced teaser for your story',
        icon: Play,
        color: 'text-red-400',
        gradient: 'from-red-500/20 to-orange-500/10',
        genre: 'action',
        defaultScenes: 8,
        defaultCoverage: 'minimal',
        styleMode: 'cinematic',
        features: ['High-impact moments', 'Quick cuts', 'Title cards']
    },
    {
        id: 'storyboard',
        name: 'Storyboard Only',
        description: 'Pre-visualization for pitching',
        icon: Clapperboard,
        color: 'text-gray-400',
        gradient: 'from-gray-500/20 to-slate-500/10',
        genre: 'general',
        defaultScenes: 10,
        defaultCoverage: 'standard',
        styleMode: 'storyboard',
        features: ['Line art style', 'Quick generation', 'Export to PDF']
    },
];

interface ProjectTemplatesProps {
    onSelectTemplate: (template: ProjectTemplate) => void;
    onSkip?: () => void;
}

export default function ProjectTemplates({ onSelectTemplate, onSkip }: ProjectTemplatesProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (template: ProjectTemplate) => {
        setSelectedId(template.id);
        setLoading(true);
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onSelectTemplate(template);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-2xl mb-6">
                        <Sparkles className="text-yellow-500" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold mb-3">
                        Choose a Template
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Start with a template optimized for your project type, or skip to customize everything from scratch.
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {TEMPLATES.map((template) => {
                        const Icon = template.icon;
                        const isSelected = selectedId === template.id;

                        return (
                            <button
                                key={template.id}
                                onClick={() => handleSelect(template)}
                                disabled={loading}
                                className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    isSelected
                                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/20 scale-[1.02]'
                                        : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                                }`}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${template.gradient} opacity-50`} />
                                
                                {/* Content */}
                                <div className="relative">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${template.color}`}>
                                        {isSelected && loading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <Icon size={24} />
                                        )}
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {template.name}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        {template.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-1.5">
                                        {template.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                                <Check size={12} className="text-green-500" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-0 right-0 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                            template.styleMode === 'cinematic' 
                                                ? 'bg-purple-500/20 text-purple-400' 
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {template.styleMode}
                                        </span>
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <Check size={14} className="text-black" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="text-center">
                    <button
                        onClick={onSkip}
                        className="text-gray-500 hover:text-white text-sm flex items-center gap-2 mx-auto"
                    >
                        Skip and start from scratch
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Compact Template Selector for inline use
export function TemplateSelector({
    onSelect,
    compact = false
}: {
    onSelect: (template: ProjectTemplate) => void;
    compact?: boolean;
}) {
    return (
        <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-4'}`}>
            {TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className={`flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors ${
                            compact ? 'text-left' : ''
                        }`}
                    >
                        <div className={`p-2 rounded-lg bg-white/5 ${template.color}`}>
                            <Icon size={compact ? 16 : 20} />
                        </div>
                        <div className="text-left">
                            <p className={`font-medium text-white ${compact ? 'text-sm' : ''}`}>
                                {template.name}
                            </p>
                            {!compact && (
                                <p className="text-xs text-gray-500">{template.description}</p>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
