'use client';

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink' | 'secondary' | 'destructive' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-white/10 text-gray-300 border-white/10',
    secondary: 'bg-white/5 text-gray-400 border-white/5',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    destructive: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    outline: 'bg-transparent text-gray-400 border-white/10'
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
};

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = ''
}: BadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${
                    variant === 'success' ? 'bg-green-400' :
                    variant === 'warning' ? 'bg-yellow-400' :
                    variant === 'error' || variant === 'destructive' ? 'bg-red-400' :
                    variant === 'info' ? 'bg-blue-400' :
                    variant === 'purple' ? 'bg-purple-400' :
                    variant === 'pink' ? 'bg-pink-400' :
                    'bg-gray-400'
                }`} />
            )}
            {children}
        </span>
    );
}

// Also export as default for backwards compatibility
export default Badge;

// Status badge presets
export function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        draft: { variant: 'default', label: 'Draft' },
        pending: { variant: 'warning', label: 'Pending' },
        approved: { variant: 'success', label: 'Approved' },
        rejected: { variant: 'error', label: 'Rejected' },
        in_progress: { variant: 'info', label: 'In Progress' },
        completed: { variant: 'success', label: 'Completed' },
        processing: { variant: 'purple', label: 'Processing' },
        queued: { variant: 'default', label: 'Queued' },
        published: { variant: 'success', label: 'Published' },
        archived: { variant: 'default', label: 'Archived' }
    };

    const config = statusConfig[status.toLowerCase()] || { variant: 'default', label: status };
    
    return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
