'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Loader2, Filter } from 'lucide-react';
import AssetCard from '@/components/assets/AssetCard';
import { useNotification } from '@/contexts/NotificationContext';
import { Asset } from '@/types';

interface LocationScoutProps {
    projectId: string;
}

export default function LocationScout({ projectId }: LocationScoutProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'interior' | 'exterior'>('all');
    const [formData, setFormData] = useState({ name: '', type: 'exterior', prompt: '' });
    const [locations, setLocations] = useState<Asset[]>([]);

    useEffect(() => {
        if (projectId) {
            fetchLocations();
        }
    }, [projectId]);

    const fetchLocations = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/assets`);
            if (res.ok) {
                const data = await res.json();
                setLocations(data.filter((a: any) => a.type === 'location'));
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setLoading(true);
        addNotification('Scouting location...', 'processing');
        try {
            const response = await fetch('/api/generate/asset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    type: 'location',
                    name: formData.name,
                    prompt: formData.prompt,
                    definition: { type: formData.type }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate location');
            }

            const result = await response.json();
            fetchLocations();
            setIsModalOpen(false);
            setFormData({ name: '', type: 'exterior', prompt: '' });
            addNotification('Location scouted successfully', 'success');
        } catch (error) {
            console.error('Error generating location:', error);
            addNotification('Failed to scout location', 'error');
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
                setLocations(locations.filter(l => l.id !== id));
                addNotification('Location removed', 'success');
            } else {
                console.error('Failed to delete location');
                addNotification('Failed to remove location', 'error');
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            addNotification('Error removing location', 'error');
        }
    };

    const filteredLocations = filter === 'all'
        ? locations
        : locations.filter(l => (l.definition as any)?.type === filter);

    return (
        <div className="p-8 h-full bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h2>
                    <p className="text-gray-400 text-sm">Scout environments for your scenes</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        {['all', 'interior', 'exterior'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                    >
                        <MapPin size={18} /> Scout New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredLocations.map(loc => (
                    <AssetCard
                        key={loc.id}
                        title={loc.name || 'Unnamed Location'}
                        subtitle={(loc.definition as any)?.type || 'Unknown Type'}
                        imageUrl={loc.public_url || loc.gcs_path || ''}
                        onDelete={() => handleDelete(loc.id)}
                    />
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white">Scout New Location</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-400">Location Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:border-yellow-500 outline-none"
                                >
                                    <option value="exterior">Exterior</option>
                                    <option value="interior">Interior</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Description</label>
                                <textarea
                                    value={formData.prompt}
                                    onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                    placeholder="e.g. A cyberpunk alleyway with neon signs and rain..."
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
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
