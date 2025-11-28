'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, X, Film, Users, MapPin, Shirt, Package, Image,
    Video, Music, FileText, Clock, ArrowRight, Loader2, Command
} from 'lucide-react';
import { Asset, Project, Scene, Shot } from '@/types';

interface SearchResult {
    type: 'project' | 'asset' | 'scene' | 'shot';
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    color: string;
    url: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const TYPE_CONFIG = {
    project: { icon: Film, color: 'text-yellow-500' },
    cast: { icon: Users, color: 'text-purple-400' },
    location: { icon: MapPin, color: 'text-blue-400' },
    wardrobe: { icon: Shirt, color: 'text-pink-400' },
    prop: { icon: Package, color: 'text-orange-400' },
    image: { icon: Image, color: 'text-cyan-400' },
    video: { icon: Video, color: 'text-purple-400' },
    scene: { icon: FileText, color: 'text-green-400' },
    shot: { icon: Image, color: 'text-blue-400' },
};

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            // Load recent searches
            const saved = localStorage.getItem('sw_recent_searches');
            if (saved) {
                setRecentSearches(JSON.parse(saved).slice(0, 5));
            }
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                
                // Transform results
                const transformedResults: SearchResult[] = [];
                
                // Projects
                data.projects?.forEach((p: any) => {
                    transformedResults.push({
                        type: 'project',
                        id: p.id,
                        title: p.name,
                        subtitle: `${p.scenes_count || 0} scenes`,
                        icon: Film,
                        color: 'text-yellow-500',
                        url: `/production?projectId=${p.id}`
                    });
                });

                // Assets
                data.assets?.forEach((a: Asset) => {
                    const config = TYPE_CONFIG[a.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.image;
                    transformedResults.push({
                        type: 'asset',
                        id: a.id,
                        title: a.name || 'Untitled',
                        subtitle: a.type,
                        icon: config.icon,
                        color: config.color,
                        url: `/production/library?id=${a.id}`
                    });
                });

                // Scenes
                data.scenes?.forEach((s: Scene) => {
                    transformedResults.push({
                        type: 'scene',
                        id: s.id,
                        title: s.slug_line || 'Untitled Scene',
                        subtitle: `Scene ${s.order_index + 1}`,
                        icon: FileText,
                        color: 'text-green-400',
                        url: `/production?projectId=${s.project_id}&scene=${s.id}`
                    });
                });

                setResults(transformedResults.slice(0, 10));
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    selectResult(results[selectedIndex]);
                }
                break;
            case 'Escape':
                onClose();
                break;
        }
    };

    // Select result
    const selectResult = (result: SearchResult) => {
        // Save to recent searches
        const recent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
        localStorage.setItem('sw_recent_searches', JSON.stringify(recent));
        
        router.push(result.url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                    <Search className="text-gray-500" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search projects, assets, scenes..."
                        className="flex-1 bg-transparent text-white text-lg placeholder:text-gray-600 focus:outline-none"
                    />
                    {loading && <Loader2 size={20} className="animate-spin text-yellow-500" />}
                    <kbd className="hidden md:flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-gray-500">
                        <Command size={12} />K
                    </kbd>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {query && results.length === 0 && !loading && (
                        <div className="p-8 text-center">
                            <Search className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-gray-500">No results for "{query}"</p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="p-2">
                            {results.map((result, index) => {
                                const Icon = result.icon;
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => selectResult(result)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                            index === selectedIndex
                                                ? 'bg-yellow-500/10 text-white'
                                                : 'hover:bg-white/5 text-gray-300'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg bg-white/5 ${result.color}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-xs text-gray-500">{result.subtitle}</p>
                                            )}
                                        </div>
                                        <ArrowRight size={16} className="text-gray-600" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!query && recentSearches.length > 0 && (
                        <div className="p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Clock size={12} />
                                Recent Searches
                            </p>
                            <div className="space-y-1">
                                {recentSearches.map((search, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setQuery(search)}
                                        className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {!query && (
                        <div className="p-4 border-t border-white/5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'New Project', url: '/new-project', icon: Film },
                                    { label: 'Asset Library', url: '/production/library', icon: Package },
                                    { label: 'Settings', url: '/settings/engine', icon: Command },
                                    { label: 'Dashboard', url: '/dashboard', icon: ArrowRight },
                                ].map((action, i) => {
                                    const Icon = action.icon;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                router.push(action.url);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
                                        >
                                            <Icon size={16} />
                                            {action.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/5 bg-white/5 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd> Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd> Select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> Close
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Search trigger button
export function SearchTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
        >
            <Search size={16} />
            <span className="hidden md:inline text-sm">Search...</span>
            <kbd className="hidden md:flex items-center gap-0.5 ml-4 px-1.5 py-0.5 bg-white/5 rounded text-xs">
                <Command size={10} />K
            </kbd>
        </button>
    );
}
