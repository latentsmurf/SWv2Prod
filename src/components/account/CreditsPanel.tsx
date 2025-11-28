'use client';

import React, { useState, useEffect } from 'react';
import {
    Sparkles, TrendingUp, TrendingDown, Clock, ArrowUpRight,
    CreditCard, Package, Loader2, ChevronRight, Zap, Image,
    Video, Music, Mic, RefreshCw, AlertTriangle
} from 'lucide-react';

interface CreditBalance {
    total: number;
    used: number;
    remaining: number;
    plan: 'free' | 'pro' | 'studio' | 'enterprise';
    renews_at?: string;
}

interface CreditTransaction {
    id: string;
    type: 'usage' | 'purchase' | 'bonus' | 'refund';
    amount: number;
    description: string;
    category: 'image' | 'video' | 'music' | 'voiceover' | 'text' | 'purchase';
    project_name?: string;
    created_at: string;
}

interface CreditCost {
    type: string;
    label: string;
    cost: number;
    icon: React.ElementType;
    color: string;
}

const CREDIT_COSTS: CreditCost[] = [
    { type: 'image', label: 'Image Generation', cost: 1, icon: Image, color: 'text-blue-400' },
    { type: 'video', label: 'Video Generation', cost: 10, icon: Video, color: 'text-purple-400' },
    { type: 'music', label: 'Music Generation', cost: 5, icon: Music, color: 'text-green-400' },
    { type: 'voiceover', label: 'Voice-Over', cost: 2, icon: Mic, color: 'text-yellow-400' },
];

const PLANS = [
    { id: 'free', name: 'Free', credits: 50, price: 0, features: ['50 credits/month', 'Basic support'] },
    { id: 'pro', name: 'Pro', credits: 500, price: 29, features: ['500 credits/month', 'Priority support', 'HD exports'] },
    { id: 'studio', name: 'Studio', credits: 2000, price: 99, features: ['2000 credits/month', '24/7 support', '4K exports', 'Team seats'] },
    { id: 'enterprise', name: 'Enterprise', credits: -1, price: -1, features: ['Unlimited credits', 'Dedicated support', 'Custom integrations'] },
];

interface CreditsPanelProps {
    compact?: boolean;
    onUpgrade?: () => void;
}

