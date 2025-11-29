'use client';

import React, { useState, useEffect } from 'react';
import { Hammer, Sparkles, Loader2 } from 'lucide-react';
import AssetCard from '@/components/assets/AssetCard';
import { useNotification } from '@/contexts/NotificationContext';
import { Asset } from '@/types';

interface PropMasterProps {
    projectId: string;
}

export default function PropMaster({ projectId }: PropMasterProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', prompt: '' });
    const [props, setProps] = useState<Asset[]>([]);

    useEffect(() => {
        if (projectId) {
            fetchProps();
        }
    }, [projectId]);

    const fetchProps = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/assets`);
            if (res.ok) {
                const data = await res.json();
                setProps(data.filter((a: any) => a.type === 'prop'));
            }
        } catch (error) {
            console.error('Error fetching props:', error);
        }
    };

    const { addNotification } = useNotification();

    const handleGenerate = async () => {
        setLoading(true);
        addNotification('Fabricating prop...', 'processing');
        try {
            const response = await fetch('/api/generate/asset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    type: 'prop',
                    name: formData.name,
                    prompt: formData.prompt,
                    definition: {}
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate prop');
            }

            const result = await response.json();
            fetchProps();
            setIsModalOpen(false);
            setFormData({ name: '', prompt: '' });
            addNotification('Prop fabricated successfully', 'success');
        } catch (error) {
            console.error('Error generating prop:', error);
            addNotification('Failed to fabricate prop', 'error');
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
                setProps(props.filter(p => p.id !== id));
                addNotification('Prop deleted', 'success');
            } else {
                console.error('Failed to delete prop');
                addNotification('Failed to delete prop', 'error');
            }
        } catch (error) {
            console.error('Error deleting prop:', error);
            addNotification('Error deleting prop', 'error');
        }
    };

    return (
        <div className="p-8 h-full bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prop Master</h2>
                    <p className="text-gray-400 text-sm">Fabricate items and artifacts</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                >
                    <Hammer size={18} /> Fabricate Prop
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {props.map(prop => (
                    <AssetCard
                        key={prop.id}
                        title={prop.name || 'Unnamed Prop'}
                        subtitle="Custom Prop"
                        imageUrl={prop.public_url || prop.gcs_path || ''}
                        onDelete={() => handleDelete(prop.id)}
                    />
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white">Fabricate New Prop</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-400">Prop Name</label>
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
                                    placeholder="e.g. A rusty iron sword with glowing runes..."
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
                                Fabricate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
