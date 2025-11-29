'use client';

import React, { useState } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import { EmailCampaign, EmailTemplate } from '@/lib/email';
import { StatusBadge } from './StatusBadges';
import CreateCampaignModal from './modals/CreateCampaignModal';

interface CampaignsTabProps {
    campaigns: EmailCampaign[];
    templates: EmailTemplate[];
    onRefresh: () => void;
}

export default function CampaignsTab({ campaigns, templates, onRefresh }: CampaignsTabProps) {
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
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg text-sm w-64 bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-yellow-500 hover:bg-yellow-400 text-black"
                >
                    <Plus size={16} />
                    New Campaign
                </button>
            </div>

            {/* Campaigns List */}
            <div className="rounded-xl border overflow-hidden bg-[#0a0a0a] border-white/10">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Campaign</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Recipients</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Open Rate</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Click Rate</th>
                            <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
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
                                        <div className="font-medium text-white">
                                            {campaign.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {campaign.subject}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge status={campaign.status} />
                                    </td>
                                    <td className="p-4 text-white">
                                        {campaign.recipientCount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-white">
                                        {openRate}%
                                    </td>
                                    <td className="p-4 text-white">
                                        {clickRate}%
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                            <MoreVertical size={16} className="text-gray-500" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredCampaigns.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No campaigns found
                                </td>
                            </tr>
                        )}
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
