'use client';

import React, { useState } from 'react';
import { 
    Search, Wand2, Grid, List,
    SlidersHorizontal, Heart, Upload, X,
    ChevronDown, Sparkles, Sun, Layers,
    FolderPlus, Check
} from 'lucide-react';

// Import extracted data and components
import { 
    ReferenceImage, 
    Collection, 
    MOCK_IMAGES, 
    MOCK_COLLECTIONS, 
    MOODS, 
    LIGHTING 
} from '@/data/referenceLibraryData';
import ImageDetailModal from './ImageDetailModal';
import UploadModal from './UploadModal';

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
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                            {filteredImages.length} reference{filteredImages.length !== 1 ? 's' : ''}
                            {searchQuery && ` for "${searchQuery}"`}
                        </span>
                    </div>

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
                                <ImageCard
                                    key={img.id}
                                    image={img}
                                    copiedId={copiedId}
                                    viewMode="masonry"
                                    onSelect={() => setSelectedImage(img)}
                                    onToggleFavorite={toggleFavorite}
                                    onStealLook={stealLook}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map((img) => (
                                <ImageCard
                                    key={img.id}
                                    image={img}
                                    copiedId={copiedId}
                                    viewMode="grid"
                                    onSelect={() => setSelectedImage(img)}
                                    onToggleFavorite={toggleFavorite}
                                    onStealLook={stealLook}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedImage && (
                <ImageDetailModal
                    image={selectedImage}
                    copiedId={copiedId}
                    onClose={() => setSelectedImage(null)}
                    onToggleFavorite={toggleFavorite}
                    onStealLook={stealLook}
                />
            )}

            {showUpload && (
                <UploadModal onClose={() => setShowUpload(false)} />
            )}
        </div>
    );
}

// ============================================================================
// IMAGE CARD COMPONENT
// ============================================================================

interface ImageCardProps {
    image: ReferenceImage;
    copiedId: string | null;
    viewMode: 'grid' | 'masonry';
    onSelect: () => void;
    onToggleFavorite: (id: string) => void;
    onStealLook: (image: ReferenceImage) => void;
}

function ImageCard({ image, copiedId, viewMode, onSelect, onToggleFavorite, onStealLook }: ImageCardProps) {
    if (viewMode === 'masonry') {
        return (
            <div 
                className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                onClick={onSelect}
            >
                <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-auto object-cover"
                />

                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(image.id); }}
                    className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
                        image.favorited 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <Heart size={14} className={image.favorited ? 'fill-current' : ''} />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-white">{image.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                                {image.mood}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                {image.lighting}
                            </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-2">
                            <div className="flex gap-1">
                                {image.color_palette.slice(0, 4).map((color, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onStealLook(image); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-purple-400 transition-colors bg-white/10 px-2 py-1 rounded"
                            >
                                {copiedId === image.id ? (
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
        );
    }

    return (
        <div 
            className="group relative aspect-square rounded-xl overflow-hidden bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
            onClick={onSelect}
        >
            <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover"
            />
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(image.id); }}
                className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                    image.favorited 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                }`}
            >
                <Heart size={12} className={image.favorited ? 'fill-current' : ''} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{image.title}</p>
            </div>
        </div>
    );
}
