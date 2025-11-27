'use client';

import React, { useState, useEffect } from 'react';
import { Search, Check, Loader2, Upload, Wand2 } from 'lucide-react';

// Define a simplified interface for ReferenceImage
interface ReferenceImage {
    id: string;
    image_url: string;
    metadata: {
        description?: string;
        mood?: string;
        lighting_style?: string;
        color_palette?: string[];
    };
}

export default function ReferenceLibrary() {
    const [searchQuery, setSearchQuery] = useState('');
    const [images, setImages] = useState<ReferenceImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async (query: string = '') => {
        setLoading(true);
        try {
            const res = await fetch('/api/vault/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query || "cinematic", limit: 20 })
            });

            if (res.ok) {
                const data = await res.json();
                // Map backend results to frontend structure if needed
                // Backend returns { results: [{ id, url, title, tags, score }] }
                // We need to adapt it to ReferenceImage structure or update the component to use the new structure.
                // Let's adapt it for now to match the existing UI.

                const adaptedImages: ReferenceImage[] = data.results.map((item: any) => ({
                    id: item.id,
                    image_url: item.url || 'https://placehold.co/600x400/1a1a1a/cyan?text=No+Image',
                    metadata: {
                        description: item.title,
                        mood: item.tags?.[0] || 'Unknown',
                        lighting_style: item.tags?.[1] || 'Cinematic',
                        color_palette: ['#000000', '#ffffff'] // Mock palette
                    }
                }));
                setImages(adaptedImages);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchImages(searchQuery);
    };

    const stealLook = (img: ReferenceImage) => {
        console.log(`Stealing look from ${img.id}:`, img.metadata);
        setCopiedId(img.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-8 h-full flex flex-col bg-[#0a0a0a]">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Reference Vault</h2>
                    <p className="text-gray-400 text-sm mt-1">AI-powered visual library</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by mood, lighting, or description..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                        />
                    </form>
                    <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                        <Upload size={20} />
                    </button>
                </div>
            </div>

            {/* Masonry Grid */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-yellow-500" size={40} />
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
                    {images.length === 0 && (
                        <div className="text-center text-gray-500 py-10 col-span-full">
                            No references found. Try searching for "cinematic", "noir", or "sci-fi".
                        </div>
                    )}
                    {images.map((img) => (
                        <div key={img.id} className="break-inside-avoid group relative rounded-xl overflow-hidden bg-[#121212] border border-white/5 hover:border-white/20 transition-all duration-300">
                            <img
                                src={img.image_url}
                                alt={img.metadata.description || 'Reference Image'}
                                className="w-full h-auto object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {img.metadata.mood && (
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                                                {img.metadata.mood}
                                            </span>
                                        )}
                                        {img.metadata.lighting_style && (
                                            <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                {img.metadata.lighting_style}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-300 line-clamp-2">{img.metadata.description}</p>

                                    <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-2">
                                        <div className="flex gap-1">
                                            {img.metadata.color_palette?.map((color: string, i: number) => (
                                                <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => stealLook(img)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-white hover:text-yellow-400 transition-colors"
                                        >
                                            {copiedId === img.id ? (
                                                <>
                                                    <Check size={12} /> Applied
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 size={12} /> Steal Look
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
