'use client';

import React, { useState, useEffect } from 'react';
import { 
    Search, Check, Loader2, Upload, Wand2, Grid, List, Filter,
    SlidersHorizontal, Heart, Download, Eye, Plus, X, Star,
    ChevronDown, Sparkles, Palette, Sun, Camera, Film, Layers,
    FolderPlus, Tag, MoreHorizontal, Zap, Copy, ExternalLink
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ReferenceImage {
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

interface Collection {
    id: string;
    name: string;
    count: number;
    thumbnail: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_IMAGES: ReferenceImage[] = [
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

const MOCK_COLLECTIONS: Collection[] = [
    { id: 'all', name: 'All References', count: 127, thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&h=100&fit=crop' },
    { id: 'cinematic', name: 'Cinematic', count: 34, thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100&h=100&fit=crop' },
    { id: 'portraits', name: 'Portraits', count: 28, thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: 'landscapes', name: 'Landscapes', count: 23, thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop' },
    { id: 'lighting', name: 'Lighting Refs', count: 19, thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=100&h=100&fit=crop' },
    { id: 'color', name: 'Color Palettes', count: 15, thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=100&h=100&fit=crop' },
];

const MOODS = ['All', 'Mysterious', 'Dramatic', 'Serene', 'Vibrant', 'Ethereal', 'Energetic', 'Nostalgic', 'Warm', 'Professional'];
const LIGHTING = ['All', 'Neon', 'Rembrandt', 'Golden Hour', 'Natural', 'Stage Lights', 'Diffused', 'God Rays', 'Studio'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReferenceLibrary() {
    const [images, setImages] = useState<ReferenceImage[]>(MOCK_IMAGES);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
    const [selectedMood, setSelectedMood] = useState('All');
    const [selectedLighting, setSelectedLighting] = useState('All');
    const [selectedCollection, setSelectedCollection] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ReferenceImage | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    // Filter images
    const filteredImages = images.filter(img => {
        const matchesSearch = searchQuery === '' || 
            img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesMood = selectedMood === 'All' || img.mood === selectedMood;
        const matchesLighting = selectedLighting === 'All' || img.lighting === selectedLighting;
        return matchesSearch && matchesMood && matchesLighting;
    });

    const toggleFavorite = (id: string) => {
        setImages(images.map(img => 
            img.id === id ? { ...img, favorited: !img.favorited } : img
        ));
    };

    const stealLook = (img: ReferenceImage) => {
        setCopiedId(img.id);
        // Copy style data to clipboard
        const styleData = {
            mood: img.mood,
            lighting: img.lighting,
            colors: img.color_palette,
            tags: img.tags
        };
        navigator.clipboard.writeText(JSON.stringify(styleData, null, 2));
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] -m-6">
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search by mood, lighting, or description...'
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                            showFilters 
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                        {(selectedMood !== 'All' || selectedLighting !== 'All') && (
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                        <button 
                            onClick={() => setViewMode('masonry')}
                            className={`p-2 rounded ${viewMode === 'masonry' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Layers size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Grid size={16} />
                        </button>
                    </div>

                    {/* Upload Button */}
                    <button 
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                        <Upload size={16} />
                        Upload
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            {showFilters && (
                <div className="px-6 py-3 border-b border-white/5 flex items-center gap-6 bg-white/[0.02]">
                    {/* Mood Filter */}
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Mood:</span>
                        <div className="flex items-center gap-1">
                            {MOODS.slice(0, 6).map(mood => (
                                <button
                                    key={mood}
                                    onClick={() => setSelectedMood(mood)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                        selectedMood === mood
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-px h-6 bg-white/10"></div>

                    {/* Lighting Filter */}
                    <div className="flex items-center gap-2">
                        <Sun size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500">Lighting:</span>
                        <div className="flex items-center gap-1">
                            {LIGHTING.slice(0, 5).map(light => (
                                <button
                                    key={light}
                                    onClick={() => setSelectedLighting(light)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                                        selectedLighting === light
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {light}
                                </button>
                            ))}
                        </div>
                    </div>

                    {(selectedMood !== 'All' || selectedLighting !== 'All') && (
                        <button 
                            onClick={() => { setSelectedMood('All'); setSelectedLighting('All'); }}
                            className="ml-auto text-xs text-gray-500 hover:text-white"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Collections Sidebar */}
                <div className="w-56 border-r border-white/5 p-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</span>
                        <button className="p-1 text-gray-500 hover:text-white rounded">
                            <FolderPlus size={14} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {MOCK_COLLECTIONS.map(col => (
                            <button
                                key={col.id}
                                onClick={() => setSelectedCollection(col.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    selectedCollection === col.id
                                        ? 'bg-purple-500/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <img 
                                    src={col.thumbnail} 
                                    alt={col.name}
                                    className="w-8 h-8 rounded object-cover"
                                />
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium truncate">{col.name}</div>
                                    <div className="text-[10px] text-gray-500">{col.count} items</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Images</span>
                                <span className="text-white">127</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Favorites</span>
                                <span className="text-white">{images.filter(i => i.favorited).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">This Week</span>
                                <span className="text-green-400">+12</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                            {filteredImages.length} reference{filteredImages.length !== 1 ? 's' : ''}
                            {searchQuery && ` for "${searchQuery}"`}
                        </span>
                    </div>

                    {/* Grid */}
                    {filteredImages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Search size={24} className="text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No references found</h3>
                            <p className="text-sm text-gray-500 text-center max-w-md">
                                Try adjusting your search or filters, or upload new references to your vault.
                            </p>
                            <button 
                                onClick={() => setShowUpload(true)}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-sm font-medium"
                            >
                                <Upload size={16} />
                                Upload References
                            </button>
                        </div>
                    ) : viewMode === 'masonry' ? (
                        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
                            {filteredImages.map((img) => (
                                <div 
                                    key={img.id} 
                                    className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={img.title}
                                        className="w-full h-auto object-cover"
                                    />

                                    {/* Favorite Button */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(img.id); }}
                                        className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
                                            img.favorited 
                                                ? 'bg-red-500/20 text-red-400' 
                                                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                                        }`}
                                    >
                                        <Heart size={14} className={img.favorited ? 'fill-current' : ''} />
                                    </button>

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-white">{img.title}</h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                                                    {img.mood}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                    {img.lighting}
                                                </span>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-2">
                                                <div className="flex gap-1">
                                                    {img.color_palette.slice(0, 4).map((color, i) => (
                                                        <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); stealLook(img); }}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-purple-400 transition-colors bg-white/10 px-2 py-1 rounded"
                                                >
                                                    {copiedId === img.id ? (
                                                        <>
                                                            <Check size={12} /> Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Wand2 size={12} /> Use Style
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map((img) => (
                                <div 
                                    key={img.id} 
                                    className="group relative aspect-square rounded-xl overflow-hidden bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={img.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(img.id); }}
                                        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                                            img.favorited 
                                                ? 'bg-red-500/20 text-red-400' 
                                                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                                        }`}
                                    >
                                        <Heart size={12} className={img.favorited ? 'fill-current' : ''} />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-xs text-white truncate">{img.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Detail Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
                    <div className="max-w-5xl w-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex" onClick={e => e.stopPropagation()}>
                        {/* Image */}
                        <div className="flex-1 bg-black flex items-center justify-center p-4">
                            <img 
                                src={selectedImage.image_url} 
                                alt={selectedImage.title}
                                className="max-h-[70vh] w-auto rounded-lg"
                            />
                        </div>

                        {/* Details */}
                        <div className="w-80 border-l border-white/10 p-6 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-lg font-bold text-white">{selectedImage.title}</h2>
                                <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {selectedImage.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Properties */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Mood</span>
                                    <span className="text-sm text-white">{selectedImage.mood}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Lighting</span>
                                    <span className="text-sm text-white">{selectedImage.lighting}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Aspect Ratio</span>
                                    <span className="text-sm text-white">{selectedImage.aspect_ratio}</span>
                                </div>
                            </div>

                            {/* Color Palette */}
                            <div className="mb-6">
                                <span className="text-xs text-gray-500 block mb-2">Color Palette</span>
                                <div className="flex gap-2">
                                    {selectedImage.color_palette.map((color, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: color }} />
                                            <span className="text-[10px] text-gray-500">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-auto space-y-2">
                                <button 
                                    onClick={() => stealLook(selectedImage)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-medium text-sm transition-colors"
                                >
                                    <Wand2 size={16} />
                                    {copiedId === selectedImage.id ? 'Style Copied!' : 'Use This Style'}
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => toggleFavorite(selectedImage.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                                            selectedImage.favorited 
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Heart size={14} className={selectedImage.favorited ? 'fill-current' : ''} />
                                        {selectedImage.favorited ? 'Saved' : 'Save'}
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
                                        <Download size={14} />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setShowUpload(false)}>
                    <div className="w-full max-w-xl bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Upload References</h3>
                            <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:border-purple-500/30 transition-colors">
                                <Upload size={40} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-white font-medium mb-2">Drop images here or click to browse</p>
                                <p className="text-xs text-gray-500">Supports JPG, PNG, WebP up to 10MB</p>
                                <input type="file" className="hidden" accept="image/*" multiple />
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Zap size={14} className="text-purple-400" />
                                <span className="text-xs text-gray-500">AI will automatically analyze and tag your images</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium">
                                Upload & Analyze
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
