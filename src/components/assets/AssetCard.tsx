'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

interface AssetCardProps {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function AssetCard({
    title,
    subtitle,
    imageUrl,
    onEdit,
    onDelete
}: AssetCardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="group relative rounded-xl overflow-hidden bg-[#121212] border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
            {/* Image Container */}
            <div className="aspect-[4/3] w-full relative bg-white/5 overflow-hidden">
                {imageUrl && !hasError ? (
                    <>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
                                <ImageIcon className="text-white/20" size={24} />
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt={title}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setHasError(true);
                            }}
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <ImageIcon className="text-white/20" size={32} />
                    </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all hover:scale-110"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2.5 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all hover:scale-110"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 bg-gradient-to-b from-transparent to-black/50">
                <h3 className="font-medium text-white/90 truncate group-hover:text-yellow-400 transition-colors">{title}</h3>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
