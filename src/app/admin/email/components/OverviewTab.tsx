'use client';

import React from 'react';
import { Users, CheckCircle, Send, Eye, Clock } from 'lucide-react';
import { EmailCampaign } from '@/lib/email';
import { StatusBadge } from './StatusBadges';

interface OverviewTabProps {
    campaigns: EmailCampaign[];
    subscriberStats: { active: number; unsubscribed: number; bounced: number; pending: number };
    subscriberCount: number;
}

export default function OverviewTab({ campaigns, subscriberStats, subscriberCount }: OverviewTabProps) {
    const sentCampaigns = campaigns.filter(c => c.status === 'sent');
    const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.openCount, 0);
    const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.clickCount, 0);
    const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.recipientCount, 0);
    
    const avgOpenRate = totalRecipients > 0 ? ((totalOpens / totalRecipients) * 100).toFixed(1) : '0';

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
                        className="p-6 rounded-xl border bg-[#0a0a0a] border-white/10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {stat.value}
                        </div>
                        <div className="text-sm text-gray-500">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Campaigns */}
            <div className="rounded-xl border bg-[#0a0a0a] border-white/10">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-semibold text-white">Recent Campaigns</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {campaigns.slice(0, 5).map(campaign => (
                        <div key={campaign.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <StatusBadge status={campaign.status} />
                                <div>
                                    <div className="font-medium text-white">
                                        {campaign.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {campaign.subject}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {campaign.status === 'sent' && (
                                    <div className="text-sm text-gray-400">
                                        {campaign.openCount} opens · {campaign.clickCount} clicks
                                    </div>
                                )}
                                {campaign.status === 'scheduled' && campaign.scheduledFor && (
                                    <div className="text-sm flex items-center gap-1 text-gray-500">
                                        <Clock size={14} />
                                        {new Date(campaign.scheduledFor).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {campaigns.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No campaigns yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
