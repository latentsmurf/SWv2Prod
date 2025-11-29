'use client';

import React, { ReactNode } from 'react';
import { X, Edit, Trash2, ExternalLink } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    
    // Header
    title: string;
    subtitle?: string;
    badge?: { label: string; color: string };
    status?: { label: string; color: string };
    
    // Image
    image?: string;
    imagePlaceholder?: ReactNode;
    
    // Content sections
    sections: {
        title: string;
        items: { label: string; value: string | number | ReactNode }[];
    }[];
    
    // Actions
    onEdit?: () => void;
    onDelete?: () => void;
    customActions?: ReactNode;
    
    // Width
    size?: 'md' | 'lg' | 'xl';
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DetailModal({
    isOpen,
    onClose,
    title,
    subtitle,
    badge,
    status,
    image,
    imagePlaceholder,
    sections,
    onEdit,
    onDelete,
    customActions,
    size = 'lg',
}: DetailModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className={`w-full ${sizeClasses[size]} bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            {/* Image thumbnail */}
                            {(image || imagePlaceholder) && (
                                <div className="w-20 h-20 rounded-xl bg-black/50 overflow-hidden flex-shrink-0">
                                    {image ? (
                                        <img src={image} alt={title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            {imagePlaceholder}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-white">{title}</h2>
                                    {badge && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    )}
                                </div>
                                {subtitle && (
                                    <p className="text-gray-400">{subtitle}</p>
                                )}
                                {status && (
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                        {status.label}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                {section.title}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {section.items.map((item, itemIndex) => (
                                    <div key={itemIndex}>
                                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                                        <div className="text-white">
                                            {typeof item.value === 'string' || typeof item.value === 'number' 
                                                ? item.value || '-'
                                                : item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer actions */}
                {(onEdit || onDelete || customActions) && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {customActions}
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium text-sm transition-colors"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
