'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText, Search, Filter, Download, RefreshCw, Clock, User, Settings,
    Shield, AlertTriangle, CheckCircle, Eye, ChevronDown, X, Loader2,
    Calendar, ArrowUpRight
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AuditLogEntry {
    id: string;
    timestamp: string;
    user_id?: string;
    user_email?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LogsPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [resourceFilter, setResourceFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

    // Fetch logs
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (actionFilter) params.set('action', actionFilter);
            if (resourceFilter) params.set('resource_type', resourceFilter);
            params.set('limit', '100');
            
            const res = await fetch(`/api/admin/audit-log?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, resourceFilter]);

    // Filter logs by date
    const filteredLogs = logs.filter(log => {
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesSearch = 
                log.action.toLowerCase().includes(q) ||
                log.user_email?.toLowerCase().includes(q) ||
                log.resource_type.toLowerCase().includes(q) ||
                JSON.stringify(log.details).toLowerCase().includes(q);
            if (!matchesSearch) return false;
        }
        
        // Date filter
        if (dateFilter !== 'all') {
            const logDate = new Date(log.timestamp);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    return logDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return logDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return logDate >= monthAgo;
            }
        }
        
        return true;
    });

    // Get unique values for filters
    const uniqueActions = [...new Set(logs.map(l => l.action.split('.')[0]))];
    const uniqueResources = [...new Set(logs.map(l => l.resource_type))];

    // Action type colors and icons
    const getActionStyle = (action: string) => {
        if (action.includes('create') || action.includes('add')) {
            return { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle };
        }
        if (action.includes('delete') || action.includes('remove') || action.includes('suspend')) {
            return { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle };
        }
        if (action.includes('update') || action.includes('adjust')) {
            return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Settings };
        }
        if (action.includes('activate')) {
            return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Shield };
        }
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: FileText };
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleExport = () => {
        const csvContent = [
            ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Details'].join(','),
            ...filteredLogs.map(log => [
                log.timestamp,
                log.user_email || '',
                log.action,
                log.resource_type,
                log.resource_id || '',
                JSON.stringify(log.details).replace(/,/g, ';')
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                    <p className="text-sm text-gray-500">Track all administrative actions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <Download size={14} />
                        Export
                    </button>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Logs</p>
                    <p className="text-2xl font-bold text-white">{logs.length}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Today</p>
                    <p className="text-2xl font-bold text-white">
                        {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
                    </p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">This Week</p>
                    <p className="text-2xl font-bold text-white">
                        {logs.filter(l => new Date(l.timestamp) >= new Date(Date.now() - 7 * 86400000)).length}
                    </p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Unique Actions</p>
                    <p className="text-2xl font-bold text-white">{uniqueActions.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    />
                </div>
                
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="">All Actions</option>
                    {uniqueActions.map(action => (
                        <option key={action} value={action}>{action}</option>
                    ))}
                </select>
                
                <select
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="">All Resources</option>
                    {uniqueResources.map(resource => (
                        <option key={resource} value={resource}>{resource}</option>
                    ))}
                </select>
                
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Timestamp</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">User</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Action</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Resource</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Details</th>
                            <th className="p-4 text-right text-xs text-gray-500 font-medium">View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading logs...
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No logs found
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => {
                                const style = getActionStyle(log.action);
                                const Icon = style.icon;
                                
                                return (
                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock size={12} />
                                                <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-1">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <User size={14} className="text-gray-400" />
                                                </div>
                                                <span className="text-sm text-white">{log.user_email || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                                                <Icon size={12} />
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-300">{log.resource_type}</span>
                                            {log.resource_id && (
                                                <p className="text-[10px] text-gray-600 font-mono">{log.resource_id}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-400 max-w-xs truncate">
                                                {Object.keys(log.details).length > 0 
                                                    ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                                                    : '-'
                                                }
                                            </p>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Log Details</h3>
                                <p className="text-sm text-gray-500">ID: {selectedLog.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Timestamp</label>
                                    <p className="text-white mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">User</label>
                                    <p className="text-white mt-1">{selectedLog.user_email || 'System'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Action</label>
                                    <p className="text-white mt-1">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Resource Type</label>
                                    <p className="text-white mt-1">{selectedLog.resource_type}</p>
                                </div>
                                {selectedLog.resource_id && (
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider">Resource ID</label>
                                        <p className="text-white mt-1 font-mono">{selectedLog.resource_id}</p>
                                    </div>
                                )}
                                {selectedLog.ip_address && (
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider">IP Address</label>
                                        <p className="text-white mt-1 font-mono">{selectedLog.ip_address}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Details</label>
                                <pre className="mt-2 p-4 bg-black/50 rounded-lg text-sm text-gray-300 overflow-x-auto">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
