'use client';

import React from 'react';
import { Lock, Crown, Sparkles, Zap } from 'lucide-react';
import { useSubscription, useFeatureAccess } from '@/contexts/SubscriptionContext';
import { getPlanInfo } from '@/config/featurePermissions';

// ============================================================================
// FEATURE GATE COMPONENT
// Wraps content and shows upgrade prompt if user doesn't have access
// ============================================================================

interface FeatureGateProps {
    featureId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    mode?: 'hide' | 'disable' | 'blur' | 'overlay' | 'inline';
    className?: string;
}

export function FeatureGate({ 
    featureId, 
    children, 
    fallback,
    mode = 'overlay',
    className = ''
}: FeatureGateProps) {
    const { hasAccess, blockedReason, requiredPlan, requestUpgrade } = useFeatureAccess(featureId);
    
    // If user has access, render children normally
    if (hasAccess) {
        return <>{children}</>;
    }

    const planInfo = requiredPlan ? getPlanInfo(requiredPlan) : null;
    const planName = planInfo?.name || 'Pro';
    const planColor = planInfo?.color || '#3b82f6';

    // Different display modes for locked features
    switch (mode) {
        // Completely hide the feature
        case 'hide':
            return <>{fallback}</> || null;
        
        // Show but disable interaction
        case 'disable':
            return (
                <div 
                    className={`opacity-50 pointer-events-none select-none ${className}`} 
                    title={blockedReason || 'Feature locked'}
                    aria-disabled="true"
                >
                    {children}
                </div>
            );
        
        // Blur the content with upgrade CTA
        case 'blur':
            return (
                <div className={`relative ${className}`}>
                    <div className="blur-sm pointer-events-none select-none">
                        {children}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <button 
                            onClick={requestUpgrade}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                        >
                            <Crown size={18} />
                            Upgrade to {planName}
                        </button>
                    </div>
                </div>
            );
        
        // Show inline upgrade badge
        case 'inline':
            return (
                <div className={`relative group ${className}`}>
                    {children}
                    <button
                        onClick={requestUpgrade}
                        className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full shadow-lg transition-transform hover:scale-110"
                        style={{ backgroundColor: planColor, color: '#000' }}
                    >
                        <Lock size={10} />
                        {planName}
                    </button>
                </div>
            );
        
        // Overlay on hover (default)
        case 'overlay':
        default:
            return (
                <div className={`relative group cursor-pointer ${className}`} onClick={requestUpgrade}>
                    <div className="transition-all group-hover:opacity-30">
                        {children}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col items-center gap-2 p-4 bg-black/80 backdrop-blur-sm rounded-xl border border-white/10">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${planColor}20` }}
                            >
                                <Lock size={20} style={{ color: planColor }} />
                            </div>
                            <p className="text-sm text-white font-medium text-center max-w-[200px]">
                                {blockedReason}
                            </p>
                            <button 
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-colors"
                                style={{ backgroundColor: planColor, color: '#000' }}
                            >
                                <Zap size={14} />
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            );
    }
}

// ============================================================================
// PRO BADGE COMPONENT
// Shows a badge indicating feature requires upgrade
// ============================================================================

interface ProBadgeProps {
    featureId: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export function ProBadge({ featureId, size = 'sm', showLabel = true }: ProBadgeProps) {
    const { hasAccess, requiredPlan, requestUpgrade } = useFeatureAccess(featureId);
    
    if (hasAccess) return null;
    
    const planInfo = requiredPlan ? getPlanInfo(requiredPlan) : null;
    const planName = planInfo?.name || 'Pro';
    const planColor = planInfo?.color || '#3b82f6';
    
    const sizes = {
        sm: { badge: 'px-1.5 py-0.5 text-[9px]', icon: 8 },
        md: { badge: 'px-2 py-1 text-[10px]', icon: 10 },
        lg: { badge: 'px-2.5 py-1 text-xs', icon: 12 },
    };
    
    return (
        <button
            onClick={(e) => { e.stopPropagation(); requestUpgrade(); }}
            className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide rounded-full hover:scale-105 transition-transform ${sizes[size].badge}`}
            style={{ backgroundColor: `${planColor}20`, color: planColor }}
        >
            <Crown size={sizes[size].icon} />
            {showLabel && planName}
        </button>
    );
}

// ============================================================================
// LOCKED OVERLAY COMPONENT
// A simple overlay for locked content
// ============================================================================

interface LockedOverlayProps {
    featureId: string;
    message?: string;
}

export function LockedOverlay({ featureId, message }: LockedOverlayProps) {
    const { blockedReason, requiredPlan, requestUpgrade } = useFeatureAccess(featureId);
    const planInfo = requiredPlan ? getPlanInfo(requiredPlan) : null;
    
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-6 max-w-sm text-center">
                <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${planInfo?.color || '#3b82f6'}15` }}
                >
                    <Lock size={28} style={{ color: planInfo?.color || '#3b82f6' }} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                        {planInfo?.name || 'Pro'} Feature
                    </h3>
                    <p className="text-sm text-gray-400">
                        {message || blockedReason}
                    </p>
                </div>
                <button
                    onClick={requestUpgrade}
                    className="flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all hover:scale-105"
                    style={{ 
                        background: `linear-gradient(135deg, ${planInfo?.color || '#3b82f6'}, ${planInfo?.color || '#3b82f6'}dd)`,
                        color: '#000'
                    }}
                >
                    <Sparkles size={18} />
                    Upgrade to {planInfo?.name || 'Pro'}
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// FEATURE CHECK HOC
// Higher-order component for class components or complex scenarios
// ============================================================================

export function withFeatureAccess<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    featureId: string,
    mode: FeatureGateProps['mode'] = 'overlay'
) {
    return function WithFeatureAccessComponent(props: P) {
        return (
            <FeatureGate featureId={featureId} mode={mode}>
                <WrappedComponent {...props} />
            </FeatureGate>
        );
    };
}
