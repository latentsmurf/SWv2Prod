'use client';

import React, { ReactNode } from 'react';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ItemCardProps {
    // Content
    title: string;
    subtitle?: string;
    image?: string;
    imagePlaceholder?: ReactNode;
    
    // Status/Badge
    status?: {
        label: string;
        color: string;
    };
    badge?: {
        label: string;
        color: string;
    };
    
    // Metadata
    metadata?: { label: string; value: string | number }[];
    tags?: string[];
    
    // Actions
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    
    // Custom
    footer?: ReactNode;
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ItemCard({
    title,
    subtitle,
    image,
    imagePlaceholder,
    status,
    badge,
    metadata,
    tags,
    onView,
    onEdit,
    onDelete,
    onClick,
    footer,
    className = '',
}: ItemCardProps) {
    return (
        <div 
            className={`group rounded-xl bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {/* Image/Header */}
            {(image || imagePlaceholder) && (
                <div className="relative aspect-[4/3] bg-black/50">
                    {image ? (
                        <img 
                            src={image} 
                            alt={title} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {imagePlaceholder}
                        </div>
                    )}
                    
                    {/* Status badge */}
                    {status && (
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                        </div>
                    )}
                    
                    {/* Type badge */}
                    {badge && (
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                            {badge.label}
                        </div>
                    )}
                    
                    {/* Hover actions */}
                    {(onView || onEdit || onDelete) && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {onView && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onView(); }}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                >
                                    <Eye size={18} className="text-white" />
                                </button>
                            )}
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                >
                                    <Edit size={18} className="text-white" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} className="text-red-400" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {/* Content */}
            <div className="p-4">
                <h3 className="font-medium text-white truncate">{title}</h3>
                {subtitle && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{subtitle}</p>
                )}
                
                {/* Metadata */}
                {metadata && metadata.length > 0 && (
                    <div className="mt-3 space-y-1">
                        {metadata.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{item.label}</span>
                                <span className="text-gray-400">{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, i) => (
                            <span 
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400"
                            >
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-[10px] text-gray-500">+{tags.length - 3}</span>
                        )}
                    </div>
                )}
                
                {/* Custom footer */}
                {footer}
            </div>
        </div>
    );
}

// ============================================================================
// LIST ITEM VARIANT
// ============================================================================

export function ItemListRow({
    title,
    subtitle,
    image,
    imagePlaceholder,
    status,
    badge,
    metadata,
    onView,
    onEdit,
    onDelete,
    onClick,
    className = '',
}: ItemCardProps) {
    return (
        <div 
            className={`flex items-center gap-4 p-3 rounded-lg bg-[#121212] border border-white/5 hover:border-purple-500/30 transition-all group ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {/* Thumbnail */}
            {(image || imagePlaceholder) && (
                <div className="w-16 h-16 rounded-lg bg-black/50 overflow-hidden flex-shrink-0">
                    {image ? (
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {imagePlaceholder}
                        </div>
                    )}
                </div>
            )}
            
            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white truncate">{title}</h3>
                    {badge && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                            {badge.label}
                        </span>
                    )}
                    {status && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            {status.label}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-sm text-gray-500 truncate">{subtitle}</p>
                )}
            </div>
            
            {/* Metadata */}
            {metadata && (
                <div className="hidden lg:flex items-center gap-6">
                    {metadata.slice(0, 3).map((item, i) => (
                        <div key={i} className="text-right">
                            <div className="text-xs text-gray-500">{item.label}</div>
                            <div className="text-sm text-gray-400">{item.value}</div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Actions */}
            {(onView || onEdit || onDelete) && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onView && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onView(); }}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                            <Eye size={16} className="text-gray-400" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                            <Edit size={16} className="text-gray-400" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors"
                        >
                            <Trash2 size={16} className="text-red-400" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
