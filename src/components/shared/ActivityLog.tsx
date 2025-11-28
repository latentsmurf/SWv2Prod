'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock, User, Film, Image, FileText, Settings, Download,
    Upload, Trash2, Edit2, Plus, Check, X, RefreshCw,
    MessageSquare, Share2, Music, Mic, Palette, Filter,
    ChevronDown, Loader2
} from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'create' | 'update' | 'delete' | 'generate' | 'export' | 'share' | 'comment';
    entity_type: 'project' | 'scene' | 'shot' | 'asset' | 'export' | 'review_link' | 'comment';
    entity_id: string;
    entity_name?: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    description: string;
    metadata?: Record<string, any>;
    created_at: string;
}

interface ActivityLogProps {
    projectId?: string;
    limit?: number;
    showFilters?: boolean;
}

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    create: { icon: Plus, color: 'text-green-400', bg: 'bg-green-500/10' },
    update: { icon: Edit2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    delete: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
    generate: { icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    export: { icon: Download, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    share: { icon: Share2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    comment: { icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

const ENTITY_ICONS: Record<string, React.ElementType> = {
    project: Film,
    scene: FileText,
    shot: Image,
    asset: Palette,
    export: Download,
    review_link: Share2,
    comment: MessageSquare,
};

export default function ActivityLog({ projectId, limit = 50, showFilters = true }: ActivityLogProps) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterEntity, setFilterEntity] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                let url = '/api/activity';
                const params = new URLSearchParams();
                if (projectId) params.append('project_id', projectId);
                if (limit) params.append('limit', limit.toString());
                if (params.toString()) url += `?${params}`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setActivities(data);
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [projectId, limit]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredActivities = activities.filter(a => {
        if (filterType !== 'all' && a.type !== filterType) return false;
        if (filterEntity !== 'all' && a.entity_type !== filterEntity) return false;
        return true;
    });

    // Group activities by date
    const groupedActivities = filteredActivities.reduce((acc, activity) => {
        const date = new Date(activity.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        return acc;
    }, {} as Record<string, ActivityItem[]>);

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-yellow-500" />
                            Activity Log
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {activities.length} activities
                        </p>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="flex items-center gap-3">
                        <Filter size={14} className="text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                        >
                            <option value="all">All Actions</option>
                            <option value="create">Created</option>
                            <option value="update">Updated</option>
                            <option value="delete">Deleted</option>
                            <option value="generate">Generated</option>
                            <option value="export">Exported</option>
                            <option value="share">Shared</option>
                            <option value="comment">Comments</option>
                        </select>

                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="project">Projects</option>
                            <option value="scene">Scenes</option>
                            <option value="shot">Shots</option>
                            <option value="asset">Assets</option>
                            <option value="export">Exports</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-20">
                        <Clock className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                            <div key={date}>
                                <h3 className="text-sm font-medium text-gray-500 mb-4">{date}</h3>
                                <div className="space-y-3">
                                    {dayActivities.map((activity) => {
                                        const actionConfig = ACTION_CONFIG[activity.type] || ACTION_CONFIG.update;
                                        const ActionIcon = actionConfig.icon;
                                        const EntityIcon = ENTITY_ICONS[activity.entity_type] || FileText;

                                        return (
                                            <div
                                                key={activity.id}
                                                className="bg-[#121212] border border-white/5 rounded-xl p-4"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Action Icon */}
                                                    <div className={`p-2 rounded-xl ${actionConfig.bg} ${actionConfig.color}`}>
                                                        <ActionIcon size={18} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {/* User */}
                                                            <div className="flex items-center gap-2">
                                                                {activity.user_avatar ? (
                                                                    <img
                                                                        src={activity.user_avatar}
                                                                        alt={activity.user_name}
                                                                        className="w-5 h-5 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                                        <User size={12} className="text-yellow-500" />
                                                                    </div>
                                                                )}
                                                                <span className="text-sm font-medium text-white">
                                                                    {activity.user_name}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-600">•</span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatTimeAgo(activity.created_at)}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-300">
                                                            {activity.description}
                                                        </p>

                                                        {/* Entity Reference */}
                                                        {activity.entity_name && (
                                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                                <EntityIcon size={12} />
                                                                <span>{activity.entity_name}</span>
                                                            </div>
                                                        )}

                                                        {/* Metadata */}
                                                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                                            <button
                                                                onClick={() => setExpandedId(
                                                                    expandedId === activity.id ? null : activity.id
                                                                )}
                                                                className="mt-2 text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1"
                                                            >
                                                                <ChevronDown
                                                                    size={12}
                                                                    className={`transition-transform ${
                                                                        expandedId === activity.id ? 'rotate-180' : ''
                                                                    }`}
                                                                />
                                                                Details
                                                            </button>
                                                        )}

                                                        {expandedId === activity.id && activity.metadata && (
                                                            <div className="mt-2 p-2 bg-black/50 rounded-lg text-xs text-gray-500 font-mono">
                                                                {JSON.stringify(activity.metadata, null, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact version for sidebars
export function ActivityLogCompact({ projectId, limit = 5 }: { projectId?: string; limit?: number }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            let url = `/api/activity?limit=${limit}`;
            if (projectId) url += `&project_id=${projectId}`;
            
            try {
                const res = await fetch(url);
                if (res.ok) {
                    setActivities(await res.json());
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        fetchActivities();
    }, [projectId, limit]);

    if (activities.length === 0) return null;

    return (
        <div className="space-y-2">
            {activities.map((activity) => {
                const config = ACTION_CONFIG[activity.type] || ACTION_CONFIG.update;
                const Icon = config.icon;

                return (
                    <div
                        key={activity.id}
                        className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"
                    >
                        <div className={`p-1 rounded ${config.color}`}>
                            <Icon size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{activity.description}</p>
                            <p className="text-[10px] text-gray-500">{activity.user_name}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
