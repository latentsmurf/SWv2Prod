'use client';

import React from 'react';
import { LucideIcon, FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export default function EmptyState({
    icon: Icon = FolderOpen,
    title,
    description,
    action,
    secondaryAction,
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Icon size={28} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            {(action || secondaryAction) && (
                <div className="flex items-center gap-3">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                                action.variant === 'secondary'
                                    ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                            }`}
                        >
                            <Plus size={18} />
                            {action.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
