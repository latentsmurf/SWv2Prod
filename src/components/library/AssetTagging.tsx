'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Tag, Plus, X, Search, Hash, Palette, Clock, Star,
    Filter, ChevronDown, Loader2, Check, Sparkles
} from 'lucide-react';

interface AssetTag {
    id: string;
    name: string;
    color: string;
    count: number;
    category?: string;
}

interface AssetTaggingProps {
    assetId: string;
    assetType: string;
    currentTags?: AssetTag[];
    onTagsChange?: (tags: AssetTag[]) => void;
    compact?: boolean;
}

const TAG_COLORS = [
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Gray', value: '#6B7280' },
];

export default function AssetTagging({
    assetId,
    assetType,
    currentTags = [],
    onTagsChange,
    compact = false
}: AssetTaggingProps) {
    const [tags, setTags] = useState<AssetTag[]>(currentTags);
    const [allTags, setAllTags] = useState<AssetTag[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[4].value);
    const [loading, setLoading] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch all available tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/tags');
                if (res.ok) {
                    setAllTags(await res.json());
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Add tag to asset
    const addTag = async (tag: AssetTag) => {
        if (tags.find(t => t.id === tag.id)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/${assetType}s/${assetId}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_id: tag.id })
            });

            if (res.ok) {
                const newTags = [...tags, tag];
                setTags(newTags);
                onTagsChange?.(newTags);
            }
        } catch (error) {
            console.error('Error adding tag:', error);
        } finally {
            setLoading(false);
        }
    };

    // Remove tag from asset
    const removeTag = async (tagId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/${assetType}s/${assetId}/tags/${tagId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const newTags = tags.filter(t => t.id !== tagId);
                setTags(newTags);
                onTagsChange?.(newTags);
            }
        } catch (error) {
            console.error('Error removing tag:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create new tag
    const createTag = async () => {
        if (!newTagName.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTagName,
                    color: newTagColor
                })
            });

            if (res.ok) {
                const newTag = await res.json();
                setAllTags(prev => [...prev, newTag]);
                await addTag(newTag);
                setNewTagName('');
            }
        } catch (error) {
            console.error('Error creating tag:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tags
    const filteredTags = allTags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tags.find(t => t.id === tag.id)
    );

    if (compact) {
        return (
            <div className="flex flex-wrap items-center gap-1">
                {tags.map((tag) => (
                    <span
                        key={tag.id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white"
                        style={{ backgroundColor: tag.color + '40' }}
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                    </span>
                ))}
                <button
                    onClick={() => setShowDropdown(true)}
                    className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                >
                    <Plus size={12} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Current Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {tags.map((tag) => (
                    <span
                        key={tag.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm"
                        style={{ backgroundColor: tag.color + '20' }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tag.color }}
                        />
                        <span style={{ color: tag.color }}>{tag.name}</span>
                        <button
                            onClick={() => removeTag(tag.id)}
                            className="ml-1 text-gray-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}

                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                    <Tag size={14} />
                    Add Tag
                </button>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                    {/* Search */}
                    <div className="p-2 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tags..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Tag List */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredTags.length === 0 ? (
                            <p className="p-3 text-sm text-gray-500 text-center">
                                {searchQuery ? 'No matching tags' : 'No tags available'}
                            </p>
                        ) : (
                            filteredTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => addTag(tag)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5"
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="text-sm text-white flex-1 text-left">{tag.name}</span>
                                    <span className="text-xs text-gray-600">{tag.count}</span>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Create New Tag */}
                    <div className="p-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="p-2 rounded-lg hover:bg-white/5"
                            >
                                <span
                                    className="w-4 h-4 rounded-full block"
                                    style={{ backgroundColor: newTagColor }}
                                />
                            </button>
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Create new tag..."
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') createTag();
                                }}
                            />
                            <button
                                onClick={createTag}
                                disabled={!newTagName.trim() || loading}
                                className="p-2 text-gray-400 hover:text-yellow-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Plus size={16} />
                                )}
                            </button>
                        </div>

                        {/* Color Picker */}
                        {showColorPicker && (
                            <div className="flex flex-wrap gap-1 mt-2 p-2 bg-black/30 rounded-lg">
                                {TAG_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => {
                                            setNewTagColor(color.value);
                                            setShowColorPicker(false);
                                        }}
                                        className={`w-6 h-6 rounded-full ${
                                            newTagColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' : ''
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Smart search with tag filtering
export function TaggedAssetSearch({
    onSearch,
    onTagFilter
}: {
    onSearch: (query: string) => void;
    onTagFilter: (tags: string[]) => void;
}) {
    const [query, setQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<AssetTag[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            const res = await fetch('/api/tags');
            if (res.ok) {
                setAllTags(await res.json());
            }
        };
        fetchTags();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const toggleTag = (tagId: string) => {
        const newSelected = selectedTags.includes(tagId)
            ? selectedTags.filter(t => t !== tagId)
            : [...selectedTags, tagId];
        setSelectedTags(newSelected);
        onTagFilter(newSelected);
    };

    return (
        <div className="space-y-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search assets..."
                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-600"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                        selectedTags.length > 0
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                            : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                    <Filter size={18} />
                    {selectedTags.length > 0 && (
                        <span className="text-sm">{selectedTags.length}</span>
                    )}
                </button>
            </form>

            {showFilters && (
                <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl">
                    {allTags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedTags.includes(tag.id)
                                    ? 'ring-2 ring-white'
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: tag.color + '30', color: tag.color }}
                        >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                            {selectedTags.includes(tag.id) && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
