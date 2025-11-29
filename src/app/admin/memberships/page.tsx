'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard, Users, TrendingUp, TrendingDown, Search, Filter,
    Download, Plus, Edit2, Trash2, Check, X, Star, Crown, Zap,
    Clock, Calendar, MoreHorizontal, Eye, Pause, Play, RefreshCw
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface MembershipPlan {
    id: string;
    name: string;
    price: number;
    billing_period: 'monthly' | 'yearly';
    credits_per_month: number;
    features: string[];
    active_subscribers: number;
    revenue: number;
    color: string;
    popular: boolean;
}

interface Subscriber {
    id: string;
    email: string;
    name: string;
    plan: string;
    status: 'active' | 'cancelled' | 'past_due' | 'paused';
    started_at: Date;
    next_billing: Date;
    total_paid: number;
    credits_used: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PLANS: MembershipPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        billing_period: 'monthly',
        credits_per_month: 50,
        features: ['50 credits/month', 'Basic generation', 'Community support', 'Watermarked exports'],
        active_subscribers: 8432,
        revenue: 0,
        color: 'gray',
        popular: false
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        billing_period: 'monthly',
        credits_per_month: 500,
        features: ['500 credits/month', 'HD generation', 'Priority support', 'No watermarks', 'API access'],
        active_subscribers: 2847,
        revenue: 82563,
        color: 'blue',
        popular: true
    },
    {
        id: 'studio',
        name: 'Studio',
        price: 99,
        billing_period: 'monthly',
        credits_per_month: 2500,
        features: ['2,500 credits/month', '4K generation', 'Dedicated support', 'Team collaboration', 'Custom styles', 'White-label exports'],
        active_subscribers: 567,
        revenue: 56133,
        color: 'purple',
        popular: false
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499,
        billing_period: 'monthly',
        credits_per_month: 15000,
        features: ['15,000 credits/month', '8K generation', 'SLA guarantee', 'Dedicated account manager', 'Custom integrations', 'On-premise option'],
        active_subscribers: 43,
        revenue: 21457,
        color: 'yellow',
        popular: false
    },
];

