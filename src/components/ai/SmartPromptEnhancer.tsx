'use client';

import React, { useState, useCallback } from 'react';
import {
    Sparkles, Wand2, RefreshCw, Check, Copy, ChevronDown,
    Palette, Camera, Sun, Film, Zap, AlertCircle
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface EnhancementSuggestion {
    id: string;
    category: 'lighting' | 'camera' | 'style' | 'mood' | 'technical';
    original: string;
    enhanced: string;
    keywords_added: string[];
    confidence: number;
}

interface SmartPromptEnhancerProps {
    prompt: string;
    onChange: (prompt: string) => void;
    stylePreset?: string;
    shotType?: string;
    genre?: string;
}

// ============================================================================
// ENHANCEMENT KEYWORDS
// ============================================================================

const CINEMATIC_KEYWORDS = {
    lighting: [
        'cinematic lighting', 'dramatic shadows', 'golden hour', 'blue hour',
        'rim lighting', 'backlighting', 'soft diffused light', 'high contrast',
        'natural lighting', 'studio lighting', 'neon lights', 'volumetric lighting'
    ],
    camera: [
        'shallow depth of field', 'bokeh background', 'wide angle', 'telephoto compression',
        'eye level', 'low angle', 'high angle', 'Dutch angle', 'tracking shot',
        'steadicam', 'handheld', 'locked off'
    ],
    style: [
        'photorealistic', 'hyper-detailed', '8k resolution', 'film grain',
        'anamorphic lens', 'IMAX quality', 'Alexa camera', 'RED camera look',
        'vintage film stock', 'modern digital'
    ],
    mood: [
        'atmospheric', 'moody', 'vibrant', 'muted colors', 'high saturation',
        'desaturated', 'warm tones', 'cool tones', 'noir style', 'ethereal'
    ],
    technical: [
        'highly detailed', 'sharp focus', 'professional photography',
        'award winning cinematography', 'masterpiece quality'
    ]
};

const GENRE_KEYWORDS: Record<string, string[]> = {
    'micro-ceo-romance': ['luxury interior', 'modern office', 'elegant', 'sophisticated', 'romantic lighting'],
    'micro-revenge': ['dramatic', 'intense', 'high contrast', 'noir elements', 'tension'],
    'micro-werewolf': ['mystical', 'moonlight', 'supernatural glow', 'forest setting', 'dramatic shadows'],
    'micro-mafia': ['noir style', 'dark atmosphere', 'luxury', 'danger', 'smoky'],
    'drama': ['emotional', 'intimate', 'naturalistic lighting', 'character focused'],
    'comedy': ['bright', 'vibrant colors', 'energetic', 'playful'],
    'horror': ['dark', 'ominous', 'shadows', 'unsettling', 'fog'],
    'action': ['dynamic', 'high energy', 'motion blur', 'dramatic angles'],
    'commercial': ['clean', 'polished', 'product focused', 'aspirational', 'bright lighting']
};

const SHOT_TYPE_KEYWORDS: Record<string, string[]> = {
    'wide': ['establishing shot', 'full environment visible', 'context'],
    'medium': ['waist up framing', 'balanced composition'],
    'close_up': ['facial details', 'emotional', 'intimate framing'],
    'extreme_close_up': ['macro detail', 'eyes focused', 'intense'],
    'over_shoulder': ['conversation framing', 'two person scene'],
    'establishing': ['location reveal', 'scene setter', 'wide angle']
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SmartPromptEnhancer({
    prompt,
    onChange,
    stylePreset,
    shotType,
    genre
}: SmartPromptEnhancerProps) {
    const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
        new Set(['lighting', 'style'])
    );

    // ========================================================================
    // ENHANCEMENT LOGIC
    // ========================================================================

    const enhancePrompt = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsEnhancing(true);
        setShowSuggestions(true);

        // Simulate API call delay
        await new Promise(r => setTimeout(r, 800));

        const newSuggestions: EnhancementSuggestion[] = [];
        const promptLower = prompt.toLowerCase();

        // Check each category for missing keywords
        for (const [category, keywords] of Object.entries(CINEMATIC_KEYWORDS)) {
            if (!selectedCategories.has(category)) continue;

            const missingKeywords = keywords.filter(kw => 
                !promptLower.includes(kw.toLowerCase())
            );

            if (missingKeywords.length > 0) {
                // Select 2-3 relevant keywords
                const toAdd = missingKeywords
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2 + Math.floor(Math.random() * 2));

                newSuggestions.push({
                    id: category,
                    category: category as EnhancementSuggestion['category'],
                    original: prompt,
                    enhanced: `${prompt}, ${toAdd.join(', ')}`,
                    keywords_added: toAdd,
                    confidence: 0.7 + Math.random() * 0.25
                });
            }
        }

        // Add genre-specific keywords
        if (genre && GENRE_KEYWORDS[genre]) {
            const genreKws = GENRE_KEYWORDS[genre].filter(kw => 
                !promptLower.includes(kw.toLowerCase())
            ).slice(0, 2);

            if (genreKws.length > 0) {
                newSuggestions.push({
                    id: 'genre',
                    category: 'mood',
                    original: prompt,
                    enhanced: `${prompt}, ${genreKws.join(', ')}`,
                    keywords_added: genreKws,
                    confidence: 0.85
                });
            }
        }

        // Add shot type keywords
        if (shotType && SHOT_TYPE_KEYWORDS[shotType]) {
            const shotKws = SHOT_TYPE_KEYWORDS[shotType].filter(kw =>
                !promptLower.includes(kw.toLowerCase())
            ).slice(0, 1);

            if (shotKws.length > 0) {
                newSuggestions.push({
                    id: 'shot',
                    category: 'camera',
                    original: prompt,
                    enhanced: `${prompt}, ${shotKws.join(', ')}`,
                    keywords_added: shotKws,
                    confidence: 0.9
                });
            }
        }

        setSuggestions(newSuggestions);
        setIsEnhancing(false);
    }, [prompt, selectedCategories, genre, shotType]);

    const applyEnhancement = (enhancement: EnhancementSuggestion) => {
        onChange(enhancement.enhanced);
        setSuggestions(prev => prev.filter(s => s.id !== enhancement.id));
    };

    const applyAllEnhancements = () => {
        let enhanced = prompt;
        const allKeywords: string[] = [];

        suggestions.forEach(s => {
            allKeywords.push(...s.keywords_added);
        });

        enhanced = `${prompt}, ${[...new Set(allKeywords)].join(', ')}`;
        onChange(enhanced);
        setSuggestions([]);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, React.ReactNode> = {
            lighting: <Sun size={14} />,
            camera: <Camera size={14} />,
            style: <Film size={14} />,
            mood: <Palette size={14} />,
            technical: <Zap size={14} />
        };
        return icons[category] || <Sparkles size={14} />;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            lighting: 'text-yellow-400 bg-yellow-500/10',
            camera: 'text-blue-400 bg-blue-500/10',
            style: 'text-purple-400 bg-purple-500/10',
            mood: 'text-pink-400 bg-pink-500/10',
            technical: 'text-green-400 bg-green-500/10'
        };
        return colors[category] || 'text-gray-400 bg-gray-500/10';
    };

    return (
        <div className="space-y-4">
            {/* Prompt Input */}
            <div className="relative">
                <textarea
                    value={prompt}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Describe your shot..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                />
                <button
                    onClick={enhancePrompt}
                    disabled={!prompt.trim() || isEnhancing}
                    className="absolute right-2 top-2 flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isEnhancing ? (
                        <RefreshCw size={14} className="animate-spin" />
                    ) : (
                        <Wand2 size={14} />
                    )}
                    Enhance
                </button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Enhance with:</span>
                {Object.keys(CINEMATIC_KEYWORDS).map(category => (
                    <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                            ${selectedCategories.has(category)
                                ? getCategoryColor(category)
                                : 'text-gray-500 bg-white/5 hover:bg-white/10'}
                        `}
                    >
                        {getCategoryIcon(category)}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-400" />
                            Suggestions ({suggestions.length})
                        </h4>
                        <button
                            onClick={applyAllEnhancements}
                            className="text-xs text-purple-400 hover:text-purple-300"
                        >
                            Apply All
                        </button>
                    </div>

                    <div className="divide-y divide-white/5">
                        {suggestions.map(suggestion => (
                            <div key={suggestion.id} className="p-3 hover:bg-white/5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(suggestion.category)}`}>
                                                {getCategoryIcon(suggestion.category)}
                                                <span className="ml-1">{suggestion.category}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {Math.round(suggestion.confidence * 100)}% match
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {suggestion.keywords_added.map(kw => (
                                                <span
                                                    key={kw}
                                                    className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs"
                                                >
                                                    + {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => applyEnhancement(suggestion)}
                                        className="p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg flex-shrink-0"
                                    >
                                        <Check size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Keywords */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Quick add:</span>
                {['cinematic', '8k', 'dramatic lighting', 'shallow DOF', 'film grain'].map(kw => (
                    <button
                        key={kw}
                        onClick={() => {
                            if (!prompt.toLowerCase().includes(kw.toLowerCase())) {
                                onChange(prompt ? `${prompt}, ${kw}` : kw);
                            }
                        }}
                        disabled={prompt.toLowerCase().includes(kw.toLowerCase())}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded text-xs transition-colors disabled:opacity-30"
                    >
                        {kw}
                    </button>
                ))}
            </div>
        </div>
    );
}
