'use client';

import React, { useState } from 'react';
import {
    Coins, Users, TrendingUp, TrendingDown, Search, Filter,
    Download, Plus, RefreshCw, ArrowUpRight, ArrowDownRight,
    CreditCard, Zap, Clock, AlertTriangle, CheckCircle, X,
    ChevronDown, MoreHorizontal, Eye, Edit2, Gift
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface CreditTransaction {
    id: string;
    user_id: string;
    user_email: string;
    type: 'purchase' | 'consumption' | 'refund' | 'bonus' | 'adjustment';
    amount: number;
    balance_after: number;
    description: string;
    metadata?: {
        project_id?: string;
        generation_type?: string;
        payment_id?: string;
    };
    created_at: Date;
}

interface CreditPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
    popular: boolean;
    active: boolean;
}

interface UserCredits {
    user_id: string;
    email: string;
    name: string;
    balance: number;
    total_purchased: number;
    total_consumed: number;
    plan: string;
    last_purchase: Date;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TRANSACTIONS: CreditTransaction[] = [
    { id: '1', user_id: 'u1', user_email: 'john@example.com', type: 'purchase', amount: 1000, balance_after: 1500, description: 'Purchased Pro Pack', created_at: new Date(Date.now() - 3600000) },
    { id: '2', user_id: 'u2', user_email: 'sarah@studio.com', type: 'consumption', amount: -50, balance_after: 450, description: 'Video generation (HD)', created_at: new Date(Date.now() - 7200000) },
    { id: '3', user_id: 'u3', user_email: 'mike@films.io', type: 'bonus', amount: 100, balance_after: 600, description: 'Referral bonus', created_at: new Date(Date.now() - 10800000) },
    { id: '4', user_id: 'u1', user_email: 'john@example.com', type: 'consumption', amount: -150, balance_after: 1350, description: 'Batch image generation (15 shots)', created_at: new Date(Date.now() - 14400000) },
    { id: '5', user_id: 'u4', user_email: 'emma@prod.co', type: 'refund', amount: 500, balance_after: 1000, description: 'Refund for failed generation', created_at: new Date(Date.now() - 18000000) },
    { id: '6', user_id: 'u5', user_email: 'alex@movies.net', type: 'purchase', amount: 5000, balance_after: 5200, description: 'Purchased Enterprise Pack', created_at: new Date(Date.now() - 21600000) },
    { id: '7', user_id: 'u2', user_email: 'sarah@studio.com', type: 'consumption', amount: -25, balance_after: 425, description: 'AI script analysis', created_at: new Date(Date.now() - 25200000) },
];

const MOCK_PLANS: CreditPlan[] = [
    { id: 'starter', name: 'Starter Pack', credits: 100, price: 9.99, popular: false, active: true },
    { id: 'pro', name: 'Pro Pack', credits: 1000, price: 79.99, popular: true, active: true },
    { id: 'studio', name: 'Studio Pack', credits: 5000, price: 299.99, popular: false, active: true },
    { id: 'enterprise', name: 'Enterprise Pack', credits: 25000, price: 999.99, popular: false, active: true },
];

const MOCK_TOP_USERS: UserCredits[] = [
    { user_id: 'u1', email: 'netflix@partner.com', name: 'Netflix Studios', balance: 125000, total_purchased: 500000, total_consumed: 375000, plan: 'Enterprise', last_purchase: new Date(Date.now() - 86400000) },
    { user_id: 'u2', email: 'paramount@studio.com', name: 'Paramount Digital', balance: 89000, total_purchased: 200000, total_consumed: 111000, plan: 'Enterprise', last_purchase: new Date(Date.now() - 172800000) },
    { user_id: 'u3', email: 'indie@films.io', name: 'Indie Films Co', balance: 45000, total_purchased: 100000, total_consumed: 55000, plan: 'Studio', last_purchase: new Date(Date.now() - 259200000) },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreditsPage() {
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
    const [plans, setPlans] = useState(MOCK_PLANS);
    const [activeTab, setActiveTab] = useState<'transactions' | 'plans' | 'users'>('transactions');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showAddCredits, setShowAddCredits] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    // Stats
    const stats = {
        totalCreditsIssued: 15847293,
        totalCreditsConsumed: 12384756,
        revenue: 847293,
        avgCreditPrice: 0.08
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'purchase': return 'text-green-400 bg-green-500/10';
            case 'consumption': return 'text-red-400 bg-red-500/10';
            case 'refund': return 'text-blue-400 bg-blue-500/10';
            case 'bonus': return 'text-purple-400 bg-purple-500/10';
            case 'adjustment': return 'text-yellow-400 bg-yellow-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Credits & Billing</h1>
                    <p className="text-sm text-gray-500">Manage credit packs, transactions, and user balances</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white">
                        <Download size={16} />
                        Export
                    </button>
                    <button 
                        onClick={() => setShowAddCredits(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm"
                    >
                        <Plus size={16} />
                        Add Credits
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Coins size={20} className="text-yellow-400" />
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp size={12} /> 12%
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{(stats.totalCreditsIssued / 1000000).toFixed(2)}M</div>
                    <div className="text-xs text-gray-500">Total Credits Issued</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Zap size={20} className="text-purple-400" />
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp size={12} /> 18%
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{(stats.totalCreditsConsumed / 1000000).toFixed(2)}M</div>
                    <div className="text-xs text-gray-500">Credits Consumed</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <CreditCard size={20} className="text-green-400" />
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp size={12} /> 23%
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">${(stats.revenue / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-500">Revenue This Month</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp size={20} className="text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">${stats.avgCreditPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Avg Credit Price</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit">
                {[
                    { key: 'transactions', label: 'Transactions' },
                    { key: 'plans', label: 'Credit Plans' },
                    { key: 'users', label: 'Top Users' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-white/5 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search transactions..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="purchase">Purchases</option>
                            <option value="consumption">Consumption</option>
                            <option value="refund">Refunds</option>
                            <option value="bonus">Bonuses</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Amount</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Balance</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Description</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-white">{tx.user_email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTransactionColor(tx.type)}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-400">{tx.balance_after.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-400">{tx.description}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500">{tx.created_at.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-1 text-gray-500 hover:text-white">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`relative bg-[#0a0a0a] border rounded-xl p-5 ${plan.popular ? 'border-yellow-500/50' : 'border-white/10'}`}>
                            {plan.popular && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">
                                    POPULAR
                                </span>
                            )}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">{plan.name}</h3>
                                <span className={`w-2 h-2 rounded-full ${plan.active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            </div>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-white">${plan.price}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                <Coins size={16} className="text-yellow-400" />
                                {plan.credits.toLocaleString()} credits
                            </div>
                            <div className="text-xs text-gray-500 mb-4">
                                ${(plan.price / plan.credits).toFixed(3)} per credit
                            </div>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white">
                                Edit Plan
                            </button>
                        </div>
                    ))}
                    <button className="flex flex-col items-center justify-center gap-2 bg-[#0a0a0a] border border-dashed border-white/20 rounded-xl p-5 text-gray-500 hover:text-white hover:border-white/40 transition-colors">
                        <Plus size={24} />
                        <span className="text-sm">Add New Plan</span>
                    </button>
                </div>
            )}

            {/* Top Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Plan</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Balance</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Purchased</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Consumed</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Last Purchase</th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_TOP_USERS.map((user) => (
                                    <tr key={user.user_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium">
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-white">{user.balance.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-green-400">{user.total_purchased.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-red-400">{user.total_consumed.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-500">{user.last_purchase.toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1 text-gray-500 hover:text-white" title="Add credits">
                                                    <Gift size={16} />
                                                </button>
                                                <button className="p-1 text-gray-500 hover:text-white" title="View details">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Credits Modal */}
            {showAddCredits && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Add Credits to User</h3>
                            <button onClick={() => setShowAddCredits(false)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">User Email</label>
                                <input
                                    type="email"
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Credits Amount</label>
                                <input
                                    type="number"
                                    placeholder="1000"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Type</label>
                                <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                                    <option value="bonus">Bonus</option>
                                    <option value="adjustment">Adjustment</option>
                                    <option value="refund">Refund</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                                <textarea
                                    placeholder="Enter reason for credit adjustment..."
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddCredits(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg">
                                Add Credits
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
