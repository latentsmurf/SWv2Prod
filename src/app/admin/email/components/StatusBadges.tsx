'use client';

import React from 'react';
import { FileText, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { EmailCampaign, Subscriber } from '@/lib/email';

// ============================================================================
// STATUS BADGE - For campaign status
// ============================================================================

export function StatusBadge({ status }: { status: EmailCampaign['status'] }) {
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

// ============================================================================
// SUBSCRIBER STATUS BADGE - For subscriber status
// ============================================================================

export function SubscriberStatusBadge({ status }: { status: Subscriber['status'] }) {
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
