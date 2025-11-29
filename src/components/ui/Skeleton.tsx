'use client';

import React from 'react';

// ============================================================================
// BASE SKELETON
// ============================================================================

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'rounded';
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
    className = '', 
    variant = 'default',
    animation = 'pulse' 
}: SkeletonProps) {
    const baseClasses = 'bg-white/5';
    
    const variantClasses = {
        default: 'rounded',
        circular: 'rounded-full',
        rounded: 'rounded-xl'
    };
    
    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
        none: ''
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`} />
    );
}

// ============================================================================
// SKELETON PRESETS
// ============================================================================

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-[#121212] border border-white/5 rounded-xl p-4 ${className}`}>
            <Skeleton className="h-40 w-full rounded-lg mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    );
}

export function SkeletonShotCard() {
    return (
        <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTableRow() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded" />
        </div>
    );
}

export function SkeletonSceneCard() {
    return (
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
            <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>
    );
}

export function SkeletonEpisodeCard() {
    return (
        <div className="bg-[#121212] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded" />
            </div>
        </div>
    );
}

export function SkeletonProjectCard() {
    return (
        <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonTableRow key={i} />
            ))}
        </div>
    );
}

export function SkeletonGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6'
    };

    return (
        <div className={`grid ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-3'} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonShotCard key={i} />
            ))}
        </div>
    );
}

// ============================================================================
// SPECIFIC SKELETONS
// ============================================================================

export function SkeletonDashboard() {
    return (
        <div className="space-y-8 p-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-[#121212] border border-white/5 rounded-xl p-6">
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-2 w-24" />
                    </div>
                ))}
            </div>
            
            {/* Recent Projects */}
            <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <SkeletonProjectCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SkeletonTimeline() {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 p-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-24 rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
    );
}

export default Skeleton;
