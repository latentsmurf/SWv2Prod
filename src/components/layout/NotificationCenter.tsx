'use client';

import React, { useState, useEffect } from 'react';
import {
    Bell, X, Check, Loader2, Image, Video, Music, Download,
    AlertTriangle, CheckCircle, Clock, Trash2, Eye, ExternalLink
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'render' | 'export' | 'generation' | 'comment' | 'system' | 'error';
    title: string;
    message: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress?: number;
    project_id?: string;
    project_name?: string;
    action_url?: string;
    created_at: string;
    read: boolean;
}

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchNotifications();
            // Poll for updates
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    // Mark as read
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Clear all
    const clearAll = async () => {
        try {
            await fetch('/api/notifications/clear', { method: 'DELETE' });
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'render': return Image;
            case 'export': return Download;
            case 'generation': return Video;
            case 'comment': return Bell;
            case 'error': return AlertTriangle;
            default: return Bell;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400';
            case 'failed': return 'text-red-400';
            case 'in_progress': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const filteredNotifications = notifications.filter(n => 
        filter === 'all' || !n.read
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div 
                className="absolute right-4 top-16 w-96 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="text-yellow-500" size={18} />
                        <span className="font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-gray-500 hover:text-white"
                        >
                            Mark all read
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-500 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-white/5">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-2 text-sm ${
                            filter === 'all' 
                                ? 'text-white border-b-2 border-yellow-500' 
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex-1 py-2 text-sm ${
                            filter === 'unread' 
                                ? 'text-white border-b-2 border-yellow-500' 
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-yellow-500" size={24} />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="mx-auto text-gray-600 mb-2" size={32} />
                            <p className="text-gray-500 text-sm">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {filteredNotifications.map((notification) => {
                                const Icon = getTypeIcon(notification.type);
                                
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                                            !notification.read ? 'bg-yellow-500/5' : ''
                                        }`}
                                        onClick={() => {
                                            markAsRead(notification.id);
                                            if (notification.action_url) {
                                                window.location.href = notification.action_url;
                                            }
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`p-2 rounded-lg ${
                                                notification.status === 'failed' 
                                                    ? 'bg-red-500/10' 
                                                    : notification.status === 'completed'
                                                    ? 'bg-green-500/10'
                                                    : 'bg-white/5'
                                            }`}>
                                                {notification.status === 'in_progress' ? (
                                                    <Loader2 size={16} className="animate-spin text-yellow-400" />
                                                ) : notification.status === 'completed' ? (
                                                    <CheckCircle size={16} className="text-green-400" />
                                                ) : notification.status === 'failed' ? (
                                                    <AlertTriangle size={16} className="text-red-400" />
                                                ) : (
                                                    <Icon size={16} className="text-gray-400" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                
                                                {/* Progress Bar */}
                                                {notification.status === 'in_progress' && notification.progress !== undefined && (
                                                    <div className="mt-2">
                                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-yellow-500 transition-all"
                                                                style={{ width: `${notification.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-gray-500">
                                                            {notification.progress}%
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] text-gray-600">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                    {notification.project_name && (
                                                        <span className="text-[10px] text-gray-600">
                                                            • {notification.project_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-white/5 bg-white/5">
                        <button
                            onClick={clearAll}
                            className="w-full text-center text-xs text-gray-500 hover:text-white"
                        >
                            Clear all notifications
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Bell Icon with Badge for Header
export function NotificationBell({ onClick }: { onClick: () => void }) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await fetch('/api/notifications/unread-count');
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <button
            onClick={onClick}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
}
