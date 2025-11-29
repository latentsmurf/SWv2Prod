'use client';

import React, { useState } from 'react';
import { 
    X, Check, Crown, Zap, Sparkles, ArrowRight, 
    CreditCard, Shield, Clock, Star, Lock
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
    PLANS, 
    PlanTier, 
    getPlanInfo, 
    getUpgradeFeatures,
    FEATURE_PERMISSIONS,
    PLAN_HIERARCHY
} from '@/config/featurePermissions';

// ============================================================================
// UPGRADE MODAL
// Shows pricing plans and upgrade options
// ============================================================================

export default function UpgradeModal() {
    const { 
        upgradeModalOpen, 
        hideUpgradeModal, 
        upgradeModalFeature,
        subscription,
        currentPlan,
        setDemoPlan
    } = useSubscription();
    
    const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    
    if (!upgradeModalOpen) return null;
    
    // Get the feature that triggered the modal
    const triggerFeature = upgradeModalFeature 
        ? FEATURE_PERMISSIONS.find(f => f.id === upgradeModalFeature) 
        : null;
    
    // Get recommended plan based on feature
    const recommendedPlan = triggerFeature 
        ? triggerFeature.requiredPlan 
        : subscription.plan === 'free' ? 'pro' : 'studio';
    
    // Filter plans to show only upgrades
    const availablePlans = PLANS.filter(p => 
        PLAN_HIERARCHY[p.id] > PLAN_HIERARCHY[subscription.plan]
    );
    
    // Calculate yearly discount
    const getYearlyPrice = (monthlyPrice: number) => Math.round(monthlyPrice * 10); // 2 months free
    
    const handleUpgrade = (planId: PlanTier) => {
        // In production, this would redirect to Stripe checkout
        // For demo purposes, we'll just set the plan
        setDemoPlan(planId);
        hideUpgradeModal();
    };
    
    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
            onClick={hideUpgradeModal}
        >
            <div 
                className="w-full max-w-4xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-6 py-8 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10 border-b border-gray-200 dark:border-white/5">
                    <button 
                        onClick={hideUpgradeModal}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-4">
                            <Sparkles size={14} />
                            Unlock More Power
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {triggerFeature 
                                ? `Unlock ${triggerFeature.name}` 
                                : 'Upgrade Your Plan'
                            }
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            {triggerFeature 
                                ? triggerFeature.description
                                : 'Get more credits, features, and capabilities with a premium plan.'
                            }
                        </p>
                    </div>
                    
                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                billingPeriod === 'monthly' 
                                    ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' 
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                                billingPeriod === 'yearly' 
                                    ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' 
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Yearly
                            <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded">
                                -17%
                            </span>
                        </button>
                    </div>
                </div>
                
                {/* Plans Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {availablePlans.map((plan) => {
                            const isRecommended = plan.id === recommendedPlan;
                            const price = billingPeriod === 'yearly' 
                                ? getYearlyPrice(plan.price) 
                                : plan.price;
                            const upgradeFeatures = getUpgradeFeatures(subscription.plan, plan.id);
                            
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative p-5 rounded-xl border transition-all ${
                                        isRecommended 
                                            ? 'border-purple-500/50 bg-purple-500/5 ring-1 ring-purple-500/20' 
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-gray-50 dark:bg-white/[0.02]'
                                    }`}
                                >
                                    {isRecommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                                            RECOMMENDED
                                        </div>
                                    )}
                                    
                                    {/* Plan Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div 
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                            style={{ backgroundColor: `${plan.color}20` }}
                                        >
                                            {plan.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                            <p className="text-xs text-gray-500">{plan.tagline}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Price */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">${price}</span>
                                            <span className="text-gray-500">/{billingPeriod === 'yearly' ? 'year' : 'mo'}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {plan.creditsPerMonth.toLocaleString()} credits/month
                                        </p>
                                    </div>
                                    
                                    {/* Features */}
                                    <div className="space-y-2 mb-6">
                                        {upgradeFeatures.slice(0, 5).map((feature) => (
                                            <div key={feature.id} className="flex items-start gap-2">
                                                <Check size={14} className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature.name}</span>
                                            </div>
                                        ))}
                                        {upgradeFeatures.length > 5 && (
                                            <p className="text-xs text-gray-500 pl-6">
                                                +{upgradeFeatures.length - 5} more features
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                            isRecommended 
                                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white' 
                                                : 'bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {plan.id === 'enterprise' ? (
                                            <>Contact Sales</>
                                        ) : (
                                            <>
                                                Upgrade to {plan.name}
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Shield size={16} />
                            Secure checkout
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <CreditCard size={16} />
                            Cancel anytime
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock size={16} />
                            Instant access
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
