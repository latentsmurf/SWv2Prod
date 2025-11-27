'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, Loader2 } from 'lucide-react';
import AssetCard from '@/components/assets/AssetCard';
import { useNotification } from '@/contexts/NotificationContext';
import { Asset } from '@/types';

interface CastingManagerProps {
    projectId: string;
}

export default function CastingManager({ projectId }: CastingManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', age: '', vibe: '' });
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        if (projectId) {
            fetchAssets();
        }
    }, [projectId]);

    const fetchAssets = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/assets`);
            if (res.ok) {
                const data = await res.json();
                setAssets(data.filter((a: any) => a.type === 'cast'));
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setLoading(true);
        addNotification('Casting actor...', 'processing');
        try {
            const response = await fetch('/api/generate/asset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    type: 'cast',
                    name: formData.name,
                    prompt: `Portrait of a ${formData.age} year old, ${formData.vibe} look`,
                    definition: { age: formData.age, vibe: formData.vibe }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate asset');
            }

            const result = await response.json();
            // Refresh assets
            fetchAssets();
            setIsModalOpen(false);
            setFormData({ name: '', age: '', vibe: '' });
            addNotification('Actor cast successfully', 'success');
        } catch (error) {
            console.error('Error generating asset:', error);
            addNotification('Failed to cast actor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/assets/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setAssets(assets.filter(a => a.id !== id));
                addNotification('Actor removed', 'success');
            } else {
                console.error('Failed to delete asset');
                addNotification('Failed to remove actor', 'error');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            addNotification('Error removing actor', 'error');
        }
    };

    return (
        <div className="p-8 h-full bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Casting</h2>
                    <p className="text-gray-400 text-sm">Manage your project's talent</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                >
                    <UserPlus size={18} /> New Actor
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {assets.map(asset => (
                    <AssetCard
                        key={asset.id}
                        title={asset.name || 'Unnamed Actor'}
                        subtitle={(asset.definition as any)?.vibe || 'No description'}
                        imageUrl={asset.public_url || asset.gcs_path || ''}
                        onEdit={() => { }}
                        onDelete={() => handleDelete(asset.id)}
                    />
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white">Cast New Actor</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-400">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Age</label>
                                <input
                                    type="text"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Vibe / Description</label>
                                <textarea
                                    value={formData.vibe}
                                    onChange={e => setFormData({ ...formData, vibe: e.target.value })}
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
                                Generate Face
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
