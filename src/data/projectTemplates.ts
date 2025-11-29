// ============================================================================
// PROJECT TEMPLATES DATA
// Template configurations separated from UI components
// ============================================================================

import React from 'react';
import {
    Smartphone, Film, Video, Tv, Music, Megaphone,
    Heart, Skull, Ghost, Flame, Play, Award
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    category: 'micro-drama' | 'film' | 'commercial' | 'music-video' | 'documentary';
    iconName: string;
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

export interface TemplateCategory {
    id: string;
    label: string;
    iconName?: string;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

export const TEMPLATE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    heart: Heart,
    flame: Flame,
    ghost: Ghost,
    skull: Skull,
    film: Film,
    play: Play,
    award: Award,
    megaphone: Megaphone,
    smartphone: Smartphone,
    music: Music,
    video: Video,
    tv: Tv,
};

// ============================================================================
// CATEGORIES
// ============================================================================

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    { id: 'all', label: 'All Templates' },
    { id: 'micro-drama', label: 'Micro Drama', iconName: 'smartphone' },
    { id: 'film', label: 'Film', iconName: 'film' },
    { id: 'commercial', label: 'Commercial', iconName: 'video' },
    { id: 'music-video', label: 'Music Video', iconName: 'music' },
];

// ============================================================================
// TEMPLATES DATA
// ============================================================================

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    // Micro Drama Templates
    {
        id: 'ceo-romance',
        name: 'CEO Romance',
        description: 'Classic billionaire romance with contract marriage, mistaken identity, and dramatic reveals.',
        category: 'micro-drama',
        iconName: 'heart',
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
        iconName: 'flame',
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
        iconName: 'ghost',
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
        iconName: 'skull',
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
        iconName: 'film',
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
        id: 'movie-trailer',
        name: 'Movie Trailer',
        description: 'High-impact cinematic trailer with dramatic reveals, quick cuts, and epic title cards.',
        category: 'film',
        iconName: 'play',
        color: 'text-amber-400',
        bgGradient: 'from-amber-500/20 to-red-500/20',
        features: ['2-3 min runtime', 'Dramatic beat structure', 'Title card templates', 'Trailer music sync', 'Voice-over ready'],
        defaults: {
            genre: 'trailer',
            aspect_ratio: '2.39:1',
            style_preset: 'cinematic-dramatic',
            coverage_preset: 'trailer-cuts',
            delivery_formats: ['theatrical', 'youtube-hd', 'social-teaser']
        },
        scenes: [
            { slug_line: 'BLACK - TITLE CARD', synopsis: 'Studio logo and opening beat.' },
            { slug_line: 'MONTAGE - WORLD BUILDING', synopsis: 'Quick cuts establishing the world and tone.' },
            { slug_line: 'INT. KEY LOCATION - DAY', synopsis: 'Character introduction with signature moment.' },
            { slug_line: 'MONTAGE - RISING ACTION', synopsis: 'Stakes escalate, conflict revealed.' },
            { slug_line: 'BLACK - DRAMATIC PAUSE', synopsis: 'Silence before the storm.' },
            { slug_line: 'MONTAGE - CLIMAX TEASE', synopsis: 'Epic action/emotion montage with fast cuts.' },
            { slug_line: 'BLACK - TITLE REVEAL', synopsis: 'Movie title with release date.' },
            { slug_line: 'STINGER - POST TITLE', synopsis: 'Final shocking moment or one-liner.' },
        ],
        estimated_duration: '2-3 min',
        difficulty: 'intermediate'
    },
    {
        id: 'feature-film',
        name: 'Feature Film',
        description: 'Full-length theatrical feature with comprehensive 3-act structure, character arcs, and professional production specs.',
        category: 'film',
        iconName: 'award',
        color: 'text-indigo-400',
        bgGradient: 'from-indigo-500/20 to-purple-500/20',
        features: ['Full 3-act structure', '90-120 min runtime', 'Heavy coverage', 'Multiple locations', 'Character arc tracking', 'Scene breakdown sheets'],
        defaults: {
            genre: 'drama',
            aspect_ratio: '2.39:1',
            style_preset: 'cinematic',
            coverage_preset: 'heavy',
            delivery_formats: ['theatrical-dcp', 'streaming-4k', 'broadcast-hd']
        },
        scenes: [
            { slug_line: 'EXT. ESTABLISHING SHOT - DAY', synopsis: 'Opening image that sets the tone and world.' },
            { slug_line: 'INT. PROTAGONIST HOME - DAY', synopsis: 'Introduce protagonist in their ordinary world.' },
            { slug_line: 'INT/EXT. DAILY LIFE - DAY', synopsis: 'Character routines, relationships, and flaws.' },
            { slug_line: 'EXT. INCITING INCIDENT LOCATION - DAY', synopsis: 'The event that disrupts normal life.' },
            { slug_line: 'INT. DECISION POINT - NIGHT', synopsis: 'Protagonist faces the call to adventure.' },
            { slug_line: 'EXT. NEW WORLD - DAY', synopsis: 'Crossing the threshold into unfamiliar territory.' },
            { slug_line: 'INT. MEETING ALLIES - DAY', synopsis: 'Introduction of key supporting characters.' },
            { slug_line: 'INT/EXT. TESTS AND TRIALS - VARIOUS', synopsis: 'Series of challenges and learning moments.' },
            { slug_line: 'INT. MIDPOINT REVELATION - NIGHT', synopsis: 'Major twist that raises the stakes.' },
            { slug_line: 'INT. AFTERMATH - DAY', synopsis: 'Dealing with midpoint consequences.' },
            { slug_line: 'EXT. DARKEST HOUR - NIGHT', synopsis: 'All is lost moment - lowest point.' },
            { slug_line: 'INT. SOUL SEARCHING - NIGHT', synopsis: 'Internal revelation and renewed determination.' },
            { slug_line: 'EXT. FINAL APPROACH - DAY', synopsis: 'Gathering strength for the climax.' },
            { slug_line: 'INT/EXT. CLIMAX SEQUENCE - DAY', synopsis: 'Final confrontation with antagonist.' },
            { slug_line: 'EXT. RESOLUTION - DAY', synopsis: 'New equilibrium and closing image.' },
        ],
        estimated_duration: '90-120 min',
        difficulty: 'advanced'
    },

    // Commercial Templates
    {
        id: 'product-commercial',
        name: 'Product Commercial',
        description: '30-60 second product showcase with lifestyle shots.',
        category: 'commercial',
        iconName: 'megaphone',
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
        iconName: 'smartphone',
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
        iconName: 'music',
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
// HELPER FUNCTIONS
// ============================================================================

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
    if (category === 'all') return PROJECT_TEMPLATES;
    return PROJECT_TEMPLATES.filter(t => t.category === category);
}

export function getTemplateById(id: string): ProjectTemplate | undefined {
    return PROJECT_TEMPLATES.find(t => t.id === id);
}

export function getTemplateIcon(iconName: string): React.ComponentType<{ size?: number }> | null {
    return TEMPLATE_ICONS[iconName] || null;
}
