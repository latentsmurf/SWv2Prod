'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Crown, Zap, Building2, Sparkles } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PLANS, PlanTier } from '@/config/featurePermissions';

// ============================================================================
// PLAN SELECTOR (for demo/testing)
// Allows switching between plans to test feature gating
// ============================================================================

interface PlanSelectorProps {
    variant?: 'dropdown' | 'pills' | 'minimal';
    showCredits?: boolean;
}

export default function PlanSelector({ variant = 'dropdown', showCredits = true }: PlanSelectorProps) {
    const { subscription, currentPlan, setDemoPlan, creditsRemaining, creditsPercentUsed } = useSubscription();
    const [isOpen, setIsOpen] = useState(false);
    
    const planIcons: Record<PlanTier, React.ReactNode> = {
        free: <Sparkles size={14} />,
        pro: <Zap size={14} />,
        studio: <Crown size={14} />,
        enterprise: <Building2 size={14} />,
    };
    
    if (variant === 'pills') {
        return (
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                {PLANS.map((plan) => (
                    <button
                        key={plan.id}
                        onClick={() => setDemoPlan(plan.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            subscription.plan === plan.id 
                                ? 'bg-white/10 text-white' 
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        {planIcons[plan.id]}
                        {plan.name}
                    </button>
                ))}
            </div>
        );
    }
    
    if (variant === 'minimal') {
        return (
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-lg transition-colors"
                style={{ backgroundColor: `${currentPlan.color}20`, color: currentPlan.color }}
            >
                {planIcons[subscription.plan]}
                {currentPlan.name}
                <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute top-full left-0 mt-1 w-32 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl z-50">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={(e) => { e.stopPropagation(); setDemoPlan(plan.id); setIsOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 ${
                                        subscription.plan === plan.id ? 'bg-white/5' : ''
                                    }`}
                                >
                                    <span style={{ color: plan.color }}>{planIcons[plan.id]}</span>
                                    <span className="text-white">{plan.name}</span>
                                    {subscription.plan === plan.id && <Check size={12} className="ml-auto text-green-400" />}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </button>
        );
    }
    
    // Default dropdown variant
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
            >
                <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${currentPlan.color}20` }}
                >
                    <span>{currentPlan.icon}</span>
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{currentPlan.name}</span>
                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {showCredits && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all"
                                    style={{ 
                                        width: `${creditsPercentUsed}%`,
                                        backgroundColor: creditsPercentUsed > 80 ? '#ef4444' : currentPlan.color 
                                    }}
                                />
                            </div>
                            <span className="text-[10px] text-gray-500">
                                {creditsRemaining} credits
                            </span>
                        </div>
                    )}
                </div>
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                        <div className="p-2 border-b border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider px-2">
                                Demo: Switch Plan
                            </p>
                        </div>
                        <div className="p-2">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => { setDemoPlan(plan.id); setIsOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                        subscription.plan === plan.id 
                                            ? 'bg-white/10' 
                                            : 'hover:bg-white/5'
                                    }`}
                                >
                                    <div 
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${plan.color}20` }}
                                    >
                                        <span>{plan.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{plan.name}</span>
                                            {plan.price > 0 && (
                                                <span className="text-xs text-gray-500">${plan.price}/mo</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 truncate">{plan.tagline}</p>
                                    </div>
                                    {subscription.plan === plan.id && (
                                        <Check size={16} className="text-green-400 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
