'use client';

import React, { useState, useEffect } from 'react';
import { 
    Mail, Users, FileText, Send, Plus, Search, Filter, 
    MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle,
    Clock, TrendingUp, MousePointer, RefreshCw, Download,
    Tag, Calendar, ArrowRight, Sparkles
} from 'lucide-react';
import { EmailTemplate, Subscriber, EmailCampaign } from '@/lib/email';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'overview' | 'campaigns' | 'templates' | 'subscribers';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EmailManagementPage() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [subscriberStats, setSubscriberStats] = useState({ active: 0, unsubscribed: 0, bounced: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, templatesRes, subscribersRes] = await Promise.all([
                fetch('/api/admin/email/campaigns'),
                fetch('/api/admin/email/templates'),
                fetch('/api/admin/email/subscribers'),
            ]);

            if (campaignsRes.ok) {
                const data = await campaignsRes.json();
                setCampaigns(data.campaigns || []);
            }
            if (templatesRes.ok) {
                const data = await templatesRes.json();
                setTemplates(data.templates || []);
            }
            if (subscribersRes.ok) {
                const data = await subscribersRes.json();
                setSubscribers(data.subscribers || []);
                setSubscriberStats(data.stats || { active: 0, unsubscribed: 0, bounced: 0, pending: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch email data:', error);
        }
        setLoading(false);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'campaigns', label: 'Campaigns', icon: Send },
        { id: 'templates', label: 'Templates', icon: FileText },
        { id: 'subscribers', label: 'Subscribers', icon: Users },
    ];

    return (
        <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--sw-background)' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--sw-foreground)' }}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            Email Management
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--sw-foreground-muted)' }}>
                            Manage newsletters, campaigns, and email templates
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchAllData}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--sw-background-secondary)', color: 'var(--sw-foreground-muted)' }}
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                        >
                            <Plus size={16} />
                            New Campaign
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: 'var(--sw-background-secondary)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                backgroundColor: activeTab === tab.id ? 'var(--sw-background-tertiary)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--sw-foreground)' : 'var(--sw-foreground-muted)'
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <OverviewTab 
                        campaigns={campaigns} 
                        subscriberStats={subscriberStats} 
                        subscriberCount={subscribers.length}
                    />
                )}
                {activeTab === 'campaigns' && (
                    <CampaignsTab campaigns={campaigns} templates={templates} onRefresh={fetchAllData} />
                )}
                {activeTab === 'templates' && (
                    <TemplatesTab templates={templates} onRefresh={fetchAllData} />
                )}
                {activeTab === 'subscribers' && (
                    <SubscribersTab subscribers={subscribers} stats={subscriberStats} onRefresh={fetchAllData} />
                )}
            </div>
        </div>
    );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ campaigns, subscriberStats, subscriberCount }: { 
    campaigns: EmailCampaign[];
    subscriberStats: { active: number; unsubscribed: number; bounced: number; pending: number };
    subscriberCount: number;
}) {
    const sentCampaigns = campaigns.filter(c => c.status === 'sent');
    const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.openCount, 0);
    const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.clickCount, 0);
    const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.recipientCount, 0);
    
    const avgOpenRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : '0';
    const avgClickRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : '0';

    const stats = [
        { label: 'Total Subscribers', value: subscriberCount, icon: Users, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Subscribers', value: subscriberStats.active, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
        { label: 'Campaigns Sent', value: sentCampaigns.length, icon: Send, color: 'from-purple-500 to-pink-500' },
        { label: 'Avg Open Rate', value: `${avgOpenRate}%`, icon: Eye, color: 'from-yellow-500 to-orange-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-xl border"
                        style={{ backgroundColor: 'var(--sw-background-secondary)', borderColor: 'var(--sw-border)' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--sw-foreground)' }}>
                            {stat.value}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Campaigns */}
            <div className="rounded-xl border" style={{ backgroundColor: 'var(--sw-background-secondary)', borderColor: 'var(--sw-border)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--sw-border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--sw-foreground)' }}>Recent Campaigns</h3>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--sw-border)' }}>
                    {campaigns.slice(0, 5).map(campaign => (
                        <div key={campaign.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <StatusBadge status={campaign.status} />
                                <div>
                                    <div className="font-medium" style={{ color: 'var(--sw-foreground)' }}>
                                        {campaign.name}
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                                        {campaign.subject}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {campaign.status === 'sent' && (
                                    <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                                        {campaign.openCount} opens · {campaign.clickCount} clicks
                                    </div>
                                )}
                                {campaign.status === 'scheduled' && campaign.scheduledFor && (
                                    <div className="text-sm flex items-center gap-1" style={{ color: 'var(--sw-foreground-muted)' }}>
                                        <Clock size={14} />
                                        {new Date(campaign.scheduledFor).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// CAMPAIGNS TAB
// ============================================================================

function CampaignsTab({ campaigns, templates, onRefresh }: { 
    campaigns: EmailCampaign[];
    templates: EmailTemplate[];
    onRefresh: () => void;
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--sw-foreground-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg text-sm w-64"
                            style={{ 
                                backgroundColor: 'var(--sw-background-secondary)',
                                border: '1px solid var(--sw-border)',
                                color: 'var(--sw-foreground)'
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                >
                    <Plus size={16} />
                    New Campaign
                </button>
            </div>

            {/* Campaigns List */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--sw-background-secondary)', borderColor: 'var(--sw-border)' }}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--sw-border)' }}>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Campaign</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Status</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Recipients</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Open Rate</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Click Rate</th>
                            <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--sw-border)' }}>
                        {filteredCampaigns.map(campaign => {
                            const openRate = campaign.recipientCount > 0 
                                ? ((campaign.openCount / campaign.recipientCount) * 100).toFixed(1)
                                : '0';
                            const clickRate = campaign.openCount > 0 
                                ? ((campaign.clickCount / campaign.openCount) * 100).toFixed(1)
                                : '0';

                            return (
                                <tr key={campaign.id} className="hover:bg-white/5">
                                    <td className="p-4">
                                        <div className="font-medium" style={{ color: 'var(--sw-foreground)' }}>
                                            {campaign.name}
                                        </div>
                                        <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                                            {campaign.subject}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={campaign.status} />
                                    </td>
                                    <td className="p-4" style={{ color: 'var(--sw-foreground)' }}>
                                        {campaign.recipientCount.toLocaleString()}
                                    </td>
                                    <td className="p-4" style={{ color: 'var(--sw-foreground)' }}>
                                        {openRate}%
                                    </td>
                                    <td className="p-4" style={{ color: 'var(--sw-foreground)' }}>
                                        {clickRate}%
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                            <MoreVertical size={16} style={{ color: 'var(--sw-foreground-muted)' }} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <CreateCampaignModal 
                    templates={templates}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}

// ============================================================================
// TEMPLATES TAB
// ============================================================================

function TemplatesTab({ templates, onRefresh }: { templates: EmailTemplate[]; onRefresh: () => void }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

    const categoryColors: Record<string, string> = {
        transactional: 'from-blue-500 to-cyan-500',
        marketing: 'from-purple-500 to-pink-500',
        notification: 'from-yellow-500 to-orange-500',
        onboarding: 'from-green-500 to-emerald-500',
    };

    return (
        <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                    {templates.length} templates
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                >
                    <Plus size={16} />
                    New Template
                </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className="rounded-xl border overflow-hidden"
                        style={{ backgroundColor: 'var(--sw-background-secondary)', borderColor: 'var(--sw-border)' }}
                    >
                        {/* Preview Header */}
                        <div 
                            className={`h-24 bg-gradient-to-br ${categoryColors[template.category] || 'from-gray-500 to-gray-600'} p-4 flex items-end`}
                        >
                            <span className="px-2 py-1 rounded text-xs font-medium bg-black/30 text-white capitalize">
                                {template.category}
                            </span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-semibold mb-1" style={{ color: 'var(--sw-foreground)' }}>
                                {template.name}
                            </h3>
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--sw-foreground-muted)' }}>
                                {template.description || template.subject}
                            </p>
                            
                            {/* Variables */}
                            {template.variables.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {template.variables.slice(0, 3).map((v, i) => (
                                        <span 
                                            key={i}
                                            className="px-2 py-0.5 rounded text-xs font-mono"
                                            style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground-muted)' }}
                                        >
                                            {v}
                                        </span>
                                    ))}
                                    {template.variables.length > 3 && (
                                        <span className="text-xs" style={{ color: 'var(--sw-foreground-muted)' }}>
                                            +{template.variables.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPreviewTemplate(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                    style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                                >
                                    <Eye size={14} />
                                    Preview
                                </button>
                                <button
                                    onClick={() => setEditingTemplate(template)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                    style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground)' }}
                                >
                                    <Edit size={14} />
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <TemplatePreviewModal 
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}

            {/* Edit Modal */}
            {(showCreateModal || editingTemplate) && (
                <TemplateEditorModal
                    template={editingTemplate}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTemplate(null);
                    }}
                    onSaved={() => {
                        setShowCreateModal(false);
                        setEditingTemplate(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}

// ============================================================================
// SUBSCRIBERS TAB
// ============================================================================

function SubscribersTab({ subscribers, stats, onRefresh }: { 
    subscribers: Subscriber[];
    stats: { active: number; unsubscribed: number; bounced: number; pending: number };
    onRefresh: () => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredSubscribers = subscribers.filter(s => {
        const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'all', label: 'All', count: subscribers.length },
        { value: 'active', label: 'Active', count: stats.active },
        { value: 'unsubscribed', label: 'Unsubscribed', count: stats.unsubscribed },
        { value: 'bounced', label: 'Bounced', count: stats.bounced },
        { value: 'pending', label: 'Pending', count: stats.pending },
    ];

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {statusOptions.slice(1).map(option => (
                    <div
                        key={option.value}
                        className="p-4 rounded-xl border"
                        style={{ backgroundColor: 'var(--sw-background-secondary)', borderColor: 'var(--sw-border)' }}
                    >
                        <div className="text-2xl font-bold" style={{ color: 'var(--sw-foreground)' }}>
                            {option.count}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                            {option.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--sw-foreground-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search subscribers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg text-sm w-64"
                            style={{ 
                                backgroundColor: 'var(--sw-background-secondary)',
                                border: '1px solid var(--sw-border)',
                                color: 'var(--sw-foreground)'
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{ 
                            backgroundColor: 'var(--sw-background-secondary)',
                            border: '1px solid var(--sw-border)',
                            color: 'var(--sw-foreground)'
                        }}
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.count})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{ backgroundColor: 'var(--sw-background-secondary)', color: 'var(--sw-foreground-muted)' }}
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        <Plus size={16} />
                        Add Subscriber
                    </button>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--sw-background-secondary)', borderColor: 'var(--sw-border)' }}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--sw-border)' }}>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Subscriber</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Status</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Source</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Tags</th>
                            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Subscribed</th>
                            <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--sw-foreground-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--sw-border)' }}>
                        {filteredSubscribers.map(subscriber => (
                            <tr key={subscriber.id} className="hover:bg-white/5">
                                <td className="p-4">
                                    <div className="font-medium" style={{ color: 'var(--sw-foreground)' }}>
                                        {subscriber.name || 'No name'}
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>
                                        {subscriber.email}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <SubscriberStatusBadge status={subscriber.status} />
                                </td>
                                <td className="p-4 capitalize" style={{ color: 'var(--sw-foreground-muted)' }}>
                                    {subscriber.source}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {subscriber.tags.slice(0, 2).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 rounded text-xs"
                                                style={{ backgroundColor: 'var(--sw-background-tertiary)', color: 'var(--sw-foreground-muted)' }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {subscriber.tags.length > 2 && (
                                            <span className="text-xs" style={{ color: 'var(--sw-foreground-muted)' }}>
                                                +{subscriber.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4" style={{ color: 'var(--sw-foreground-muted)' }}>
                                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <MoreVertical size={16} style={{ color: 'var(--sw-foreground-muted)' }} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Subscriber Modal */}
            {showAddModal && (
                <AddSubscriberModal
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => {
                        setShowAddModal(false);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: EmailCampaign['status'] }) {
    const styles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
        draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: FileText },
        scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
        sending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: RefreshCw },
        sent: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
        paused: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: XCircle },
    };

    const style = styles[status] || styles.draft;
    const Icon = style.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
            <Icon size={12} />
            <span className="capitalize">{status}</span>
        </span>
    );
}

function SubscriberStatusBadge({ status }: { status: Subscriber['status'] }) {
    const styles: Record<string, { bg: string; text: string }> = {
        active: { bg: 'bg-green-500/20', text: 'text-green-400' },
        unsubscribed: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
        bounced: { bg: 'bg-red-500/20', text: 'text-red-400' },
        pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    };

    const style = styles[status] || styles.pending;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text} capitalize`}>
            {status}
        </span>
    );
}

// ============================================================================
// MODALS
// ============================================================================

function CreateCampaignModal({ templates, onClose, onCreated }: {
    templates: EmailTemplate[];
    onClose: () => void;
    onCreated: () => void;
}) {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!name || !subject || !templateId) return;
        setSaving(true);

        try {
            const res = await fetch('/api/admin/email/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subject, templateId }),
            });
            if (res.ok) {
                onCreated();
            }
        } catch (error) {
            console.error('Failed to create campaign:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div 
                className="w-full max-w-lg rounded-xl p-6"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--sw-foreground)' }}>
                    Create Campaign
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>
                            Campaign Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., March Newsletter"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>
                            Subject Line
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., 🚀 New Features This Month"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>
                            Template
                        </label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        >
                            <option value="">Select a template</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg"
                        style={{ color: 'var(--sw-foreground-muted)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name || !subject || !templateId || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        {saving ? 'Creating...' : 'Create Campaign'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TemplatePreviewModal({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-3xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--sw-border)' }}>
                    <div>
                        <h2 className="font-bold" style={{ color: 'var(--sw-foreground)' }}>{template.name}</h2>
                        <p className="text-sm" style={{ color: 'var(--sw-foreground-muted)' }}>{template.subject}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl" style={{ color: 'var(--sw-foreground-muted)' }}>×</button>
                </div>
                <div className="flex-1 overflow-auto">
                    <iframe
                        srcDoc={template.htmlContent}
                        className="w-full h-full min-h-[500px]"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}

function TemplateEditorModal({ template, onClose, onSaved }: { 
    template: EmailTemplate | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(template?.name || '');
    const [subject, setSubject] = useState(template?.subject || '');
    const [description, setDescription] = useState(template?.description || '');
    const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
    const [category, setCategory] = useState(template?.category || 'marketing');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = template ? 'PUT' : 'POST';
            const body = template 
                ? { id: template.id, name, subject, description, htmlContent, category }
                : { name, subject, description, htmlContent, category, variables: [] };

            const res = await fetch('/api/admin/email/templates', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                onSaved();
            }
        } catch (error) {
            console.error('Failed to save template:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--sw-border)' }}>
                    <h2 className="font-bold" style={{ color: 'var(--sw-foreground)' }}>
                        {template ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <button onClick={onClose} className="text-2xl" style={{ color: 'var(--sw-foreground-muted)' }}>×</button>
                </div>
                
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg"
                                style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as EmailTemplate['category'])}
                                className="w-full px-3 py-2 rounded-lg"
                                style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                            >
                                <option value="transactional">Transactional</option>
                                <option value="marketing">Marketing</option>
                                <option value="notification">Notification</option>
                                <option value="onboarding">Onboarding</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>HTML Content</label>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            rows={15}
                            className="w-full px-3 py-2 rounded-lg font-mono text-sm"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--sw-border)' }}>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name || !subject || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddSubscriberModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!email) return;
        setSaving(true);

        try {
            const res = await fetch('/api/admin/email/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: name || undefined,
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                }),
            });
            if (res.ok) {
                onAdded();
            }
        } catch (error) {
            console.error('Failed to add subscriber:', error);
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div 
                className="w-full max-w-md rounded-xl p-6"
                style={{ backgroundColor: 'var(--sw-background-secondary)', border: '1px solid var(--sw-border)' }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--sw-foreground)' }}>Add Subscriber</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--sw-foreground)' }}>Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="newsletter, beta (comma separated)"
                            className="w-full px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'var(--sw-background)', border: '1px solid var(--sw-border)', color: 'var(--sw-foreground)' }}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ color: 'var(--sw-foreground-muted)' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!email || saving}
                        className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        style={{ backgroundColor: 'var(--sw-accent)', color: 'var(--sw-accent-foreground)' }}
                    >
                        {saving ? 'Adding...' : 'Add Subscriber'}
                    </button>
                </div>
            </div>
        </div>
    );
}
