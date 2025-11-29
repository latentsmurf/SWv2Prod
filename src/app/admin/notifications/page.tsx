'use client';

import React, { useState, useEffect } from 'react';
import {
    Bell, Search, Filter, Check, CheckCheck, Trash2, RefreshCw, Loader2,
    AlertTriangle, Info, CheckCircle, XCircle, Users, CreditCard, Zap,
    FolderOpen, Settings, Shield, Clock, MoreHorizontal, X, Eye
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AdminNotification {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    category: 'users' | 'payments' | 'system' | 'security' | 'projects' | 'ai';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    action_url?: string;
    metadata?: Record<string, any>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_NOTIFICATIONS: AdminNotification[] = [
    {
        id: '1',
        type: 'warning',
        category: 'payments',
        title: 'Payment Failed',
        message: 'Payment for user emma@prod.co failed. Card declined.',
        read: false,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        action_url: '/admin/users?search=emma@prod.co',
        metadata: { user_id: 'user-4', amount: 29 }
    },
    {
        id: '2',
        type: 'success',
        category: 'users',
        title: 'New Enterprise Signup',
        message: 'Warner Bros Studios signed up for Enterprise plan.',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        action_url: '/admin/memberships',
        metadata: { plan: 'enterprise', mrr_increase: 499 }
    },
    {
        id: '3',
        type: 'error',
        category: 'ai',
        title: 'API Rate Limit Exceeded',
        message: 'OpenAI API rate limit reached. Some generations may be delayed.',
        read: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        action_url: '/admin/health',
    },
    {
        id: '4',
        type: 'info',
        category: 'system',
        title: 'Scheduled Maintenance',
        message: 'Database maintenance scheduled for tonight at 2 AM UTC.',
        read: true,
        created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
        id: '5',
        type: 'warning',
        category: 'security',
        title: 'Suspicious Login Attempt',
        message: 'Multiple failed login attempts detected for admin@sceneweaver.ai',
        read: true,
        created_at: new Date(Date.now() - 28800000).toISOString(),
        action_url: '/admin/logs',
        metadata: { ip: '192.168.1.100', attempts: 5 }
    },
    {
        id: '6',
        type: 'success',
        category: 'projects',
        title: 'Project Milestone',
        message: '1000 projects created this month - new record!',
        read: true,
        created_at: new Date(Date.now() - 43200000).toISOString(),
        action_url: '/admin/analytics',
    },
    {
        id: '7',
        type: 'info',
        category: 'users',
        title: 'User Report',
        message: 'Weekly user report is ready for review.',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        action_url: '/admin/analytics',
    },
    {
        id: '8',
        type: 'warning',
        category: 'ai',
        title: 'High Credit Usage',
        message: 'User netflix@partner.com used 50,000 credits today.',
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        action_url: '/admin/credits',
        metadata: { user_id: 'user-3', credits: 50000 }
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_NOTIFICATIONS);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread' && n.read) return false;
        if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
        return true;
    });

    // Stats
    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark as read
    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Delete notification
    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Clear all read
    const clearAllRead = () => {
        if (!confirm('Delete all read notifications?')) return;
        setNotifications(prev => prev.filter(n => !n.read));
    };

    // Get icon for notification type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-400" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
            case 'error': return <XCircle size={16} className="text-red-400" />;
            default: return <Info size={16} className="text-blue-400" />;
        }
    };

    // Get icon for category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'users': return <Users size={14} />;
            case 'payments': return <CreditCard size={14} />;
            case 'system': return <Settings size={14} />;
            case 'security': return <Shield size={14} />;
            case 'projects': return <FolderOpen size={14} />;
            case 'ai': return <Zap size={14} />;
            default: return <Bell size={14} />;
        }
    };

    // Format time ago
    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    <p className="text-sm text-gray-500">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={clearAllRead}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <Trash2 size={14} />
                        Clear read
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-white">{notifications.length}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Unread</p>
                    <p className="text-2xl font-bold text-yellow-400">{unreadCount}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Warnings</p>
                    <p className="text-2xl font-bold text-orange-400">
                        {notifications.filter(n => n.type === 'warning').length}
                    </p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Errors</p>
                    <p className="text-2xl font-bold text-red-400">
                        {notifications.filter(n => n.type === 'error').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                            filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                            filter === 'unread' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Unread
                    </button>
                </div>
                
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                >
                    <option value="all">All Categories</option>
                    <option value="users">Users</option>
                    <option value="payments">Payments</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="projects">Projects</option>
                    <option value="ai">AI</option>
                </select>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Bell size={40} className="mx-auto mb-4 opacity-50" />
                        <p>No notifications</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-[#0a0a0a] border rounded-xl p-4 transition-colors cursor-pointer hover:border-white/20 ${
                                notification.read ? 'border-white/5' : 'border-yellow-500/30 bg-yellow-500/5'
                            }`}
                            onClick={() => {
                                markAsRead(notification.id);
                                setSelectedNotification(notification);
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                    notification.type === 'success' ? 'bg-green-500/10' :
                                    notification.type === 'warning' ? 'bg-yellow-500/10' :
                                    notification.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                                }`}>
                                    {getTypeIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.read && (
                                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            {getCategoryIcon(notification.category)}
                                            {notification.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-600">
                                            <Clock size={12} />
                                            {formatTimeAgo(notification.created_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {!notification.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification.id);
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getTypeIcon(selectedNotification.type)}
                                <h3 className="text-lg font-bold text-white">{selectedNotification.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-gray-300">{selectedNotification.message}</p>
                            
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-gray-500">
                                    {getCategoryIcon(selectedNotification.category)}
                                    {selectedNotification.category}
                                </span>
                                <span className="text-gray-600">
                                    {new Date(selectedNotification.created_at).toLocaleString()}
                                </span>
                            </div>
                            
                            {selectedNotification.metadata && (
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-2">Additional Info</p>
                                    <pre className="text-sm text-gray-300 overflow-x-auto">
                                        {JSON.stringify(selectedNotification.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                Close
                            </button>
                            {selectedNotification.action_url && (
                                <a
                                    href={selectedNotification.action_url}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
                                >
                                    View Details
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
