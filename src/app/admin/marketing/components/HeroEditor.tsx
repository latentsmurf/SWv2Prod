'use client';

import React from 'react';
import { HeroSection } from '@/data/marketingPageData';

interface HeroEditorProps {
    hero: HeroSection;
    onChange: (hero: HeroSection) => void;
}

export default function HeroEditor({ hero, onChange }: HeroEditorProps) {
    const update = (updates: Partial<HeroSection>) => {
        onChange({ ...hero, ...updates });
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">Hero Section</h2>
                <p className="text-sm text-gray-500">The main banner on your landing page</p>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Headline</label>
                    <input
                        type="text"
                        value={hero.headline}
                        onChange={(e) => update({ headline: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Subheadline</label>
                    <textarea
                        value={hero.subheadline}
                        onChange={(e) => update({ subheadline: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Primary CTA Text</label>
                        <input
                            type="text"
                            value={hero.cta_primary.text}
                            onChange={(e) => update({ cta_primary: { ...hero.cta_primary, text: e.target.value } })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Primary CTA URL</label>
                        <input
                            type="text"
                            value={hero.cta_primary.url}
                            onChange={(e) => update({ cta_primary: { ...hero.cta_primary, url: e.target.value } })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Secondary CTA Text</label>
                        <input
                            type="text"
                            value={hero.cta_secondary.text}
                            onChange={(e) => update({ cta_secondary: { ...hero.cta_secondary, text: e.target.value } })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Secondary CTA URL</label>
                        <input
                            type="text"
                            value={hero.cta_secondary.url}
                            onChange={(e) => update({ cta_secondary: { ...hero.cta_secondary, url: e.target.value } })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Background Video URL</label>
                        <input
                            type="text"
                            value={hero.background_video || ''}
                            onChange={(e) => update({ background_video: e.target.value })}
                            placeholder="/videos/hero.mp4"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Background Image URL</label>
                        <input
                            type="text"
                            value={hero.background_image || ''}
                            onChange={(e) => update({ background_image: e.target.value })}
                            placeholder="/images/hero.jpg"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                    </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={hero.show_demo_reel}
                        onChange={(e) => update({ show_demo_reel: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-600 bg-transparent text-yellow-500"
                    />
                    <span className="text-gray-400">Show demo reel button</span>
                </label>
            </div>
        </div>
    );
}
