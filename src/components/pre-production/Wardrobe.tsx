'use client';

import React, { useState, useEffect } from 'react';
import { Shirt, Sparkles, Loader2 } from 'lucide-react';
import AssetCard from '@/components/assets/AssetCard';
import { Asset } from '@/types';

interface WardrobeProps {
    projectId: string;
}

export default function Wardrobe({ projectId }: WardrobeProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', prompt: '' });
    const [outfits, setOutfits] = useState<Asset[]>([]);

    useEffect(() => {
        if (projectId) {
            fetchOutfits();
        }
    }, [projectId]);

    const fetchOutfits = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/assets`);
            if (res.ok) {
                const data = await res.json();
                // Filter for wardrobe items
                setOutfits(data.filter((a: any) => a.type === 'wardrobe'));
            }
        } catch (error) {
            console.error('Error fetching outfits:', error);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate/asset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    type: 'wardrobe',
                    name: formData.name,
                    prompt: formData.prompt,
                    definition: {}
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate outfit');
            }

            const result = await response.json();
            fetchOutfits();
            setIsModalOpen(false);
            setFormData({ name: '', prompt: '' });
        } catch (error) {
            console.error('Error generating outfit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Implement delete API call if needed, or just optimistic update for now
        setOutfits(outfits.filter(o => o.id !== id));
    };

    return (
        <div className="p-8 h-full bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Wardrobe</h2>
                    <p className="text-gray-400 text-sm">Costume design and fitting</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                >
                    <Shirt size={18} /> Design Outfit
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {outfits.map(outfit => (
                    <div key={outfit.id} className="relative group">
                        <AssetCard
                            title={outfit.name || 'Unnamed Outfit'}
                            subtitle="Custom Outfit"
                            imageUrl={outfit.public_url || outfit.gcs_path || ''}
                            onDelete={() => handleDelete(outfit.id)}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-yellow-500 hover:text-black transition-colors">
                                Equip to...
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white">Design New Outfit</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-400">Outfit Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Description</label>
                                <textarea
                                    value={formData.prompt}
                                    onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                    placeholder="e.g. A futuristic space suit with neon accents..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none h-24"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                Design
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
