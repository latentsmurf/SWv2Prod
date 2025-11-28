'use client';

import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Mail, Shield, Edit, Trash2, X, Loader2,
    Check, Clock, Crown, Eye, Pencil, UserPlus, Settings,
    ChevronDown, Copy, MoreVertical
} from 'lucide-react';

interface TeamMember {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: 'active' | 'pending' | 'inactive';
    joined_at?: string;
    last_active?: string;
}

interface Invitation {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    invited_by: string;
    created_at: string;
    expires_at: string;
}

interface TeamManagementProps {
    projectId?: string;
    isGlobal?: boolean;
}

const ROLE_CONFIG = {
    owner: { label: 'Owner', icon: Crown, color: 'text-yellow-400', description: 'Full access, can delete project' },
    admin: { label: 'Admin', icon: Shield, color: 'text-purple-400', description: 'Can manage team and settings' },
    editor: { label: 'Editor', icon: Pencil, color: 'text-blue-400', description: 'Can edit content' },
    viewer: { label: 'Viewer', icon: Eye, color: 'text-gray-400', description: 'Read-only access' }
};

export default function TeamManagement({ projectId, isGlobal = false }: TeamManagementProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
    const [inviting, setInviting] = useState(false);
    const [editingMember, setEditingMember] = useState<string | null>(null);

    // Fetch team members
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const url = projectId
                    ? `/api/projects/${projectId}/team`
                    : '/api/team';

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data.members || []);
                    setInvitations(data.invitations || []);
                }
            } catch (error) {
                console.error('Error fetching team:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [projectId]);

    // Send invitation
    const sendInvitation = async () => {
        if (!inviteEmail.trim()) return;

        setInviting(true);
        try {
            const url = projectId
                ? `/api/projects/${projectId}/team/invite`
                : '/api/team/invite';

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail,
                    role: inviteRole
                })
            });

            if (res.ok) {
                const invitation = await res.json();
                setInvitations(prev => [...prev, invitation]);
                setShowInviteModal(false);
                setInviteEmail('');
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
        } finally {
            setInviting(false);
        }
    };

    // Update member role
    const updateRole = async (memberId: string, newRole: TeamMember['role']) => {
        try {
            const url = projectId
                ? `/api/projects/${projectId}/team/${memberId}`
                : `/api/team/${memberId}`;

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setMembers(prev =>
                    prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
                );
            }
        } catch (error) {
            console.error('Error updating role:', error);
        }
        setEditingMember(null);
    };

    // Remove member
    const removeMember = async (memberId: string) => {
        if (!confirm('Remove this team member?')) return;

        try {
            const url = projectId
                ? `/api/projects/${projectId}/team/${memberId}`
                : `/api/team/${memberId}`;

            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                setMembers(prev => prev.filter(m => m.id !== memberId));
            }
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    // Cancel invitation
    const cancelInvitation = async (invitationId: string) => {
        try {
            const url = projectId
                ? `/api/projects/${projectId}/team/invitations/${invitationId}`
                : `/api/team/invitations/${invitationId}`;

            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                setInvitations(prev => prev.filter(i => i.id !== invitationId));
            }
        } catch (error) {
            console.error('Error canceling invitation:', error);
        }
    };

    // Copy invite link
    const copyInviteLink = (invitationId: string) => {
        const link = `${window.location.origin}/invite/${invitationId}`;
        navigator.clipboard.writeText(link);
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-yellow-500" />
                        {isGlobal ? 'Team' : 'Project Team'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage team members and permissions
                    </p>
                </div>

                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl"
                >
                    <UserPlus size={18} />
                    Invite Member
                </button>
            </div>

            {/* Members List */}
            <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h3 className="font-medium text-white">
                        Members ({members.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="mx-auto animate-spin text-yellow-500" size={24} />
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="mx-auto text-gray-600 mb-2" size={32} />
                        <p className="text-gray-500">No team members yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {members.map((member) => {
                            const roleConfig = ROLE_CONFIG[member.role];
                            const RoleIcon = roleConfig.icon;

                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-4">
                                        {member.avatar_url ? (
                                            <img
                                                src={member.avatar_url}
                                                alt={member.name}
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{member.name}</p>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Role Badge */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                                                disabled={member.role === 'owner'}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                                    member.role === 'owner'
                                                        ? 'bg-yellow-500/10 cursor-default'
                                                        : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                            >
                                                <RoleIcon size={14} className={roleConfig.color} />
                                                <span className={`text-sm ${roleConfig.color}`}>
                                                    {roleConfig.label}
                                                </span>
                                                {member.role !== 'owner' && (
                                                    <ChevronDown size={14} className="text-gray-500" />
                                                )}
                                            </button>

                                            {/* Role Dropdown */}
                                            {editingMember === member.id && member.role !== 'owner' && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                                                    {(['admin', 'editor', 'viewer'] as const).map((role) => {
                                                        const config = ROLE_CONFIG[role];
                                                        const Icon = config.icon;
                                                        return (
                                                            <button
                                                                key={role}
                                                                onClick={() => updateRole(member.id, role)}
                                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 ${
                                                                    member.role === role ? 'bg-white/5' : ''
                                                                }`}
                                                            >
                                                                <Icon size={16} className={config.color} />
                                                                <div className="text-left">
                                                                    <p className="text-sm text-white">{config.label}</p>
                                                                    <p className="text-xs text-gray-500">{config.description}</p>
                                                                </div>
                                                                {member.role === role && (
                                                                    <Check size={14} className="ml-auto text-green-400" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        {member.status === 'pending' && (
                                            <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded">
                                                Pending
                                            </span>
                                        )}

                                        {/* Actions */}
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => removeMember(member.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-medium text-white flex items-center gap-2">
                            <Mail className="text-gray-500" size={18} />
                            Pending Invitations ({invitations.length})
                        </h3>
                    </div>

                    <div className="divide-y divide-white/5">
                        {invitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                        <Mail className="text-gray-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white">{invitation.email}</p>
                                        <p className="text-xs text-gray-500">
                                            Invited {formatTime(invitation.created_at)} • Expires {formatTime(invitation.expires_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-sm ${ROLE_CONFIG[invitation.role].color}`}>
                                        {ROLE_CONFIG[invitation.role].label}
                                    </span>
                                    <button
                                        onClick={() => copyInviteLink(invitation.id)}
                                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                                        title="Copy invite link"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => cancelInvitation(invitation.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Invite Team Member</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Role</label>
                                <div className="space-y-2">
                                    {(['admin', 'editor', 'viewer'] as const).map((role) => {
                                        const config = ROLE_CONFIG[role];
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={role}
                                                onClick={() => setInviteRole(role)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                                    inviteRole === role
                                                        ? 'border-yellow-500 bg-yellow-500/10'
                                                        : 'border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <Icon size={18} className={config.color} />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-white">{config.label}</p>
                                                    <p className="text-xs text-gray-500">{config.description}</p>
                                                </div>
                                                {inviteRole === role && (
                                                    <Check size={18} className="ml-auto text-yellow-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendInvitation}
                                disabled={!inviteEmail.trim() || inviting}
                                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl disabled:opacity-50"
                            >
                                {inviting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Mail size={18} />
                                )}
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
