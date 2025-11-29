'use client';

import React, { useState } from 'react';
import {
    Lock, Unlock, Check, X, AlertTriangle, User, Clock,
    MessageSquare, ThumbsUp, ThumbsDown, Loader2
} from 'lucide-react';
import { Shot } from '@/types';

interface ApprovalStatus {
    shot_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    locked: boolean;
    locked_by?: string;
    locked_at?: string;
    approvals: Approval[];
    comments?: string;
}

interface Approval {
    user_id: string;
    user_name: string;
    status: 'approved' | 'rejected' | 'changes_requested';
    comment?: string;
    created_at: string;
}

interface ShotLockingProps {
    shot: Shot;
    projectId: string;
    approvalStatus?: ApprovalStatus;
    onStatusChange?: (status: ApprovalStatus) => void;
    currentUserId?: string;
    isAdmin?: boolean;
}

export default function ShotLocking({
    shot,
    projectId,
    approvalStatus,
    onStatusChange,
    currentUserId = 'current-user',
    isAdmin = false
}: ShotLockingProps) {
    const [loading, setLoading] = useState(false);
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalComment, setApprovalComment] = useState('');

    const isLocked = approvalStatus?.locked || false;
    const currentStatus = approvalStatus?.status || 'pending';

    // Lock/Unlock shot
    const toggleLock = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shot.id}/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locked: !isLocked })
            });

            if (res.ok) {
                const updated = await res.json();
                onStatusChange?.(updated);
            }
        } catch (error) {
            console.error('Error toggling lock:', error);
        } finally {
            setLoading(false);
        }
    };

    // Submit approval
    const submitApproval = async (status: 'approved' | 'rejected' | 'changes_requested') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/shots/${shot.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    comment: approvalComment
                })
            });

            if (res.ok) {
                const updated = await res.json();
                onStatusChange?.(updated);
                setShowApprovalDialog(false);
                setApprovalComment('');
            }
        } catch (error) {
            console.error('Error submitting approval:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-400 bg-green-500/10';
            case 'rejected':
                return 'text-red-400 bg-red-500/10';
            case 'changes_requested':
                return 'text-orange-400 bg-orange-500/10';
            default:
                return 'text-gray-400 bg-gray-500/10';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <ThumbsUp size={14} />;
            case 'rejected':
                return <ThumbsDown size={14} />;
            case 'changes_requested':
                return <AlertTriangle size={14} />;
            default:
                return <Clock size={14} />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Lock Status */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                    {isLocked ? (
                        <Lock className="text-yellow-500" size={20} />
                    ) : (
                        <Unlock className="text-gray-500" size={20} />
                    )}
                    <div>
                        <p className="text-sm font-medium text-white">
                            {isLocked ? 'Shot Locked' : 'Shot Unlocked'}
                        </p>
                        {isLocked && approvalStatus?.locked_by && (
                            <p className="text-xs text-gray-500">
                                Locked by {approvalStatus.locked_by}
                            </p>
                        )}
                    </div>
                </div>

                {(isAdmin || !isLocked) && (
                    <button
                        onClick={toggleLock}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            isLocked
                                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : isLocked ? (
                            <Unlock size={16} />
                        ) : (
                            <Lock size={16} />
                        )}
                        {isLocked ? 'Unlock' : 'Lock'}
                    </button>
                )}
            </div>

            {/* Approval Status */}
            <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">Approval Status</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(currentStatus)}`}>
                        {currentStatus.replace('_', ' ')}
                    </span>
                </div>

                {/* Approval History */}
                {approvalStatus?.approvals && approvalStatus.approvals.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {approvalStatus.approvals.map((approval, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-black/30 rounded-lg"
                            >
                                <div className={`p-1.5 rounded ${getStatusColor(approval.status)}`}>
                                    {getStatusIcon(approval.status)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">
                                            {approval.user_name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(approval.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {approval.comment && (
                                        <p className="text-sm text-gray-400 mt-1">{approval.comment}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Approval Actions */}
                {!isLocked && (
                    <button
                        onClick={() => setShowApprovalDialog(true)}
                        className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg font-medium transition-colors"
                    >
                        Submit Review
                    </button>
                )}
            </div>

            {/* Approval Dialog */}
            {showApprovalDialog && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Review Shot</h3>
                            <p className="text-sm text-gray-500 mt-1">Shot {shot.shot_number}</p>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm text-gray-400 mb-2">Comment (optional)</label>
                            <textarea
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                                placeholder="Add feedback..."
                                rows={3}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                            />
                        </div>

                        <div className="p-6 border-t border-white/5 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => submitApproval('approved')}
                                    disabled={loading}
                                    className="flex flex-col items-center gap-2 p-4 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-green-400 transition-colors"
                                >
                                    <ThumbsUp size={24} />
                                    <span className="text-sm font-medium">Approve</span>
                                </button>
                                <button
                                    onClick={() => submitApproval('changes_requested')}
                                    disabled={loading}
                                    className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl text-orange-400 transition-colors"
                                >
                                    <AlertTriangle size={24} />
                                    <span className="text-sm font-medium">Changes</span>
                                </button>
                                <button
                                    onClick={() => submitApproval('rejected')}
                                    disabled={loading}
                                    className="flex flex-col items-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
                                >
                                    <ThumbsDown size={24} />
                                    <span className="text-sm font-medium">Reject</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowApprovalDialog(false)}
                                className="w-full py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Lock indicator badge
export function LockBadge({ locked }: { locked: boolean }) {
    if (!locked) return null;
    
    return (
        <div className="absolute top-2 right-2 p-1.5 bg-yellow-500 rounded-full">
            <Lock size={12} className="text-black" />
        </div>
    );
}
