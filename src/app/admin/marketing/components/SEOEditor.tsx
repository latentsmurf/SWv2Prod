'use client';

import React from 'react';
import { X } from 'lucide-react';
import { SEOSettings } from '@/data/marketingPageData';

interface SEOEditorProps {
    seo: SEOSettings;
    onChange: (seo: SEOSettings) => void;
}

export default function SEOEditor({ seo, onChange }: SEOEditorProps) {
    const update = (updates: Partial<SEOSettings>) => {
        onChange({ ...seo, ...updates });
    };

    const addKeyword = (keyword: string) => {
        if (keyword && !seo.keywords.includes(keyword)) {
            update({ keywords: [...seo.keywords, keyword] });
        }
    };

    const removeKeyword = (keyword: string) => {
        update({ keywords: seo.keywords.filter(k => k !== keyword) });
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">SEO & Meta Tags</h2>
                <p className="text-sm text-gray-500">Search engine optimization settings</p>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Page Title</label>
                    <input
                        type="text"
                        value={seo.title}
                        onChange={(e) => update({ title: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">{seo.title.length}/60 characters recommended</p>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
                    <textarea
                        value={seo.description}
                        onChange={(e) => update({ description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{seo.description.length}/160 characters recommended</p>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Keywords</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {seo.keywords.map(keyword => (
                            <span key={keyword} className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-sm text-white">
                                {keyword}
                                <button onClick={() => removeKeyword(keyword)} className="hover:text-red-400">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Add keyword..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                addKeyword((e.target as HTMLInputElement).value.trim());
                                (e.target as HTMLInputElement).value = '';
                            }
                        }}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">OG Image URL</label>
                        <input
                            type="text"
                            value={seo.og_image}
                            onChange={(e) => update({ og_image: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Twitter Card</label>
                        <select
                            value={seo.twitter_card}
                            onChange={(e) => update({ twitter_card: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        >
                            <option value="summary">Summary</option>
                            <option value="summary_large_image">Summary Large Image</option>
                            <option value="player">Player</option>
                            <option value="app">App</option>
                        </select>
                    </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Search Preview</p>
                    <div className="text-blue-400 text-lg hover:underline cursor-pointer">{seo.title || 'Page Title'}</div>
                    <div className="text-green-400 text-sm">sceneweaver.ai</div>
                    <div className="text-gray-400 text-sm mt-1">{seo.description || 'Meta description...'}</div>
                </div>
            </div>
        </div>
    );
}
