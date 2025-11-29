'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, MessageSquare, User,
    ChevronRight, Filter, Search, AlertCircle, ThumbsUp,
    ThumbsDown, MoreHorizontal, Eye, Edit2, Loader2
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ApprovalItem {
    id: string;
    type: 'shot' | 'scene' | 'episode' | 'project';
    item_id: string;
    item_name: string;
    thumbnail_url?: string;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    submitted_by: string;
    submitted_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
    feedback?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface ApprovalWorkflowProps {
    projectId: string;
    userRole: 'creator' | 'reviewer' | 'director' | 'admin';
    onApprove?: (item: ApprovalItem) => void;
    onReject?: (item: ApprovalItem, feedback: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ApprovalWorkflow({
    projectId,
    userRole,
    onApprove,
    onReject
}: ApprovalWorkflowProps) {
    const [items, setItems] = useState<ApprovalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ========================================================================
    // DATA FETCHING
    // ========================================================================

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/approvals`);
                if (res.ok) {
                    setItems(await res.json());
                } else {
                    setItems(MOCK_ITEMS);
                }
            } catch (error) {
                console.error('Error fetching approvals:', error);
                setItems(MOCK_ITEMS);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [projectId]);

    // ========================================================================
    // ACTIONS
    // ========================================================================

    const handleApprove = async (item: ApprovalItem) => {
        setIsSubmitting(true);
        try {
            await fetch(`/api/projects/${projectId}/approvals/${item.id}/approve`, {
                method: 'POST'
            });

            setItems(prev => prev.map(i => 
                i.id === item.id 
                    ? { ...i, status: 'approved', reviewed_at: new Date().toISOString() } 
                    : i
            ));
            onApprove?.(item);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error approving:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async (item: ApprovalItem) => {
        if (!feedbackText.trim()) return;

        setIsSubmitting(true);
        try {
            await fetch(`/api/projects/${projectId}/approvals/${item.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback: feedbackText })
            });

            setItems(prev => prev.map(i => 
                i.id === item.id 
                    ? { ...i, status: 'rejected', feedback: feedbackText, reviewed_at: new Date().toISOString() } 
                    : i
            ));
            onReject?.(item, feedbackText);
            setSelectedItem(null);
            setFeedbackText('');
        } catch (error) {
            console.error('Error rejecting:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const requestChanges = async (item: ApprovalItem) => {
        if (!feedbackText.trim()) return;

        setIsSubmitting(true);
        try {
            await fetch(`/api/projects/${projectId}/approvals/${item.id}/request-changes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback: feedbackText })
            });

            setItems(prev => prev.map(i => 
                i.id === item.id 
                    ? { ...i, status: 'changes_requested', feedback: feedbackText, reviewed_at: new Date().toISOString() } 
                    : i
            ));
            setSelectedItem(null);
            setFeedbackText('');
        } catch (error) {
            console.error('Error requesting changes:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ========================================================================
    // FILTERING
    // ========================================================================

    const filteredItems = items.filter(item => {
        if (filterStatus !== 'all' && item.status !== filterStatus) return false;
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (searchQuery && !item.item_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const pendingCount = items.filter(i => i.status === 'pending').length;

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const getStatusConfig = (status: ApprovalItem['status']) => {
        const configs = {
            pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
            approved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Approved' },
            rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' },
            changes_requested: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Changes Requested' }
        };
        return configs[status];
    };

    const getPriorityConfig = (priority: ApprovalItem['priority']) => {
        const configs = {
            low: { color: 'text-gray-400', bg: 'bg-gray-500/10' },
            normal: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
            high: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
            urgent: { color: 'text-red-400', bg: 'bg-red-500/10' }
        };
        return configs[priority];
    };

    const canReview = userRole === 'reviewer' || userRole === 'director' || userRole === 'admin';

    // ========================================================================
    // RENDER
    // ========================================================================

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                            <CheckCircle size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Approval Queue</h2>
                            <p className="text-xs text-gray-500">
                                {pendingCount} items pending review
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="changes_requested">Changes Requested</option>
                    </select>

                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    >
                        <option value="all">All Types</option>
                        <option value="shot">Shots</option>
                        <option value="scene">Scenes</option>
                        <option value="episode">Episodes</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="mx-auto text-gray-600 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
                        <p className="text-sm text-gray-500">No items match your filters</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map(item => {
                            const statusConfig = getStatusConfig(item.status);
                            const priorityConfig = getPriorityConfig(item.priority);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`
                                        p-4 bg-[#121212] border rounded-xl cursor-pointer transition-all
                                        ${selectedItem?.id === item.id 
                                            ? 'border-blue-500/50 ring-1 ring-blue-500/20' 
                                            : 'border-white/5 hover:border-white/20'}
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                            {item.thumbnail_url ? (
                                                <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                    <Eye size={20} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs ${statusConfig.bg} ${statusConfig.color}`}>
                                                    <StatusIcon size={10} className="inline mr-1" />
                                                    {statusConfig.label}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${priorityConfig.bg} ${priorityConfig.color}`}>
                                                    {item.priority}
                                                </span>
                                                <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400 capitalize">
                                                    {item.type}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-medium truncate">{item.item_name}</h4>
                                            <p className="text-xs text-gray-500">
                                                Submitted by {item.submitted_by} • {new Date(item.submitted_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {canReview && item.status === 'pending' && (
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleApprove(item)}
                                                    className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg"
                                                    title="Approve"
                                                >
                                                    <ThumbsUp size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setFeedbackText('');
                                                    }}
                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg"
                                                    title="Reject"
                                                >
                                                    <ThumbsDown size={16} />
                                                </button>
                                            </div>
                                        )}

                                        <ChevronRight size={16} className="text-gray-600" />
                                    </div>

                                    {/* Feedback */}
                                    {item.feedback && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <p className="text-xs text-gray-500">
                                                <MessageSquare size={10} className="inline mr-1" />
                                                {item.feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Panel */}
            {selectedItem && selectedItem.status === 'pending' && canReview && (
                <div className="p-6 border-t border-white/5 bg-[#121212]">
                    <h4 className="text-sm font-medium text-white mb-3">Review: {selectedItem.item_name}</h4>
                    <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Add feedback or notes (required for rejection)..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none mb-4"
                    />
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => requestChanges(selectedItem)}
                            disabled={!feedbackText.trim() || isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-xl disabled:opacity-50"
                        >
                            <AlertCircle size={16} />
                            Request Changes
                        </button>
                        <button
                            onClick={() => handleReject(selectedItem)}
                            disabled={!feedbackText.trim() || isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl disabled:opacity-50"
                        >
                            <XCircle size={16} />
                            Reject
                        </button>
                        <button
                            onClick={() => handleApprove(selectedItem)}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <CheckCircle size={16} />
                            )}
                            Approve
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_ITEMS: ApprovalItem[] = [
    {
        id: '1',
        type: 'shot',
        item_id: 'shot-1',
        item_name: 'Shot 1 - CEO Office Establishing',
        status: 'pending',
        submitted_by: 'John Doe',
        submitted_at: new Date().toISOString(),
        priority: 'high'
    },
    {
        id: '2',
        type: 'scene',
        item_id: 'scene-1',
        item_name: 'Scene 3 - Confrontation',
        status: 'approved',
        submitted_by: 'Jane Smith',
        submitted_at: new Date(Date.now() - 86400000).toISOString(),
        reviewed_by: 'Director',
        reviewed_at: new Date().toISOString(),
        priority: 'normal'
    },
    {
        id: '3',
        type: 'episode',
        item_id: 'ep-1',
        item_name: 'Episode 1 - Final Cut',
        status: 'changes_requested',
        submitted_by: 'Editor',
        submitted_at: new Date(Date.now() - 172800000).toISOString(),
        feedback: 'Please tighten the pacing in the middle section',
        priority: 'urgent'
    }
];
