'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Smartphone, Film, Video, Tv, Music, Megaphone, Sparkles,
    ChevronRight, Check, Loader2, Clock, Users, Layers, Zap,
    Heart, Skull, Crown, Building2, Ghost, Flame
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: 'micro-drama' | 'film' | 'commercial' | 'music-video' | 'documentary';
    icon: React.ReactNode;
    color: string;
    bgGradient: string;
    features: string[];
    defaults: {
        genre?: string;
        episode_count?: number;
        aspect_ratio?: string;
        style_preset?: string;
        coverage_preset?: string;
        delivery_formats?: string[];
    };
    scenes?: {
        slug_line: string;
        synopsis: string;
    }[];
    estimated_duration?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// ============================================================================
// TEMPLATES DATA
// ============================================================================

const TEMPLATES: ProjectTemplate[] = [
    // Micro Drama Templates
    {
        id: 'ceo-romance',
        name: 'CEO Romance',
        description: 'Classic billionaire romance with contract marriage, mistaken identity, and dramatic reveals.',
        category: 'micro-drama',
        icon: <Heart size={24} />,
        color: 'text-pink-400',
        bgGradient: 'from-pink-500/20 to-rose-500/20',
        features: ['10 episodes pre-structured', 'Cliffhanger endings', 'Office & luxury settings', 'Dramatic confrontations'],
        defaults: {
            genre: 'micro-ceo-romance',
            episode_count: 10,
            aspect_ratio: '9:16',
            style_preset: 'romantic-glow',
            delivery_formats: ['reelshort', 'dramabox']
        },
        scenes: [
            { slug_line: 'INT. OFFICE LOBBY - DAY', synopsis: 'Protagonist accidentally spills coffee on mysterious CEO.' },
            { slug_line: 'INT. CEO OFFICE - DAY', synopsis: 'Shocking job offer with unusual conditions.' },
            { slug_line: 'INT. LUXURY APARTMENT - NIGHT', synopsis: 'Contract signing with hidden terms.' },
        ],
        estimated_duration: '15-20 min total',
        difficulty: 'beginner'
    },
    {
        id: 'revenge-drama',
        name: 'Revenge Arc',
        description: 'Betrayal, downfall, and triumphant return. Perfect for "they didnt know who they were messing with" moments.',
        category: 'micro-drama',
        icon: <Flame size={24} />,
        color: 'text-orange-400',
        bgGradient: 'from-orange-500/20 to-red-500/20',
        features: ['25 episodes', 'Flashback structure', 'Transformation reveals', 'Villain comeuppance'],
        defaults: {
            genre: 'micro-revenge',
            episode_count: 25,
            aspect_ratio: '9:16',
            style_preset: 'tension-dark',
            delivery_formats: ['reelshort', 'tiktok-series']
        },
        scenes: [
            { slug_line: 'INT. MANSION - DAY', synopsis: 'Protagonist is humiliated and cast out.' },
            { slug_line: 'EXT. CITY STREETS - NIGHT', synopsis: 'Rock bottom moment, vow of revenge.' },
            { slug_line: 'INT. CORPORATE OFFICE - 3 YEARS LATER', synopsis: 'Triumphant return in disguise.' },
        ],
        estimated_duration: '30-40 min total',
        difficulty: 'intermediate'
    },
    {
        id: 'werewolf-romance',
        name: 'Werewolf Alpha',
        description: 'Supernatural romance with mate bonds, pack politics, and forbidden love.',
        category: 'micro-drama',
        icon: <Ghost size={24} />,
        color: 'text-purple-400',
        bgGradient: 'from-purple-500/20 to-indigo-500/20',
        features: ['50 episodes', 'Supernatural elements', 'Multiple love interests', 'Pack hierarchy drama'],
        defaults: {
            genre: 'micro-werewolf',
            episode_count: 50,
            aspect_ratio: '9:16',
            style_preset: 'moody-supernatural',
            delivery_formats: ['reelshort', 'dramabox']
        },
        estimated_duration: '60-80 min total',
        difficulty: 'intermediate'
    },
    {
        id: 'mafia-boss',
        name: 'Mafia Boss',
        description: 'Dangerous romance with crime lords, protection, and forbidden attraction.',
        category: 'micro-drama',
        icon: <Skull size={24} />,
        color: 'text-red-400',
        bgGradient: 'from-red-500/20 to-gray-500/20',
        features: ['30 episodes', 'Action sequences', 'Luxury aesthetics', 'Power dynamics'],
        defaults: {
            genre: 'micro-mafia',
            episode_count: 30,
            aspect_ratio: '9:16',
            style_preset: 'noir-luxury',
            delivery_formats: ['reelshort', 'youtube-shorts']
        },
        estimated_duration: '35-45 min total',
        difficulty: 'advanced'
    },

    // Film Templates
    {
        id: 'short-film',
        name: 'Short Film',
        description: 'Classic 3-act structure for festival-ready short films.',
        category: 'film',
        icon: <Film size={24} />,
        color: 'text-blue-400',
        bgGradient: 'from-blue-500/20 to-cyan-500/20',
        features: ['3-act structure', '10-15 min runtime', 'Festival specs', 'Cinematic coverage'],
        defaults: {
            genre: 'drama',
            aspect_ratio: '16:9',
            style_preset: 'cinematic',
            coverage_preset: 'standard',
            delivery_formats: ['theatrical', 'streaming-hd']
        },
        scenes: [
            { slug_line: 'EXT. ESTABLISHING - DAY', synopsis: 'World and character introduction.' },
            { slug_line: 'INT. LOCATION - DAY', synopsis: 'Inciting incident.' },
            { slug_line: 'INT. LOCATION - NIGHT', synopsis: 'Climax and resolution.' },
        ],
        estimated_duration: '10-15 min',
        difficulty: 'intermediate'
    },
    {
        id: 'feature-film',
        name: 'Feature Film',
        description: 'Full-length feature with comprehensive scene structure.',
        category: 'film',
        icon: <Tv size={24} />,
        color: 'text-indigo-400',
        bgGradient: 'from-indigo-500/20 to-purple-500/20',
        features: ['Full 3-act structure', '90-120 min', 'Heavy coverage', 'Multiple locations'],
        defaults: {
            genre: 'drama',
            aspect_ratio: '2.39:1',
            style_preset: 'cinematic',
            coverage_preset: 'heavy',
            delivery_formats: ['theatrical', 'streaming-4k']
        },
        estimated_duration: '90-120 min',
        difficulty: 'advanced'
    },

    // Commercial Templates
    {
        id: 'product-commercial',
        name: 'Product Commercial',
        description: '30-60 second product showcase with lifestyle shots.',
        category: 'commercial',
        icon: <Megaphone size={24} />,
        color: 'text-green-400',
        bgGradient: 'from-green-500/20 to-emerald-500/20',
        features: ['30-60 seconds', 'Product hero shots', 'Lifestyle context', 'CTA ending'],
        defaults: {
            genre: 'commercial',
            aspect_ratio: '16:9',
            style_preset: 'commercial-bright',
            coverage_preset: 'commercial',
            delivery_formats: ['broadcast-hd', 'social-square', 'social-vertical']
        },
        scenes: [
            { slug_line: 'INT. STUDIO - WHITE BG', synopsis: 'Product hero shot with dramatic reveal.' },
            { slug_line: 'INT. LIFESTYLE - DAY', synopsis: 'Product in use, happy customer.' },
            { slug_line: 'INT. STUDIO - CLOSE UP', synopsis: 'Final product shot with logo and CTA.' },
        ],
        estimated_duration: '30-60 sec',
        difficulty: 'beginner'
    },
    {
        id: 'social-ad',
        name: 'Social Media Ad',
        description: 'Vertical-first ad optimized for TikTok, Instagram, and YouTube Shorts.',
        category: 'commercial',
        icon: <Smartphone size={24} />,
        color: 'text-cyan-400',
        bgGradient: 'from-cyan-500/20 to-blue-500/20',
        features: ['15-30 seconds', 'Hook in 3 sec', 'Vertical format', 'Sound-on optimized'],
        defaults: {
            genre: 'commercial',
            aspect_ratio: '9:16',
            style_preset: 'social-punchy',
            delivery_formats: ['tiktok', 'instagram-reels', 'youtube-shorts']
        },
        estimated_duration: '15-30 sec',
        difficulty: 'beginner'
    },

    // Music Video
    {
        id: 'music-video',
        name: 'Music Video',
        description: 'Performance and narrative-driven music video structure.',
        category: 'music-video',
        icon: <Music size={24} />,
        color: 'text-yellow-400',
        bgGradient: 'from-yellow-500/20 to-orange-500/20',
        features: ['3-5 min runtime', 'Performance + narrative', 'Visual effects', 'Sync to music'],
        defaults: {
            genre: 'music-video',
            aspect_ratio: '16:9',
            style_preset: 'music-video',
            coverage_preset: 'heavy',
            delivery_formats: ['youtube-hd', 'vevo', 'streaming-4k']
        },
        estimated_duration: '3-5 min',
        difficulty: 'intermediate'
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ProjectTemplatesProps {
    onSelect?: (template: ProjectTemplate) => void;
    showCreateButton?: boolean;
}

export default function ProjectTemplates({ 
    onSelect, 
    showCreateButton = true 
}: ProjectTemplatesProps) {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [creating, setCreating] = useState(false);

    const categories = [
        { id: 'all', label: 'All Templates' },
        { id: 'micro-drama', label: 'Micro Drama', icon: <Smartphone size={14} /> },
        { id: 'film', label: 'Film', icon: <Film size={14} /> },
        { id: 'commercial', label: 'Commercial', icon: <Video size={14} /> },
        { id: 'music-video', label: 'Music Video', icon: <Music size={14} /> },
    ];

    const filteredTemplates = activeCategory === 'all' 
        ? TEMPLATES 
        : TEMPLATES.filter(t => t.category === activeCategory);

    const handleCreateFromTemplate = async () => {
        if (!selectedTemplate) return;

        setCreating(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `New ${selectedTemplate.name}`,
                    genre: selectedTemplate.defaults.genre,
                    template_id: selectedTemplate.id,
                    settings: {
                        aspect_ratio: selectedTemplate.defaults.aspect_ratio,
                        style_preset: selectedTemplate.defaults.style_preset,
                        coverage_preset: selectedTemplate.defaults.coverage_preset,
                        episode_count: selectedTemplate.defaults.episode_count,
                        delivery_formats: selectedTemplate.defaults.delivery_formats,
                    }
                })
            });

            if (res.ok) {
                const project = await res.json();
                router.push(`/production?projectId=${project.id || project._id}`);
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setCreating(false);
        }
    };

    const getDifficultyBadge = (difficulty?: string) => {
        const config = {
            beginner: { label: 'Beginner', color: 'bg-green-500/10 text-green-400' },
            intermediate: { label: 'Intermediate', color: 'bg-yellow-500/10 text-yellow-400' },
            advanced: { label: 'Advanced', color: 'bg-red-500/10 text-red-400' },
        };
        const d = config[difficulty as keyof typeof config] || config.beginner;
        return <span className={`px-2 py-0.5 text-xs rounded ${d.color}`}>{d.label}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${activeCategory === cat.id 
                                ? 'bg-white text-black' 
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}
                        `}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                    const isSelected = selectedTemplate?.id === template.id;

                    return (
                        <button
                            key={template.id}
                            onClick={() => {
                                setSelectedTemplate(template);
                                onSelect?.(template);
                            }}
                            className={`
                                relative text-left p-6 rounded-2xl border transition-all
                                bg-gradient-to-br ${template.bgGradient}
                                ${isSelected 
                                    ? 'border-white/40 ring-2 ring-white/20' 
                                    : 'border-white/10 hover:border-white/20'}
                            `}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                    <Check size={14} className="text-black" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 ${template.color}`}>
                                {template.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{template.description}</p>

                            {/* Meta */}
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                {getDifficultyBadge(template.difficulty)}
                                {template.estimated_duration && (
                                    <span className="px-2 py-0.5 text-xs rounded bg-white/5 text-gray-400 flex items-center gap-1">
                                        <Clock size={10} />
                                        {template.estimated_duration}
                                    </span>
                                )}
                                {template.defaults.episode_count && (
                                    <span className="px-2 py-0.5 text-xs rounded bg-white/5 text-gray-400 flex items-center gap-1">
                                        <Layers size={10} />
                                        {template.defaults.episode_count} episodes
                                    </span>
                                )}
                            </div>

                            {/* Features */}
                            <div className="space-y-1">
                                {template.features.slice(0, 3).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                        <Sparkles size={10} className="text-pink-400" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Create Button */}
            {showCreateButton && selectedTemplate && (
                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button
                        onClick={handleCreateFromTemplate}
                        disabled={creating}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating...
                            </>
                        ) : (
                            <>
                                Create from "{selectedTemplate.name}"
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// Export templates for use elsewhere
export { TEMPLATES };
export type { ProjectTemplate };