export default function CreditsPanel({ compact = false, onUpgrade }: CreditsPanelProps) {
    const [balance, setBalance] = useState<CreditBalance | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPricing, setShowPricing] = useState(false);

    // Fetch credit balance
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/account/credits');
                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance);
                    setTransactions(data.transactions || []);
                }
            } catch (error) {
                console.error('Error fetching credits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCredits();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getCategoryIcon = (category: string) => {
        const cost = CREDIT_COSTS.find(c => c.type === category);
        return cost?.icon || Sparkles;
    };

    const getCategoryColor = (category: string) => {
        const cost = CREDIT_COSTS.find(c => c.type === category);
        return cost?.color || 'text-gray-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-yellow-500" size={24} />
            </div>
        );
    }

    // Compact display for header/sidebar
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 rounded-lg">
                    <Sparkles size={14} className="text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">
                        {balance?.remaining || 0}
                    </span>
                </div>
                {balance && balance.remaining < 20 && (
                    <button
                        onClick={onUpgrade}
                        className="text-xs text-yellow-500 hover:text-yellow-400"
                    >
                        Add credits
                    </button>
                )}
            </div>
        );
    }

    const usagePercent = balance ? (balance.used / balance.total) * 100 : 0;
    const isLow = balance && balance.remaining < balance.total * 0.2;

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-yellow-500" />
                            Credits
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 capitalize">
                            {balance?.plan || 'Free'} Plan
                        </p>
                    </div>

                    <button
                        onClick={() => setShowPricing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                    >
                        <Zap size={16} />
                        Upgrade
                    </button>
                </div>
            </div>

            {/* Balance Card */}
            <div className="p-6">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-sm text-yellow-500/80">Available Credits</p>
                            <p className="text-4xl font-bold text-white mt-1">
                                {balance?.remaining.toLocaleString() || 0}
                            </p>
                        </div>
                        {isLow && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-lg">
                                <AlertTriangle size={14} className="text-red-400" />
                                <span className="text-xs text-red-400">Low balance</span>
                            </div>
                        )}
                    </div>

                    {/* Usage Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">
                                {balance?.used.toLocaleString() || 0} used
                            </span>
                            <span className="text-gray-400">
                                {balance?.total.toLocaleString() || 0} total
                            </span>
                        </div>
                        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all rounded-full ${
                                    isLow ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    </div>

                    {balance?.renews_at && (
                        <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                            <RefreshCw size={12} />
                            Renews {formatDate(balance.renews_at)}
                        </p>
                    )}
                </div>
            </div>

            {/* Credit Costs */}
            <div className="px-6 pb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Credit Costs</h3>
                <div className="grid grid-cols-2 gap-2">
                    {CREDIT_COSTS.map((cost) => (
                        <div
                            key={cost.type}
                            className="flex items-center gap-3 p-3 bg-[#121212] border border-white/5 rounded-lg"
                        >
                            <div className={`p-2 bg-white/5 rounded-lg ${cost.color}`}>
                                <cost.icon size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">{cost.label}</p>
                                <p className="text-sm font-medium text-white">
                                    {cost.cost} credit{cost.cost !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
                
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 text-sm">
                        No transactions yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.map((tx) => {
                            const Icon = getCategoryIcon(tx.category);
                            const isDebit = tx.type === 'usage';
                            
                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center gap-3 p-3 bg-[#121212] border border-white/5 rounded-lg"
                                >
                                    <div className={`p-2 bg-white/5 rounded-lg ${getCategoryColor(tx.category)}`}>
                                        <Icon size={16} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {tx.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {tx.project_name && `${tx.project_name} • `}
                                            {formatDate(tx.created_at)}
                                        </p>
                                    </div>

                                    <p className={`text-sm font-medium ${
                                        isDebit ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                        {isDebit ? '-' : '+'}{Math.abs(tx.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pricing Modal */}
            {showPricing && (
                <PricingModal onClose={() => setShowPricing(false)} currentPlan={balance?.plan} />
            )}
        </div>
    );
}

// Pricing Modal
function PricingModal({ 
    onClose, 
    currentPlan 
}: { 
    onClose: () => void;
    currentPlan?: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">Choose Your Plan</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Unlock more credits and features
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 grid grid-cols-4 gap-4">
                    {PLANS.map((plan) => {
                        const isCurrent = currentPlan === plan.id;
                        const isEnterprise = plan.id === 'enterprise';
                        
                        return (
                            <div
                                key={plan.id}
                                className={`rounded-xl p-5 border-2 transition-all ${
                                    isCurrent
                                        ? 'border-yellow-500 bg-yellow-500/5'
                                        : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                <h4 className="text-lg font-bold text-white mb-1">
                                    {plan.name}
                                </h4>
                                
                                <div className="mb-4">
                                    {isEnterprise ? (
                                        <p className="text-2xl font-bold text-white">Custom</p>
                                    ) : (
                                        <p className="text-2xl font-bold text-white">
                                            ${plan.price}
                                            <span className="text-sm font-normal text-gray-500">/mo</span>
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                        isCurrent
                                            ? 'bg-white/10 text-gray-400 cursor-default'
                                            : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                                    }`}
                                    disabled={isCurrent}
                                >
                                    {isCurrent ? 'Current Plan' : isEnterprise ? 'Contact Sales' : 'Upgrade'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Export compact version for use in headers
export function CreditsDisplay({ credits, onUpgrade }: { credits: number; onUpgrade?: () => void }) {
    const isLow = credits < 20;
    
    return (
        <button
            onClick={onUpgrade}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                isLow 
                    ? 'bg-red-500/10 hover:bg-red-500/20' 
                    : 'bg-yellow-500/10 hover:bg-yellow-500/20'
            }`}
        >
            <Sparkles size={14} className={isLow ? 'text-red-400' : 'text-yellow-500'} />
            <span className={`text-sm font-medium ${isLow ? 'text-red-400' : 'text-yellow-500'}`}>
                {credits}
            </span>
            {isLow && (
                <span className="text-xs text-red-400">Low</span>
            )}
        </button>
    );
}
