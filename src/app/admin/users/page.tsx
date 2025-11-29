'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Plus, MoreHorizontal, Coins, Shield, Ban, CheckCircle,
    Mail, Calendar, CreditCard, TrendingUp, TrendingDown, Download, RefreshCw,
    Eye, Edit2, Trash2, UserPlus, X, Loader2, ChevronDown
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'pro' | 'studio' | 'enterprise' | 'admin';
    status: 'active' | 'suspended' | 'pending';
    credits: number;
    total_spent: number;
    projects_count: number;
    created_at: string;
    last_login?: string;
    subscription?: {
        plan: string;
        status: 'active' | 'cancelled' | 'past_due';
        started_at: string;
        next_billing: string;
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [creditAmount, setCreditAmount] = useState(0);
    const [creditReason, setCreditReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter !== 'all') params.set('role', roleFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (searchQuery) params.set('search', searchQuery);
            
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // User actions
    const handleSuspendUser = async (userId: string) => {
        if (!confirm('Are you sure you want to suspend this user?')) return;
        
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'suspend', userId, reason: 'Admin action' })
            });
            
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error suspending user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivateUser = async (userId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'activate', userId })
            });
            
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error activating user:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_role', userId, role: newRole })
            });
            
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error changing role:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdjustCredits = async () => {
        if (!selectedUser || creditAmount === 0) return;
        
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'adjust_credits', 
                    userId: selectedUser.id, 
                    amount: creditAmount,
                    reason: creditReason || 'Admin adjustment'
                })
            });
            
            if (res.ok) {
                fetchUsers();
                setShowCreditsModal(false);
                setCreditAmount(0);
                setCreditReason('');
            }
        } catch (error) {
            console.error('Error adjusting credits:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
        if (selectedUsers.length === 0) return;
        if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) return;
        
        setActionLoading(true);
        try {
            for (const userId of selectedUsers) {
                await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, userId })
                });
            }
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            console.error('Error performing bulk action:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['ID', 'Email', 'Name', 'Role', 'Status', 'Credits', 'Total Spent', 'Projects', 'Created At'].join(','),
            ...users.map(u => [
                u.id, u.email, u.name, u.role, u.status, u.credits, u.total_spent, u.projects_count, u.created_at
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        a.click();
    };

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        totalCredits: users.reduce((sum, u) => sum + u.credits, 0),
        totalSpent: users.reduce((sum, u) => sum + u.total_spent, 0),
    };

    const roleColors: Record<string, string> = {
        user: 'bg-gray-500/20 text-gray-400',
        pro: 'bg-blue-500/20 text-blue-400',
        studio: 'bg-purple-500/20 text-purple-400',
        enterprise: 'bg-yellow-500/20 text-yellow-400',
        admin: 'bg-red-500/20 text-red-400',
    };

    const statusColors: Record<string, string> = {
        active: 'bg-green-500/20 text-green-400',
        suspended: 'bg-red-500/20 text-red-400',
        pending: 'bg-yellow-500/20 text-yellow-400',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-sm text-gray-500">Manage users, roles, and credits</p>
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
                        onClick={() => fetchUsers()}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Suspended</p>
                    <p className="text-2xl font-bold text-red-400">{stats.suspended}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Credits</p>
                    <p className="text-2xl font-bold text-white">{stats.totalCredits.toLocaleString()}</p>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${stats.totalSpent.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                    />
                </div>
                
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="pro">Pro</option>
                    <option value="studio">Studio</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="admin">Admin</option>
                </select>
                
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                </select>

                {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-400">{selectedUsers.length} selected</span>
                        <button
                            onClick={() => handleBulkAction('activate')}
                            className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                        >
                            Activate
                        </button>
                        <button
                            onClick={() => handleBulkAction('suspend')}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                        >
                            Suspend
                        </button>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="p-4 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedUsers(users.map(u => u.id));
                                        } else {
                                            setSelectedUsers([]);
                                        }
                                    }}
                                    className="rounded"
                                />
                            </th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">User</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Role</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Status</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Credits</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Projects</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Total Spent</th>
                            <th className="p-4 text-left text-xs text-gray-500 font-medium">Joined</th>
                            <th className="p-4 text-right text-xs text-gray-500 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers([...selectedUsers, user.id]);
                                                } else {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                }
                                            }}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-mono">{user.credits.toLocaleString()}</td>
                                    <td className="p-4 text-gray-400">{user.projects_count}</td>
                                    <td className="p-4 text-white">${user.total_spent.toLocaleString()}</td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowCreditsModal(true);
                                                }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                title="Adjust Credits"
                                            >
                                                <Coins size={14} />
                                            </button>
                                            {user.status === 'active' ? (
                                                <button
                                                    onClick={() => handleSuspendUser(user.id)}
                                                    className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                    title="Suspend User"
                                                >
                                                    <Ban size={14} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivateUser(user.id)}
                                                    className="p-1.5 hover:bg-green-500/20 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                                                    title="Activate User"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                                            >
                                                <option value="user">User</option>
                                                <option value="pro">Pro</option>
                                                <option value="studio">Studio</option>
                                                <option value="enterprise">Enterprise</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Credits Modal */}
            {showCreditsModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Adjust Credits</h3>
                                <button
                                    onClick={() => {
                                        setShowCreditsModal(false);
                                        setCreditAmount(0);
                                        setCreditReason('');
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {selectedUser.name} ({selectedUser.email})
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Current balance: <span className="text-white font-mono">{selectedUser.credits.toLocaleString()}</span>
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                                    placeholder="Enter amount (positive to add, negative to remove)"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use negative values to deduct credits
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Reason</label>
                                <input
                                    type="text"
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    placeholder="e.g., Promotional bonus, Refund, etc."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                            </div>
                            
                            {creditAmount !== 0 && (
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <p className="text-sm text-gray-400">
                                        New balance: <span className={`font-mono ${creditAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {(selectedUser.credits + creditAmount).toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreditsModal(false);
                                    setCreditAmount(0);
                                    setCreditReason('');
                                }}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdjustCredits}
                                disabled={creditAmount === 0 || actionLoading}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 text-black font-semibold rounded-lg flex items-center gap-2"
                            >
                                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
