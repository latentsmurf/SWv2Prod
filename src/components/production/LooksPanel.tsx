'use client';

import React, { useEffect, useState } from 'react';
import { 
    Loader2, AlertCircle, Search, Clapperboard, Camera, Sparkles, 
    Clock, Film, Palette, Sun, Smartphone, Share2, ChevronLeft, 
    ChevronRight, Star, X, Check
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface StylePreset {
    id: string;
    name: string;
    thumbnail_url: string;
    description?: string;
    category: string;
    aspect_ratio?: string;
    keywords?: string;
}

interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
}

// ============================================================================
// CATEGORIES
// ============================================================================

const CATEGORIES: Category[] = [
    { id: 'all', name: 'All', icon: 'grid', description: 'All styles' },
    { id: 'directors', name: 'Directors', icon: 'clapperboard', description: 'Iconic director styles' },
    { id: 'cinematographers', name: 'DPs', icon: 'camera', description: 'Master cinematographers' },
    { id: 'animation', name: 'Animation', icon: 'sparkles', description: 'Animation styles' },
    { id: 'eras', name: 'Eras', icon: 'clock', description: 'Film eras' },
    { id: 'genres', name: 'Genres', icon: 'film', description: 'Genre aesthetics' },
    { id: 'colors', name: 'Colors', icon: 'palette', description: 'Color palettes' },
    { id: 'lighting', name: 'Lighting', icon: 'sun', description: 'Lighting setups' },
    { id: 'micro-drama', name: 'Vertical', icon: 'smartphone', description: 'Micro drama styles' },
];

const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
        clapperboard: <Clapperboard size={14} />,
        camera: <Camera size={14} />,
        sparkles: <Sparkles size={14} />,
        clock: <Clock size={14} />,
        film: <Film size={14} />,
        palette: <Palette size={14} />,
        sun: <Sun size={14} />,
        smartphone: <Smartphone size={14} />,
        share: <Share2 size={14} />,
        grid: <Film size={14} />,
    };
    return icons[iconName] || <Film size={14} />;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LooksPanel() {
    const [presets, setPresets] = useState<StylePreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState<StylePreset | null>(null);

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sw_style_favorites');
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    }, []);

    // Fetch presets
    useEffect(() => {
        async function fetchPresets() {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (activeCategory !== 'all') {
                    params.set('category', activeCategory);
                }
                if (searchQuery) {
                    params.set('search', searchQuery);
                }
                
                const res = await fetch(`/api/style_presets?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setPresets(data);
                    setError(null);
                } else {
                    throw new Error('Failed to fetch presets');
                }
            } catch (err: any) {
                console.error('Error fetching presets:', err);
                setError('Failed to load presets');
            } finally {
                setLoading(false);
            }
        }

        fetchPresets();
    }, [activeCategory, searchQuery]);

    const handleSelect = async (preset: StylePreset) => {
        setSelectedId(preset.id);
        console.log('Selected preset:', preset.name);
        // TODO: Update project settings via API
    };

    const toggleFavorite = (presetId: string) => {
        const newFavorites = favorites.includes(presetId)
            ? favorites.filter(id => id !== presetId)
            : [...favorites, presetId];
        setFavorites(newFavorites);
        localStorage.setItem('sw_style_favorites', JSON.stringify(newFavorites));
    };

    // Sort presets: favorites first, then alphabetically
    const sortedPresets = [...presets].sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="bg-[#0a0a0a] border-l border-white/5 w-80 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <h2 className="font-semibold text-white tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Looks & Styles
                </h2>
                <p className="text-xs text-gray-500 mt-1">Select a visual style for your project</p>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-white/5">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search styles..."
                        className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Category Tabs */}
            <div className="relative border-b border-white/5">
                <div className="flex overflow-x-auto px-2 py-2 gap-1 hide-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                activeCategory === cat.id
                                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {getCategoryIcon(cat.icon)}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Count */}
            <div className="px-4 py-2 text-[10px] text-gray-500 uppercase tracking-wider">
                {loading ? 'Loading...' : `${sortedPresets.length} styles`}
                {activeCategory !== 'all' && ` in ${CATEGORIES.find(c => c.id === activeCategory)?.name}`}
            </div>

            {/* Presets Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="animate-spin text-yellow-500" />
                    </div>
                ) : sortedPresets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <Film className="text-gray-600 mb-2" size={24} />
                        <p className="text-sm text-gray-500">No styles found</p>
                        <p className="text-xs text-gray-600">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {sortedPresets.map((preset) => (
                            <div
                                key={preset.id}
                                className={`group cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200
                                    ${selectedId === preset.id
                                        ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                        : 'border-transparent hover:border-white/30'
                                    }
                                `}
                            >
                                {/* Image */}
                                <img
                                    src={preset.thumbnail_url}
                                    alt={preset.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onClick={() => handleSelect(preset)}
                                />
                                
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                    <span className="text-[10px] font-medium text-white truncate w-full pr-6">
                                        {preset.name}
                                    </span>
                                </div>

                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(preset.id);
                                    }}
                                    className={`absolute top-1.5 right-1.5 p-1 rounded-full transition-all ${
                                        favorites.includes(preset.id)
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                                    }`}
                                >
                                    <Star size={10} fill={favorites.includes(preset.id) ? 'currentColor' : 'none'} />
                                </button>

                                {/* Selected Indicator */}
                                {selectedId === preset.id && (
                                    <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                        <Check size={12} className="text-black" />
                                    </div>
                                )}

                                {/* Preview on Hover */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPreview(preset);
                                    }}
                                    className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-medium"
                                >
                                    Info
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowPreview(null)}>
                    <div 
                        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={showPreview.thumbnail_url} 
                            alt={showPreview.name}
                            className="w-full aspect-video object-cover"
                        />
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-white">{showPreview.name}</h3>
                                <span className="text-[10px] px-2 py-1 bg-white/10 rounded text-gray-400 uppercase">
                                    {showPreview.category}
                                </span>
                            </div>
                            {showPreview.description && (
                                <p className="text-sm text-gray-400 mb-4">{showPreview.description}</p>
                            )}
                            {showPreview.keywords && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {showPreview.keywords.split(', ').map((keyword, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-500">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        handleSelect(showPreview);
                                        setShowPreview(null);
                                    }}
                                    className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm transition-colors"
                                >
                                    Apply Style
                                </button>
                                <button
                                    onClick={() => toggleFavorite(showPreview.id)}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        favorites.includes(showPreview.id)
                                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Star size={18} fill={favorites.includes(showPreview.id) ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for hiding scrollbar */}
            <style jsx>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
