'use client';

import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface Stat {
    label: string;
    value: string | number;
    icon?: ReactNode;
    change?: {
        value: number;
        type: 'increase' | 'decrease' | 'neutral';
        period?: string;
    };
    color?: string;
    description?: string;
}

export interface StatsGridProps {
    stats: Stat[];
    columns?: 2 | 3 | 4 | 5 | 6;
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StatsGrid({ stats, columns = 4, className = '' }: StatsGridProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ label, value, icon, change, color, description }: Stat) {
    const getTrendIcon = () => {
        if (!change) return null;
        
        switch (change.type) {
            case 'increase':
                return <TrendingUp size={14} className="text-green-400" />;
            case 'decrease':
                return <TrendingDown size={14} className="text-red-400" />;
            default:
                return <Minus size={14} className="text-gray-400" />;
        }
    };

    const getTrendColor = () => {
        if (!change) return '';
        
        switch (change.type) {
            case 'increase':
                return 'text-green-400';
            case 'decrease':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">{label}</div>
                    <div className={`text-2xl font-bold ${color || 'text-white'}`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    {description && (
                        <div className="text-xs text-gray-500 mt-1">{description}</div>
                    )}
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                        {icon}
                    </div>
                )}
            </div>
            
            {change && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
                    {change.period && <span className="text-gray-500">vs {change.period}</span>}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MINI STATS ROW
// ============================================================================

export interface MiniStat {
    label: string;
    value: string | number;
    color?: string;
}

export function MiniStatsRow({ stats }: { stats: MiniStat[] }) {
    return (
        <div className="flex items-center gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">{stat.label}:</span>
                    <span className={`font-medium ${stat.color || 'text-white'}`}>
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
