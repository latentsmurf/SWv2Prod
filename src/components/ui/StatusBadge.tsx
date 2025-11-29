'use client';

import React from 'react';
import { 
    CheckCircle, XCircle, Clock, AlertCircle, Loader2, 
    FileText, RefreshCw, Ban, Pause, Play 
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type BadgeVariant = 
    | 'success' 
    | 'error' 
    | 'warning' 
    | 'info' 
    | 'pending' 
    | 'draft' 
    | 'processing' 
    | 'cancelled'
    | 'paused'
    | 'active';

interface StatusBadgeProps {
    /** Status variant determines color and icon */
    status: BadgeVariant | string;
    /** Custom label (defaults to capitalized status) */
    label?: string;
    /** Show icon before label */
    showIcon?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Custom class names */
    className?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<string, { 
    bg: string; 
    text: string; 
    icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
    // Standard variants
    success: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
    error: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: AlertCircle },
    info: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: AlertCircle },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
    draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: FileText },
    processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Loader2 },
    cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Ban },
    paused: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: Pause },
    active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: Play },
    
    // Email/Campaign specific
    sent: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
    scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
    sending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: RefreshCw },
    
    // Subscriber specific
    unsubscribed: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: XCircle },
    bounced: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    
    // Production specific
    'pre-production': { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: FileText },
    production: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Play },
    'post-production': { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: RefreshCw },
    completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
    
    // Shot specific
    queued: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Clock },
    generating: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Loader2 },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    approved: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
    
    // Blog specific
    published: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
};

const SIZE_CLASSES = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
};

const ICON_SIZES = {
    sm: 10,
    md: 12,
    lg: 14,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function StatusBadge({ 
    status, 
    label, 
    showIcon = true, 
    size = 'md',
    className = '' 
}: StatusBadgeProps) {
    const config = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.info;
    const Icon = config.icon;
    const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
    const isAnimated = status === 'processing' || status === 'generating' || status === 'sending';

    return (
        <span 
            className={`
                inline-flex items-center rounded font-medium
                ${config.bg} ${config.text}
                ${SIZE_CLASSES[size]}
                ${className}
            `}
        >
            {showIcon && (
                <Icon 
                    size={ICON_SIZES[size]} 
                    className={isAnimated ? 'animate-spin' : ''} 
                />
            )}
            <span className="capitalize">{displayLabel}</span>
        </span>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { STATUS_CONFIG, type BadgeVariant, type StatusBadgeProps };
