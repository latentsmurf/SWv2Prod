'use client';

import React, { useState } from 'react';
import { Search, Plus, Download, MoreVertical } from 'lucide-react';
import { Subscriber } from '@/lib/email';
import { SubscriberStatusBadge } from './StatusBadges';
import AddSubscriberModal from './modals/AddSubscriberModal';

interface SubscribersTabProps {
    subscribers: Subscriber[];
    stats: { active: number; unsubscribed: number; bounced: number; pending: number };
    onRefresh: () => void;
}

export default function SubscribersTab({ subscribers, stats, onRefresh }: SubscribersTabProps) {
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
                        className="p-4 rounded-xl border bg-[#0a0a0a] border-white/10"
                    >
                        <div className="text-2xl font-bold text-white">
                            {option.count}
                        </div>
                        <div className="text-sm text-gray-500">
                            {option.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search subscribers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg text-sm w-64 bg-white/5 border border-white/10 text-white placeholder-gray-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white"
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
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/10 text-gray-400"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-yellow-500 hover:bg-yellow-400 text-black"
                    >
                        <Plus size={16} />
                        Add Subscriber
                    </button>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-xl border overflow-hidden bg-[#0a0a0a] border-white/10">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Subscriber</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Source</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Tags</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500">Subscribed</th>
                            <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredSubscribers.map(subscriber => (
                            <tr key={subscriber.id} className="hover:bg-white/5">
                                <td className="p-4">
                                    <div className="font-medium text-white">
                                        {subscriber.name || 'No name'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {subscriber.email}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <SubscriberStatusBadge status={subscriber.status} />
                                </td>
                                <td className="p-4 capitalize text-gray-400">
                                    {subscriber.source}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {subscriber.tags.slice(0, 2).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 rounded text-xs bg-white/5 text-gray-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {subscriber.tags.length > 2 && (
                                            <span className="text-xs text-gray-500">
                                                +{subscriber.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <MoreVertical size={16} className="text-gray-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSubscribers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No subscribers found
                                </td>
                            </tr>
                        )}
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
