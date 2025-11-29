'use client';

import React from 'react';
import { X, Wand2, Heart, Download, Check } from 'lucide-react';
import { ReferenceImage } from '@/data/referenceLibraryData';

interface ImageDetailModalProps {
    image: ReferenceImage;
    copiedId: string | null;
    onClose: () => void;
    onToggleFavorite: (id: string) => void;
    onStealLook: (image: ReferenceImage) => void;
}

export default function ImageDetailModal({ 
    image, 
    copiedId, 
    onClose, 
    onToggleFavorite, 
    onStealLook 
}: ImageDetailModalProps) {
    return (
        <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" 
            onClick={onClose}
        >
            <div 
                className="max-w-5xl w-full bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex" 
                onClick={e => e.stopPropagation()}
            >
                {/* Image */}
                <div className="flex-1 bg-black flex items-center justify-center p-4">
                    <img 
                        src={image.image_url} 
                        alt={image.title}
                        className="max-h-[70vh] w-auto rounded-lg"
                    />
                </div>

                {/* Details */}
                <div className="w-80 border-l border-white/10 p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">{image.title}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {image.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Properties */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Mood</span>
                            <span className="text-sm text-white">{image.mood}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Lighting</span>
                            <span className="text-sm text-white">{image.lighting}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Aspect Ratio</span>
                            <span className="text-sm text-white">{image.aspect_ratio}</span>
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div className="mb-6">
                        <span className="text-xs text-gray-500 block mb-2">Color Palette</span>
                        <div className="flex gap-2">
                            {image.color_palette.map((color, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div 
                                        className="w-10 h-10 rounded-lg border border-white/10" 
                                        style={{ backgroundColor: color }} 
                                    />
                                    <span className="text-[10px] text-gray-500">{color}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                        <button 
                            onClick={() => onStealLook(image)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-medium text-sm transition-colors"
                        >
                            <Wand2 size={16} />
                            {copiedId === image.id ? 'Style Copied!' : 'Use This Style'}
                        </button>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onToggleFavorite(image.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                                    image.favorited 
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                }`}
                            >
                                <Heart size={14} className={image.favorited ? 'fill-current' : ''} />
                                {image.favorited ? 'Saved' : 'Save'}
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors">
                                <Download size={14} />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
