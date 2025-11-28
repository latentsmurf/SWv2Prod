'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-6">
                {icon}
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
                {title}
            </h3>
            
            <p className="text-gray-500 max-w-sm mb-6 text-sm leading-relaxed">
                {description}
            </p>
            
            <div className="flex items-center gap-3">
                {action && (
                    <button
                        onClick={action.onClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all hover:scale-105"
                    >
                        <Plus size={18} />
                        {action.label}
                    </button>
                )}
                
                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        {secondaryAction.label}
                    </button>
                )}
            </div>
        </div>
    );
}