const MOCK_SUBSCRIBERS: Subscriber[] = [
    { id: '1', email: 'netflix@partner.com', name: 'Netflix Studios', plan: 'Enterprise', status: 'active', started_at: new Date('2024-01-15'), next_billing: new Date('2024-12-15'), total_paid: 5988, credits_used: 142000 },
    { id: '2', email: 'sarah@studio.com', name: 'Sarah Chen', plan: 'Studio', status: 'active', started_at: new Date('2024-03-20'), next_billing: new Date('2024-12-20'), total_paid: 891, credits_used: 18500 },
    { id: '3', email: 'mike@films.io', name: 'Mike Johnson', plan: 'Pro', status: 'active', started_at: new Date('2024-06-01'), next_billing: new Date('2024-12-01'), total_paid: 174, credits_used: 2800 },
    { id: '4', email: 'emma@prod.co', name: 'Emma Wilson', plan: 'Pro', status: 'past_due', started_at: new Date('2024-04-10'), next_billing: new Date('2024-11-10'), total_paid: 203, credits_used: 3200 },
    { id: '5', email: 'alex@movies.net', name: 'Alex Rivera', plan: 'Studio', status: 'cancelled', started_at: new Date('2024-02-28'), next_billing: new Date('2024-11-28'), total_paid: 792, credits_used: 15600 },
    { id: '6', email: 'indie@films.io', name: 'Indie Films Co', plan: 'Pro', status: 'paused', started_at: new Date('2024-05-15'), next_billing: new Date('2024-12-15'), total_paid: 145, credits_used: 1900 },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MembershipsPage() {
    const [plans, setPlans] = useState(MOCK_PLANS);
    const [subscribers, setSubscribers] = useState(MOCK_SUBSCRIBERS);
    const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'subscribers'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showEditPlan, setShowEditPlan] = useState<MembershipPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSubscribers: 0,
        mrr: 0,
        churnRate: 3.2,
        avgRevenue: 0,
        conversionRate: 0,
        totalRevenue: 0
    });

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/memberships');
                if (res.ok) {
                    const data = await res.json();
                    setPlans(data.plans);
                    setSubscribers(data.subscribers.map((s: any) => ({
                        ...s,
                        started_at: new Date(s.started_at),
                        next_billing: s.next_billing ? new Date(s.next_billing) : new Date(),
                    })));
                    setStats({
                        totalSubscribers: data.stats.totalSubscribers,
                        mrr: data.stats.mrr,
                        churnRate: data.stats.churnRate,
                        avgRevenue: data.stats.avgSubscriptionValue,
                        conversionRate: data.stats.conversionRate,
                        totalRevenue: data.stats.totalRevenue
                    });
                }
            } catch (error) {
                console.error('Error fetching memberships data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-500/10';
            case 'cancelled': return 'text-red-400 bg-red-500/10';
            case 'past_due': return 'text-yellow-400 bg-yellow-500/10';
            case 'paused': return 'text-blue-400 bg-blue-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'free': return <Zap size={16} />;
            case 'pro': return <Star size={16} />;
            case 'studio': return <Crown size={16} />;
            case 'enterprise': return <Crown size={16} />;
            default: return <CreditCard size={16} />;
        }
    };

    const filteredSubscribers = subscribers.filter(s => {
        const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === 'all' || s.plan.toLowerCase() === filterPlan;
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        return matchesSearch && matchesPlan && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Memberships</h1>
                    <p className="text-sm text-gray-500">Manage subscription plans and subscribers</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm">
                        <Plus size={16} />
                        New Plan
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Users size={20} className="text-blue-400" />
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp size={12} /> 8%
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.totalSubscribers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Active Subscribers</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <CreditCard size={20} className="text-green-400" />
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp size={12} /> 12%
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">${(stats.mrr / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-gray-500">Monthly Recurring Revenue</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingDown size={20} className="text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.churnRate}%</div>
                    <div className="text-xs text-gray-500">Monthly Churn Rate</div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Zap size={20} className="text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">${stats.avgRevenue}</div>
                    <div className="text-xs text-gray-500">Avg Revenue Per User</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg w-fit">
                {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'plans', label: 'Plans' },
                    { key: 'subscribers', label: 'Subscribers' },
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

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue by Plan */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-4">Revenue by Plan</h3>
                        <div className="space-y-4">
                            {plans.filter(p => p.revenue > 0).map(plan => {
                                const maxRevenue = Math.max(...plans.map(p => p.revenue));
                                const percentage = (plan.revenue / maxRevenue) * 100;
                                return (
                                    <div key={plan.id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-white">{plan.name}</span>
                                            <span className="text-sm text-gray-400">${plan.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full bg-${plan.color}-500`}
                                                style={{ width: `${percentage}%`, backgroundColor: plan.color === 'yellow' ? '#EAB308' : plan.color === 'purple' ? '#A855F7' : plan.color === 'blue' ? '#3B82F6' : '#6B7280' }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subscriber Distribution */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                        <h3 className="font-semibold text-white mb-4">Subscriber Distribution</h3>
                        <div className="space-y-3">
                            {plans.map(plan => (
                                <div key={plan.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${plan.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' : plan.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : plan.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                            {getPlanIcon(plan.id)}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-white">{plan.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">${plan.price}/mo</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-white">{plan.active_subscribers.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">subscribers</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {plans.map(plan => (
                        <div key={plan.id} className={`relative bg-[#0a0a0a] border rounded-xl p-5 ${plan.popular ? 'border-yellow-500/50' : 'border-white/10'}`}>
                            {plan.popular && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded">
                                    MOST POPULAR
                                </span>
                            )}
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${plan.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' : plan.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : plan.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                    {getPlanIcon(plan.id)}
                                </div>
                                <button className="p-1 text-gray-500 hover:text-white">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-white">${plan.price}</span>
                                <span className="text-gray-500">/mo</span>
                            </div>
                            <div className="text-sm text-gray-400 mb-4">
                                {plan.credits_per_month.toLocaleString()} credits/month
                            </div>
                            <div className="space-y-2 mb-4">
                                {plan.features.slice(0, 4).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                        <Check size={12} className="text-green-400" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{plan.active_subscribers.toLocaleString()} subscribers</span>
                                    <span className="text-green-400">${plan.revenue.toLocaleString()}/mo</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowEditPlan(plan)}
                                className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white"
                            >
                                Edit Plan
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-white/5 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search subscribers..."
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
                            />
                        </div>
                        <select
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                        >
                            <option value="all">All Plans</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="past_due">Past Due</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Subscriber</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Plan</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Started</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Next Billing</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Total Paid</th>
                                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscribers.map((sub) => (
                                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="text-sm font-medium text-white">{sub.name}</div>
                                                <div className="text-xs text-gray-500">{sub.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-white">{sub.plan}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(sub.status)}`}>
                                                {sub.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-400">{sub.started_at.toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-400">{sub.next_billing.toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-green-400">${sub.total_paid.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1 text-gray-500 hover:text-white" title="View details">
                                                    <Eye size={16} />
                                                </button>
                                                {sub.status === 'active' ? (
                                                    <button className="p-1 text-gray-500 hover:text-yellow-400" title="Pause">
                                                        <Pause size={16} />
                                                    </button>
                                                ) : sub.status === 'paused' ? (
                                                    <button className="p-1 text-gray-500 hover:text-green-400" title="Resume">
                                                        <Play size={16} />
                                                    </button>
                                                ) : null}
                                                <button className="p-1 text-gray-500 hover:text-white" title="More">
                                                    <MoreHorizontal size={16} />
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
        </div>
    );
}
