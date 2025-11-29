// ============================================================================
// REFERENCE LIBRARY DATA
// Extracted mock data for reference images, collections, and filter options
// ============================================================================

export interface ReferenceImage {
    id: string;
    image_url: string;
    title: string;
    tags: string[];
    mood: string;
    lighting: string;
    color_palette: string[];
    aspect_ratio: string;
    source?: string;
    favorited: boolean;
    created_at: Date;
}

export interface Collection {
    id: string;
    name: string;
    count: number;
    thumbnail: string;
}

// ============================================================================
// MOCK IMAGES
// ============================================================================

export const MOCK_IMAGES: ReferenceImage[] = [
    {
        id: '1',
        image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=400&fit=crop',
        title: 'Cinematic Night City',
        tags: ['cinematic', 'urban', 'night', 'neon'],
        mood: 'Mysterious',
        lighting: 'Neon',
        color_palette: ['#0f172a', '#3b82f6', '#ec4899', '#22d3ee'],
        aspect_ratio: '16:9',
        source: 'Unsplash',
        favorited: true,
        created_at: new Date()
    },
    {
        id: '2',
        image_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&h=800&fit=crop',
        title: 'Moody Portrait Lighting',
        tags: ['portrait', 'dramatic', 'shadow', 'studio'],
        mood: 'Dramatic',
        lighting: 'Rembrandt',
        color_palette: ['#1a1a1a', '#f97316', '#fbbf24', '#451a03'],
        aspect_ratio: '3:4',
        favorited: false,
        created_at: new Date()
    },
    {
        id: '3',
        image_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop',
        title: 'Ocean Sunset Wide',
        tags: ['landscape', 'sunset', 'ocean', 'golden hour'],
        mood: 'Serene',
        lighting: 'Golden Hour',
        color_palette: ['#1e3a5f', '#f97316', '#fcd34d', '#0ea5e9'],
        aspect_ratio: '16:9',
        favorited: true,
        created_at: new Date()
    },
    {
        id: '4',
        image_url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600&h=600&fit=crop',
        title: 'Abstract Gradient',
        tags: ['abstract', 'gradient', 'colorful', 'modern'],
        mood: 'Vibrant',
        lighting: 'Synthetic',
        color_palette: ['#7c3aed', '#ec4899', '#f97316', '#fbbf24'],
        aspect_ratio: '1:1',
        favorited: false,
        created_at: new Date()
    },
    {
        id: '5',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        title: 'Mountain Mist',
        tags: ['landscape', 'mountains', 'fog', 'nature'],
        mood: 'Ethereal',
        lighting: 'Diffused',
        color_palette: ['#1e293b', '#64748b', '#94a3b8', '#f1f5f9'],
        aspect_ratio: '16:9',
        favorited: false,
        created_at: new Date()
    },
    {
        id: '6',
        image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=800&fit=crop',
        title: 'Concert Energy',
        tags: ['concert', 'crowd', 'energy', 'music'],
        mood: 'Energetic',
        lighting: 'Stage Lights',
        color_palette: ['#0f0f0f', '#ef4444', '#f97316', '#fbbf24'],
        aspect_ratio: '3:4',
        favorited: true,
        created_at: new Date()
    },
    {
        id: '7',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
        title: 'Vintage Film Look',
        tags: ['vintage', 'film', 'grain', 'retro'],
        mood: 'Nostalgic',
        lighting: 'Natural',
        color_palette: ['#451a03', '#78350f', '#a16207', '#fef3c7'],
        aspect_ratio: '16:9',
        favorited: false,
        created_at: new Date()
    },
    {
        id: '8',
        image_url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=600&fit=crop',
        title: 'Starry Night Sky',
        tags: ['night', 'stars', 'space', 'astrophotography'],
        mood: 'Awe-inspiring',
        lighting: 'Ambient',
        color_palette: ['#020617', '#1e1b4b', '#312e81', '#6366f1'],
        aspect_ratio: '1:1',
        favorited: true,
        created_at: new Date()
    },
    {
        id: '9',
        image_url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&h=400&fit=crop',
        title: 'Forest Light Rays',
        tags: ['forest', 'light rays', 'nature', 'mystical'],
        mood: 'Mystical',
        lighting: 'God Rays',
        color_palette: ['#14532d', '#166534', '#22c55e', '#bbf7d0'],
        aspect_ratio: '16:9',
        favorited: false,
        created_at: new Date()
    },
    {
        id: '10',
        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
        title: 'Natural Beauty Portrait',
        tags: ['portrait', 'natural', 'beauty', 'soft'],
        mood: 'Warm',
        lighting: 'Soft Natural',
        color_palette: ['#fef2f2', '#fecaca', '#f87171', '#b91c1c'],
        aspect_ratio: '3:4',
        favorited: false,
        created_at: new Date()
    },
    {
        id: '11',
        image_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop',
        title: 'Film Set Behind Scenes',
        tags: ['film', 'production', 'behind scenes', 'camera'],
        mood: 'Professional',
        lighting: 'Mixed',
        color_palette: ['#1a1a1a', '#404040', '#737373', '#d4d4d4'],
        aspect_ratio: '16:9',
        favorited: true,
        created_at: new Date()
    },
    {
        id: '12',
        image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=600&fit=crop',
        title: 'Tech Office Vibes',
        tags: ['office', 'tech', 'modern', 'workspace'],
        mood: 'Clean',
        lighting: 'Bright',
        color_palette: ['#ffffff', '#f3f4f6', '#3b82f6', '#1d4ed8'],
        aspect_ratio: '1:1',
        favorited: false,
        created_at: new Date()
    },
];

// ============================================================================
// COLLECTIONS
// ============================================================================

export const MOCK_COLLECTIONS: Collection[] = [
    { id: 'all', name: 'All References', count: 127, thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&fit=crop' },
    { id: 'cinematic', name: 'Cinematic', count: 34, thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100&h=100&fit=crop' },
    { id: 'portraits', name: 'Portraits', count: 28, thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: 'landscapes', name: 'Landscapes', count: 23, thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
    { id: 'lighting', name: 'Lighting Refs', count: 19, thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=100&h=100&fit=crop' },
    { id: 'color', name: 'Color Palettes', count: 15, thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=100&h=100&fit=crop' },
];

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export const MOODS = ['All', 'Mysterious', 'Dramatic', 'Serene', 'Vibrant', 'Ethereal', 'Energetic', 'Nostalgic', 'Warm', 'Professional'];
export const LIGHTING = ['All', 'Neon', 'Rembrandt', 'Golden Hour', 'Natural', 'Stage Lights', 'Diffused', 'God Rays', 'Studio'];
