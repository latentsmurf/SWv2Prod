'use client';

import React, { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface PageHeaderProps {
    title: string;
    description?: string;
    icon: ReactNode;
    iconGradient?: string;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PageHeader({
    title,
    description,
    icon,
    iconGradient = 'from-yellow-500 to-orange-500',
    actions,
    breadcrumbs,
}: PageHeaderProps) {
    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="text-gray-600">/</span>}
                            {crumb.href ? (
                                <a href={crumb.href} className="text-gray-400 hover:text-white transition-colors">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-gray-400">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center text-white shadow-lg`}>
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{title}</h1>
                        {description && (
                            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
                
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// ACTION BUTTON
// ============================================================================

export interface ActionButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    icon?: ReactNode;
    disabled?: boolean;
    loading?: boolean;
}

export function ActionButton({ 
    children, 
    onClick, 
    variant = 'secondary', 
    icon, 
    disabled = false,
    loading = false,
}: ActionButtonProps) {
    const variantStyles = {
        primary: 'bg-yellow-500 text-black hover:bg-yellow-400',
        secondary: 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10',
        ghost: 'text-gray-400 hover:text-white',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
        >
            {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : icon}
            {children}
        </button>
    );
}
