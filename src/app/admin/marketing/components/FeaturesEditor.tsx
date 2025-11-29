'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical, X } from 'lucide-react';
import { Feature, FEATURE_ICONS } from '@/data/marketingPageData';

interface FeaturesEditorProps {
    features: Feature[];
    onChange: (features: Feature[]) => void;
}

export default function FeaturesEditor({ features, onChange }: FeaturesEditorProps) {
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

    const addFeature = () => {
        const newFeature: Feature = {
            id: Date.now().toString(),
            icon: 'Star',
            title: 'New Feature',
            description: 'Describe this feature...'
        };
        onChange([...features, newFeature]);
        setEditingFeature(newFeature);
    };

    const deleteFeature = (id: string) => {
        onChange(features.filter(f => f.id !== id));
    };

    const updateFeature = (updated: Feature) => {
        onChange(features.map(f => f.id === updated.id ? updated : f));
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Features</h2>
                    <p className="text-sm text-gray-500">Highlight your product's capabilities</p>
                </div>
                <button onClick={addFeature} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-black rounded-lg text-sm font-medium">
                    <Plus size={16} />
                    Add Feature
                </button>
            </div>
            <div className="p-4 space-y-2">
                {features.map(feature => (
                    <div key={feature.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg group">
                        <GripVertical size={16} className="text-gray-600 cursor-grab" />
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                            {feature.icon.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{feature.title}</div>
                            <div className="text-sm text-gray-500 truncate">{feature.description}</div>
                        </div>
                        <button
                            onClick={() => setEditingFeature(feature)}
                            className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => deleteFeature(feature.id)}
                            className="p-2 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Feature Edit Modal */}
            {editingFeature && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingFeature(null)}>
                    <div className="w-full max-w-lg p-6 bg-[#0a0a0a] border border-white/10 rounded-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Edit Feature</h3>
                            <button onClick={() => setEditingFeature(null)} className="p-1 hover:bg-white/10 rounded">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editingFeature.title}
                                    onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={editingFeature.description}
                                    onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Icon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {FEATURE_ICONS.map(icon => (
                                        <button
                                            key={icon}
                                            onClick={() => setEditingFeature({ ...editingFeature, icon })}
                                            className={`p-2 rounded text-center ${editingFeature.icon === icon ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {icon.charAt(0)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Image URL (optional)</label>
                                <input
                                    type="text"
                                    value={editingFeature.image || ''}
                                    onChange={(e) => setEditingFeature({ ...editingFeature, image: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setEditingFeature(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button
                                    onClick={() => { updateFeature(editingFeature); setEditingFeature(null); }}
                                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
