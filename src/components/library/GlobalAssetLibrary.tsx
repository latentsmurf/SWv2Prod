'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, MapPin, Shirt, Package, Search, Plus, Star, Filter,
    Loader2, Grid, List, Check, X, Copy, Sparkles, FolderOpen,
    Download, Upload, MoreHorizontal, Heart, Tag
} from 'lucide-react';
import { Asset, AssetDefinition } from '@/types';

type AssetCategory = 'cast' | 'location' | 'wardrobe' | 'prop' | 'all';

interface GlobalAssetLibraryProps {
    onSelectAsset?: (asset: Asset) => void;
    onImportToProject?: (assets: Asset[], projectId: string) => void;
    currentProjectId?: string;
    selectionMode?: boolean;
    filterCategory?: AssetCategory;
}

const CATEGORY_CONFIG = {
    cast: { icon: Users, label: 'Cast', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    location: { icon: MapPin, label: 'Locations', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    wardrobe: { icon: Shirt, label: 'Wardrobe', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    prop: { icon: Package, label: 'Props', color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

export default function GlobalAssetLibrary({
    onSelectAsset,
    onImportToProject,
    currentProjectId,
    selectionMode = false,
    filterCategory
}: GlobalAssetLibraryProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(filterCategory || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Fetch global assets
    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/library/assets');
                if (res.ok) {
                    const data = await res.json();
                    setAssets(data);
                    
                    // Load favorites from localStorage
                    const savedFavorites = localStorage.getItem('asset_favorites');
                    if (savedFavorites) {
                        setFavorites(new Set(JSON.parse(savedFavorites)));
                    }
                }
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    // Filter assets
    const filteredAssets = assets.filter(asset => {
        // Category filter
        if (selectedCategory !== 'all' && asset.type !== selectedCategory) {
            return false;
        }
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = asset.name?.toLowerCase().includes(query);
            const descMatch = (asset.definition as AssetDefinition)?.description?.toLowerCase().includes(query);
            const tagMatch = asset.tags?.some(t => t.toLowerCase().includes(query));
            return nameMatch || descMatch || tagMatch;
        }
        
        return true;
    });

    // Sort: favorites first, then by date
    const sortedAssets = [...filteredAssets].sort((a, b) => {
        const aFav = favorites.has(a.id);
        const bFav = favorites.has(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    // Toggle favorite
    const toggleFavorite = (assetId: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(assetId)) {
                next.delete(assetId);
            } else {
                next.add(assetId);
            }
            localStorage.setItem('asset_favorites', JSON.stringify([...next]));
            return next;
        });
    };

    // Toggle selection
    const toggleSelection = (assetId: string) => {
        setSelectedAssets(prev => {
            const next = new Set(prev);
            if (next.has(assetId)) {
                next.delete(assetId);
            } else {
                next.add(assetId);
            }
            return next;
        });
    };

    // Import selected assets to project
    const handleImportToProject = async () => {
        if (!currentProjectId || selectedAssets.size === 0) return;
        
        const assetsToImport = assets.filter(a => selectedAssets.has(a.id));
        
        try {
            const res = await fetch(`/api/projects/${currentProjectId}/assets/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_ids: [...selectedAssets]
                })
            });
            
            if (res.ok) {
                onImportToProject?.(assetsToImport, currentProjectId);
                setSelectedAssets(new Set());
            }
        } catch (error) {
            console.error('Error importing assets:', error);
        }
    };

    // Save asset to global library
    const saveToLibrary = async (asset: Asset) => {
        try {
            const res = await fetch('/api/library/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...asset,
                    is_global: true
                })
            });
            
            if (res.ok) {
                const savedAsset = await res.json();
                setAssets(prev => [savedAsset, ...prev]);
            }
        } catch (error) {
            console.error('Error saving to library:', error);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FolderOpen className="text-yellow-500" />
                            Asset Library
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {sortedAssets.length} assets • Reuse across all projects
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectionMode && selectedAssets.size > 0 && (
                            <button
                                onClick={handleImportToProject}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                            >
                                <Copy size={16} />
                                Import ({selectedAssets.size})
                            </button>
                        )}
                        
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                            New Asset
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, description, or tags..."
                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-yellow-500 text-black font-medium'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            All
                        </button>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key as AssetCategory)}
                                    className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                                        selectedCategory === key
                                            ? 'bg-yellow-500 text-black font-medium'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Icon size={14} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                    </div>
                ) : sortedAssets.length === 0 ? (
                    <div className="text-center py-20">
                        <FolderOpen className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No assets found.</p>
                        <p className="text-sm text-gray-600 mt-2">
                            {searchQuery 
                                ? 'Try a different search term.' 
                                : 'Create or import assets to build your library.'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {sortedAssets.map(asset => (
                            <AssetCard
                                key={asset.id}
                                asset={asset}
                                isSelected={selectedAssets.has(asset.id)}
                                isFavorite={favorites.has(asset.id)}
                                selectionMode={selectionMode}
                                onSelect={() => selectionMode ? toggleSelection(asset.id) : onSelectAsset?.(asset)}
                                onToggleFavorite={() => toggleFavorite(asset.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedAssets.map(asset => (
                            <AssetListItem
                                key={asset.id}
                                asset={asset}
                                isSelected={selectedAssets.has(asset.id)}
                                isFavorite={favorites.has(asset.id)}
                                selectionMode={selectionMode}
                                onSelect={() => selectionMode ? toggleSelection(asset.id) : onSelectAsset?.(asset)}
                                onToggleFavorite={() => toggleFavorite(asset.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateAssetModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={saveToLibrary}
                />
            )}
        </div>
    );
}

// Asset Card Component
function AssetCard({
    asset,
    isSelected,
    isFavorite,
    selectionMode,
    onSelect,
    onToggleFavorite
}: {
    asset: Asset;
    isSelected: boolean;
    isFavorite: boolean;
    selectionMode: boolean;
    onSelect: () => void;
    onToggleFavorite: () => void;
}) {
    const config = CATEGORY_CONFIG[asset.type as keyof typeof CATEGORY_CONFIG];
    const Icon = config?.icon || Package;

    return (
        <div
            onClick={onSelect}
            className={`group relative bg-[#121212] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                isSelected 
                    ? 'border-yellow-500 ring-2 ring-yellow-500/20' 
                    : 'border-white/5 hover:border-white/20'
            }`}
        >
            {/* Image */}
            <div className="aspect-square bg-black relative">
                {asset.public_url ? (
                    <img
                        src={asset.public_url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Icon size={32} />
                    </div>
                )}

                {/* Selection Checkbox */}
                {selectionMode && (
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                            ? 'bg-yellow-500 border-yellow-500' 
                            : 'bg-black/50 border-white/30'
                    }`}>
                        {isSelected && <Check size={14} className="text-black" />}
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite();
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                        isFavorite 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-black/50 text-white/50 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>

                {/* Category Badge */}
                <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${config?.bg} ${config?.color}`}>
                    {config?.label || asset.type}
                </div>
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-sm font-medium text-white truncate">{asset.name || 'Untitled'}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                    {(asset.definition as AssetDefinition)?.vibe || 
                     (asset.definition as AssetDefinition)?.description || 
                     asset.type}
                </p>
            </div>
        </div>
    );
}

// Asset List Item Component
function AssetListItem({
    asset,
    isSelected,
    isFavorite,
    selectionMode,
    onSelect,
    onToggleFavorite
}: {
    asset: Asset;
    isSelected: boolean;
    isFavorite: boolean;
    selectionMode: boolean;
    onSelect: () => void;
    onToggleFavorite: () => void;
}) {
    const config = CATEGORY_CONFIG[asset.type as keyof typeof CATEGORY_CONFIG];
    const Icon = config?.icon || Package;

    return (
        <div
            onClick={onSelect}
            className={`flex items-center gap-4 p-3 bg-[#121212] border rounded-xl cursor-pointer transition-all ${
                isSelected 
                    ? 'border-yellow-500 bg-yellow-500/5' 
                    : 'border-white/5 hover:border-white/20'
            }`}
        >
            {/* Selection Checkbox */}
            {selectionMode && (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected 
                        ? 'bg-yellow-500 border-yellow-500' 
                        : 'border-white/30'
                }`}>
                    {isSelected && <Check size={12} className="text-black" />}
                </div>
            )}

            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
                {asset.public_url ? (
                    <img src={asset.public_url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Icon size={20} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{asset.name || 'Untitled'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${config?.bg} ${config?.color}`}>
                        {config?.label || asset.type}
                    </span>
                    {asset.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] text-gray-500">#{tag}</span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                }}
                className={`p-2 rounded-lg transition-colors ${
                    isFavorite ? 'text-red-400' : 'text-gray-500 hover:text-white'
                }`}
            >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
}

// Create Asset Modal
function CreateAssetModal({
    onClose,
    onSave
}: {
    onClose: () => void;
    onSave: (asset: Asset) => void;
}) {
    const [category, setCategory] = useState<'cast' | 'location' | 'wardrobe' | 'prop'>('cast');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!description) return;
        
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate/asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: category,
                    name: name || `New ${category}`,
                    prompt: description,
                    is_global: true,
                    definition: { description }
                })
            });

            if (response.ok) {
                const data = await response.json();
                onSave(data.data[0]);
                onClose();
            }
        } catch (error) {
            console.error('Error generating asset:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Create New Asset</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setCategory(key as any)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                            category === key
                                                ? 'border-yellow-500 bg-yellow-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <Icon size={20} className={category === key ? 'text-yellow-500' : 'text-gray-400'} />
                                        <span className="text-xs text-gray-300">{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`e.g., ${category === 'cast' ? 'John Smith' : category === 'location' ? 'Modern Loft' : category === 'wardrobe' ? 'Casual Friday' : 'Vintage Camera'}`}
                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
                        />
                    </div>

                    {/* Description / Prompt */}
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Description (AI Prompt)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={`Describe the ${category} you want to create...`}
                            rows={4}
                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 bg-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={!description || isGenerating}
                        className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Sparkles size={16} />
                        )}
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
}
