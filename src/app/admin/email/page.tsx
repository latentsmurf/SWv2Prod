'use client';

import React, { useState, useEffect } from 'react';
import { Mail, TrendingUp, Send, FileText, Users, Plus, RefreshCw } from 'lucide-react';
import { EmailTemplate, Subscriber, EmailCampaign } from '@/lib/email';

// Import extracted components
import OverviewTab from './components/OverviewTab';
import CampaignsTab from './components/CampaignsTab';
import TemplatesTab from './components/TemplatesTab';
import SubscribersTab from './components/SubscribersTab';

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
