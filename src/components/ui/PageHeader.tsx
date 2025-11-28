'use client';

import React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
    badge?: {
        label: string;
        variant?: 'default' | 'success' | 'warning' | 'danger';
    };
}

export default function PageHeader({
    title,
    description,
    icon,
    breadcrumbs,
    actions,
    badge
}: PageHeaderProps) {
    const badgeColors = {
        default: 'bg-white/10 text-gray-300',
        success: 'bg-green-500/10 text-green-400',
        warning: 'bg-yellow-500/10 text-yellow-400',
        danger: 'bg-red-500/10 text-red-400'
    };

    return (
        <div className="mb-6">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm mb-3">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <ChevronRight size={14} className="text-gray-600" />}
                            {crumb.href ? (
                                <Link 
                                    href={crumb.href}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-400">{crumb.label}</span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {title}
                            </h1>
                            {badge && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[badge.variant || 'default']}`}>
                                    {badge.label}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-gray-500 mt-1 text-sm">{description}</p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
