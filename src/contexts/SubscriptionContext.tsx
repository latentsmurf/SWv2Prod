'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    PlanTier, 
    PlanInfo,
    canAccessFeature, 
    getRequiredPlan,
    getPlanInfo,
    getNextPlan,
    getFeaturesForPlan,
    getUpgradeFeatures,
    PLANS,
    FEATURE_PERMISSIONS
} from '@/config/featurePermissions';

// ============================================================================
// TYPES
// ============================================================================

interface UserSubscription {
    plan: PlanTier;
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    credits: number;
    creditsUsed: number;
    creditsResetDate: Date;
    trialEndsAt?: Date;
    cancelAt?: Date;
}

interface SubscriptionContextType {
    // Subscription state
    subscription: UserSubscription;
    isLoading: boolean;
    
    // Plan info helpers
    currentPlan: PlanInfo;
    nextPlan: PlanInfo | null;
    
    // Feature access
    canAccess: (featureId: string) => boolean;
    getBlockedReason: (featureId: string) => string | null;
    getRequiredPlanForFeature: (featureId: string) => PlanTier | null;
    
    // Credit helpers
    hasCredits: (amount?: number) => boolean;
    useCredits: (amount: number) => boolean;
    creditsRemaining: number;
    creditsPercentUsed: number;
    
    // Upgrade modal
    showUpgradeModal: (featureId?: string) => void;
    hideUpgradeModal: () => void;
    upgradeModalOpen: boolean;
    upgradeModalFeature: string | null;
    
    // Actions
    refreshSubscription: () => Promise<void>;
    
    // For demo/testing
    setDemoPlan: (plan: PlanTier) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    // Subscription state
    const [subscription, setSubscription] = useState<UserSubscription>({
        plan: 'free',
        status: 'active',
        credits: 50,
        creditsUsed: 12,
        creditsResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    const [isLoading, setIsLoading] = useState(true);
    
    // Upgrade modal state
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeModalFeature, setUpgradeModalFeature] = useState<string | null>(null);

    // Load subscription from localStorage or API
    useEffect(() => {
        const loadSubscription = async () => {
            setIsLoading(true);
            try {
                // Check localStorage for demo plan
                const savedPlan = localStorage.getItem('sw_demo_plan');
                if (savedPlan && ['free', 'pro', 'studio', 'enterprise'].includes(savedPlan)) {
                    const planInfo = getPlanInfo(savedPlan as PlanTier);
                    setSubscription(prev => ({
                        ...prev,
                        plan: savedPlan as PlanTier,
                        credits: planInfo?.creditsPerMonth || 50,
                        creditsUsed: 0,
                    }));
                }
                
                // In production, you would fetch from your API:
                // const res = await fetch('/api/account/subscription');
                // const data = await res.json();
                // setSubscription(data);
            } catch (error) {
                console.error('Failed to load subscription:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSubscription();
    }, []);

    // Plan info helpers
    const currentPlan = getPlanInfo(subscription.plan) || PLANS[0];
    const nextPlan = getNextPlan(subscription.plan);

    // Feature access
    const canAccess = useCallback((featureId: string): boolean => {
        return canAccessFeature(subscription.plan, featureId);
    }, [subscription.plan]);

    const getBlockedReason = useCallback((featureId: string): string | null => {
        if (canAccess(featureId)) return null;
        const requiredPlan = getRequiredPlan(featureId);
        if (!requiredPlan) return null;
        const planInfo = getPlanInfo(requiredPlan);
        const feature = FEATURE_PERMISSIONS.find(f => f.id === featureId);
        return `Upgrade to ${planInfo?.name || requiredPlan} to unlock ${feature?.name || 'this feature'}`;
    }, [canAccess]);

    const getRequiredPlanForFeature = useCallback((featureId: string): PlanTier | null => {
        return getRequiredPlan(featureId);
    }, []);

    // Credit helpers
    const creditsRemaining = subscription.credits - subscription.creditsUsed;
    const creditsPercentUsed = subscription.credits > 0 
        ? Math.round((subscription.creditsUsed / subscription.credits) * 100) 
        : 0;

    const hasCredits = useCallback((amount: number = 1): boolean => {
        return creditsRemaining >= amount;
    }, [creditsRemaining]);

    const useCredits = useCallback((amount: number): boolean => {
        if (!hasCredits(amount)) return false;
        setSubscription(prev => ({
            ...prev,
            creditsUsed: prev.creditsUsed + amount,
        }));
        return true;
    }, [hasCredits]);

    // Upgrade modal
    const showUpgradeModal = useCallback((featureId?: string) => {
        setUpgradeModalFeature(featureId || null);
        setUpgradeModalOpen(true);
    }, []);

    const hideUpgradeModal = useCallback(() => {
        setUpgradeModalOpen(false);
        setUpgradeModalFeature(null);
    }, []);

    // Refresh subscription
    const refreshSubscription = useCallback(async () => {
        setIsLoading(true);
        try {
            // In production: fetch from API
            // const res = await fetch('/api/account/subscription');
            // const data = await res.json();
            // setSubscription(data);
        } catch (error) {
            console.error('Failed to refresh subscription:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Demo plan setter (for testing different tiers)
    const setDemoPlan = useCallback((plan: PlanTier) => {
        localStorage.setItem('sw_demo_plan', plan);
        const planInfo = getPlanInfo(plan);
        setSubscription(prev => ({
            ...prev,
            plan,
            credits: planInfo?.creditsPerMonth || 50,
            creditsUsed: 0,
        }));
    }, []);

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            isLoading,
            currentPlan,
            nextPlan,
            canAccess,
            getBlockedReason,
            getRequiredPlanForFeature,
            hasCredits,
            useCredits,
            creditsRemaining,
            creditsPercentUsed,
            showUpgradeModal,
            hideUpgradeModal,
            upgradeModalOpen,
            upgradeModalFeature,
            refreshSubscription,
            setDemoPlan,
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}

/**
 * Hook to check access to a specific feature
 */
export function useFeatureAccess(featureId: string) {
    const { canAccess, getBlockedReason, showUpgradeModal, getRequiredPlanForFeature } = useSubscription();
    
    return {
        hasAccess: canAccess(featureId),
        blockedReason: getBlockedReason(featureId),
        requiredPlan: getRequiredPlanForFeature(featureId),
        requestUpgrade: () => showUpgradeModal(featureId),
    };
}

/**
 * Hook for credit management
 */
export function useCredits() {
    const { 
        subscription, 
        hasCredits, 
        useCredits, 
        creditsRemaining, 
        creditsPercentUsed,
        showUpgradeModal 
    } = useSubscription();
    
    return {
        total: subscription.credits,
        used: subscription.creditsUsed,
        remaining: creditsRemaining,
        percentUsed: creditsPercentUsed,
        hasEnough: hasCredits,
        consume: useCredits,
        requestMore: () => showUpgradeModal(),
        resetDate: subscription.creditsResetDate,
    };
}
